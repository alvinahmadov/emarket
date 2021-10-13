import { Component, OnInit, ViewChild }        from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbActiveModal }                      from '@ng-bootstrap/ng-bootstrap';
import { TranslateService }                    from '@ngx-translate/core';
import { first }                               from 'rxjs/operators';
import { IProductCreateObject }                from '@modules/server.common/interfaces/IProduct';
import { ProductsService }                     from '@app/@core/data/products.service';
import { NotifyService }                       from '@app/@core/services/notify/notify.service';
import { BasicInfoFormComponent }              from '../forms';

@Component({
	           selector:    'ea-product-create',
	           styleUrls:   ['./product-create.component.scss'],
	           templateUrl: './product-create.component.html',
           })
export class ProductCreateComponent implements OnInit
{
	@ViewChild('basicInfoForm', { static: true })
	public basicInfoForm: BasicInfoFormComponent;
	
	public loading: boolean;
	public productsCategories: any;
	public buttons = {
		done: 'BUTTON_DONE',
		next: 'BUTTON_NEXT',
		prev: 'BUTTON_PREV'
	}
	
	public readonly form: FormGroup = this._formBuilder.group(
			{
				basicInfo: BasicInfoFormComponent.buildForm(this._formBuilder),
			}
	);
	
	public readonly basicInfo = this.form.get('basicInfo') as FormControl;
	
	constructor(
			private readonly _activeModal: NgbActiveModal,
			private readonly _formBuilder: FormBuilder,
			private readonly _productsService: ProductsService,
			private readonly _translateService: TranslateService,
			private readonly _notifyService: NotifyService
	)
	{}
	
	public ngOnInit()
	{
		this.basicInfoForm.productCategories = this.productsCategories;
	}
	
	public get buttonDone()
	{
		return this._translate(this.buttons.done);
	}
	
	public get buttonNext()
	{
		return this._translate(this.buttons.next);
	}
	
	public get buttonPrev()
	{
		return this._translate(this.buttons.prev);
	}
	
	public async createProduct()
	{
		if(this.basicInfo.valid)
		{
			const productCreateObject: IProductCreateObject = await this.basicInfoForm.setupProductCreateObject();
			
			try
			{
				this.loading = true;
				await this._productsService
				          .create(productCreateObject)
				          .pipe(first())
				          .toPromise();
				this.loading = false;
				const message = `Product ${productCreateObject.title[0].value} is created`;
				
				this._notifyService.success(message);
				this.cancelModal();
			} catch(error)
			{
				const message = `Something went wrong!`;
				this.loading = false;
				this._notifyService.error(message);
				this.cancelModal();
			}
		}
	}
	
	public cancelModal()
	{
		this._activeModal.dismiss('canceled');
	}
	
	private _translate(key: string): string
	{
		let translationResult = '';
		
		this._translateService.get(key)
		    .subscribe((res) => translationResult = res);
		
		return translationResult;
	}
}
