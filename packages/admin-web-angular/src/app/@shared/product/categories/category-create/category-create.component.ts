import { Component, OnDestroy }    from '@angular/core';
import { NgbActiveModal }          from '@ng-bootstrap/ng-bootstrap';
import { TranslateService }        from '@ngx-translate/core';
import { Subject }                 from 'rxjs';
import { first }                   from 'rxjs/operators';
import { ILocaleMember }           from '@modules/server.common/interfaces/ILocale';
import { ProductLocalesService }   from '@modules/client.common.angular2/locale/product-locales.service';
import { ProductsCategoryService } from '@app/@core/data/productsCategory.service';
import { NotifyService }           from '@app/@core/services/notify/notify.service';

@Component({
	           selector:    'ea-category-create',
	           styleUrls:   ['./category-create.component.scss'],
	           templateUrl: './category-create.component.html',
           })
export class CategoryCreateComponent implements OnDestroy
{
	public productId: any;
	public customerId: any;
	public loading: boolean;
	public storybookVersion: boolean;
	
	private _ngDestroy$ = new Subject<void>();
	
	constructor(
			private readonly activeModal: NgbActiveModal,
			private readonly _productLocalesService: ProductLocalesService,
			private readonly _translateService: TranslateService,
			private readonly _notifyService: NotifyService,
			private readonly _productsCategoryService: ProductsCategoryService
	)
	{}
	
	public ngOnDestroy()
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	public cancel()
	{
		this.activeModal.dismiss('canceled');
	}
	
	public async createCategory(createObject): Promise<boolean>
	{
		if(this.storybookVersion)
		{
			this._notifyService.success(
					'Category ' +
					this.localeTranslate(createObject.name) +
					' is added'
			);
			return true;
		}
		try
		{
			this.loading = true;
			await this._productsCategoryService
			          .create(createObject)
			          .pipe(first())
			          .toPromise();
			this.loading = false;
			const message = `Category ${this.localeTranslate(
					createObject.name
			)} is added!`;
			this._notifyService.success(message);
			this.cancel();
		} catch(err)
		{
			this.loading = false;
			const message = `Something went wrong!`;
			this._notifyService.error(message);
		}
	}
	
	public localeTranslate(member: ILocaleMember[]): string
	{
		return this._productLocalesService.getTranslate(member);
	}
}
