import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location }                     from '@angular/common';
import { ActivatedRoute }               from '@angular/router';
import { TranslateService }             from '@ngx-translate/core';
import { Subject }                      from 'rxjs';
import { first, takeUntil }             from 'rxjs/operators';
import { IProductsCategory }            from '@modules/server.common/interfaces/IProductsCategory';
import { ILocaleMember }                from '@modules/server.common/interfaces/ILocale';
import Product                          from '@modules/server.common/entities/Product';
import { ProductLocalesService }        from '@modules/client.common.angular2/locale/product-locales.service';
import { ProductsService }              from '@app/@core/data/products.service';
import { ProductsCategoryService }      from '@app/@core/data/productsCategory.service';

@Component({
	           selector:    'ea-product',
	           styleUrls:   ['./product.component.scss'],
	           templateUrl: './product.component.html',
           })
export class ProductComponent implements OnInit, OnDestroy
{
	public product: Product;
	public productLangToShow: string;
	public productCategoriesArr = [];
	public allCategories: any;
	private _productId: string;
	private _ngDestroy$ = new Subject<void>();
	
	constructor(
			public readonly translateService: TranslateService,
			private readonly _location: Location,
			private readonly _router: ActivatedRoute,
			private readonly _productsService: ProductsService,
			private readonly _productLocalesService: ProductLocalesService,
			private productsCategoryService: ProductsCategoryService
	)
	{
		this._router.params
		    .pipe(first())
		    .toPromise()
		    .then((res) =>
		          {
			          this._productId = res.id;
		          });
		
		this.getAllCategories();
	}
	
	get showCategories(): boolean
	{
		return this.product && this.product.categories.length > 0;
	}
	
	public ngOnInit()
	{
		this._loadProduct();
		this._setProductLanguage();
		this.productCategoriesArr = this.allCategories;
	}
	
	public ngOnDestroy()
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	public getLanguageFullName(langAbbreviation: string)
	{
		switch(langAbbreviation)
		{
			case 'en-US':
				return 'English';
			case 'ru-RU':
				return 'Русский';
		}
	}
	
	public getTranslatedValue(member: ILocaleMember[]): string
	{
		return this._productLocalesService.getTranslate(
				member,
				this.productLangToShow
		);
	}
	
	public getCategories(categories: IProductsCategory[])
	{
		return categories
				.map((c) => this.getTranslatedValue(c.name))
				.join(', ');
	}
	
	public async getAllCategories()
	{
		this.allCategories = await this.productsCategoryService
		                               .getCategories()
		                               .pipe(first())
		                               .toPromise();
	}
	
	public getTranslates(categoryName)
	{
		return this._productLocalesService.getTranslate(categoryName);
	}
	
	public onProductLangChange(selectedLanguage: string)
	{
		this.productLangToShow = selectedLanguage;
	}
	
	public getProductCategories(categoriesID)
	{
		this.productCategoriesArr = this.allCategories.filter((c) => categoriesID.includes(c.id));
	}
	
	public back()
	{
		this._location.back();
	}
	
	private _loadProduct()
	{
		this._productsService
		    .getProductById(this._productId)
		    .pipe(takeUntil(this._ngDestroy$))
		    .subscribe((p) =>
		               {
			               this.product = p;
			               this.getProductCategories(p.categories);
		               });
	}
	
	private _setProductLanguage()
	{
		this.productLangToShow = this.translateService.currentLang;
	}
}
