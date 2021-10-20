import {
	Component,
	EventEmitter,
	Output,
	ViewChild,
	Input,
}                                              from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { first }                               from 'rxjs/operators';
import { IProductCreateObject }                from '@modules/server.common/interfaces/IProduct';
import Product                                 from '@modules/server.common/entities/Product';
import ProductsCategory                        from '@modules/server.common/entities/ProductsCategory';
import { ProductLocalesService }               from '@modules/client.common.angular2/locale/product-locales.service';
import { ProductsCategoryService }             from '@app/@core/data/productsCategory.service';
import { ProductsService }                     from '@app/@core/data/products.service';
import { BasicInfoFormComponent }              from '@app/@shared/product/forms/basic-info/basic-info-form.component';
import { ProductViewModel }                    from '@app/pages/+simulation/products/products.component';

@Component({
	           selector:    'ea-merchants-setup-product-mutation',
	           templateUrl: './product-mutation.component.html',
           })
export class SetupMerchantProductMutationComponent
{
	@ViewChild('basicInfoForm', { static: true })
	public basicInfoForm: BasicInfoFormComponent;
	
	@Output()
	public onCreate: EventEmitter<ProductViewModel> = new EventEmitter();
	
	@Output()
	public onEdit: EventEmitter<boolean> = new EventEmitter();
	
	@Input()
	public product: Product;
	
	public productsCategories: ProductsCategory[];
	public areCategoriesLoaded: boolean = false;
	
	public readonly form: FormGroup = this._formBuilder.group({
		                                                          basicInfo: BasicInfoFormComponent.buildForm(this._formBuilder),
	                                                          });
	
	public readonly basicInfo = this.form.get('basicInfo') as FormControl;
	
	constructor(
			private readonly _formBuilder: FormBuilder,
			private readonly _productsService: ProductsService,
			private readonly _productLocalesService: ProductLocalesService,
			private readonly _productsCategoryService: ProductsCategoryService
	)
	{
		this.loadProductCategories();
	}
	
	public async loadProductCategories()
	{
		try
		{
			this.productsCategories = await this._productsCategoryService
			                                    .getCategories()
			                                    .pipe(first())
			                                    .toPromise();
		} catch(error)
		{
			console.warn(
					`Error during load product categories. message: ${error.message}`
			);
		}
		
		this.areCategoriesLoaded = true;
	}
	
	public async create()
	{
		const productCreateObject: IProductCreateObject = await this.basicInfoForm.setupProductCreateObject();
		try
		{
			const product = await this._productsService
			                          .create(productCreateObject)
			                          .pipe(first())
			                          .toPromise();
			
			this.onCreate.emit({
				                   id:    product.id,
				                   title: this._productLocalesService.getMemberValue(
						                   product.title
				                   ),
				                   image: this._productLocalesService.getMemberValue(
						                   product.images
				                   ),
			                   });
		} catch(error)
		{
			console.error(error.message);
		}
	}
	
	public async save()
	{
		try
		{
			const res = await this.basicInfoForm.setupProductCreateObject();
			await this._productsService
			          .save({
				                _id: this.product._id,
				                ...res,
			                } as Product)
			          .pipe(first())
			          .toPromise();
			
			this.onEdit.emit(true);
		} catch(error)
		{
			console.error(error.message);
		}
	}
}
