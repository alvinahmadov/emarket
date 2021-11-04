import { Component, OnDestroy, ViewChild } from '@angular/core';
import { NgbModal }                        from '@ng-bootstrap/ng-bootstrap';
import { Subject }                         from 'rxjs';
import { takeUntil }                       from 'rxjs/operators';
import { LocalDataSource }                 from 'ng2-smart-table';
import ProductsCategory                    from '@modules/server.common/entities/ProductsCategory';
import { ProductsCategoryService }         from '@app/@core/data/productsCategory.service';
import { NotifyService }                   from '@app/@core/services/notify/notify.service';
import { CategoryCreateComponent }         from '@app/@shared/product/categories/category-create/category-create.component';
import { CategoriesTableComponent }        from '@app/@shared/product/categories/categories-table/categories-table.component';

@Component({
	           selector:    'ea-categories',
	           templateUrl: './categories.component.html',
	           styleUrls:   ['/categories.component.scss'],
           })
export class CategoriesComponent implements OnDestroy
{
	@ViewChild('categoriesTable', { static: true })
	public categoriesTable: CategoriesTableComponent;
	public loading: boolean;
	protected settingsSmartTable: object;
	protected sourceSmartTable = new LocalDataSource();
	private ngDestroy$ = new Subject<void>();
	
	constructor(
			private readonly _productsCategoryService: ProductsCategoryService,
			private readonly _modalService: NgbModal,
			private readonly _notifyService: NotifyService
	)
	{
		this._loadDataSmartTable();
	}
	
	public get hasSelectedCategories(): boolean
	{
		return this.categoriesTable.hasSelectedCategories;
	}
	
	public openWizardNewCategory()
	{
		this._modalService.open(CategoryCreateComponent, {
			size:      'lg',
			container: 'nb-layout',
			backdrop:  'static',
		});
	}
	
	public async deleteSelectedRows()
	{
		const categories = this.categoriesTable.selectedCategories;
		const idsArray: any = [];
		for(const val of categories)
		{
			idsArray.push(val.id);
		}
		
		try
		{
			this.loading = true;
			await this._productsCategoryService
			          .removeByIds(idsArray)
			          .pipe()
			          .toPromise();
			this.loading = false;
			const message = `Selected are removed!`;
			this._notifyService.success(message);
		} catch(error)
		{
			this.loading = false;
			const message = `Something went wrong!`;
			this._notifyService.error(message);
		}
	}
	
	public ngOnDestroy()
	{
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
	
	private async _loadDataSmartTable()
	{
		let categories: ProductsCategory[] = [];
		this._productsCategoryService
		    .getCategories()
		    .pipe(takeUntil(this.ngDestroy$))
		    .subscribe((c: ProductsCategory[]) =>
		               {
			               categories = c;
			               this.categoriesTable.loadDataSmartTable(categories);
		               });
	}
}
