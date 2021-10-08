import { Component } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';
import { NbMenuItem }       from '@nebular/theme';
import { Store }            from '@app/@core/data/store.service';
import { environment }      from 'environments/environment.prod';

@Component({
	           selector:    'ea-pages',
	           templateUrl: './pages.component.html',
           })
export class PagesComponent
{
	menu: NbMenuItem[];
	
	constructor(
			private translate: TranslateService,
			private storage: Store
	)
	{
		if(this.storage.locale)
		{
			this.translate.use(this.storage.locale);
		}
		else if(this.translate.currentLang)
		{
			this.storage.locale = this.translate.currentLang;
		}
		else
		{
			this.storage.locale = environment.DEFAULT_LANGUAGE;
			this.translate.use(environment.DEFAULT_LANGUAGE);
		}
		this.initialize();
		this._applyTranslationOnSmartTable();
	}
	
	initialize()
	{
		this.menu = [
			{
				title:     this.getTranslation('MENU_VIEW.DASHBOARD'),
				icon:      'pie-chart-outline',
				link:      '/dashboard',
				pathMatch: 'prefix',
			},
			{
				title:     this.getTranslation('MENU_VIEW.STORES'),
				icon:      'home-outline',
				link:      '/stores',
				pathMatch: 'prefix',
			},
			{
				title:    this.getTranslation('MENU_VIEW.PRODUCTS.PRODUCTS'),
				icon:     'shopping-cart-outline',
				link:     '/products',
				children: [
					{
						title: this.getTranslation(
								'MENU_VIEW.PRODUCTS.MANAGEMENT'
						),
						link:  '/products/list',
					},
					{
						title:     this.getTranslation(
								'MENU_VIEW.PRODUCTS.CATEGORIES'
						),
						link:      '/products/categories',
						pathMatch: 'prefix',
					},
				],
			},
			{
				title:    this.getTranslation('MENU_VIEW.CUSTOMERS.CUSTOMERS'),
				icon:     'person-outline',
				link:     '/customers',
				children: [
					{
						title: this.getTranslation(
								'MENU_VIEW.CUSTOMERS.MANAGEMENT'
						),
						link:  '/customers/list',
					},
					{
						title:     this.getTranslation(
								'MENU_VIEW.CUSTOMERS.INVITES'
						),
						link:      '/customers/invites',
						pathMatch: 'prefix',
					}
				],
			},
			{
				title:     this.getTranslation('MENU_VIEW.CARRIERS'),
				icon:      'car-outline',
				link:      '/carriers',
				pathMatch: 'prefix',
			},
			{
				title:     this.getTranslation('MENU_VIEW.SIMULATION'),
				icon:      'star-outline',
				link:      '/simulation',
				pathMatch: 'prefix',
				home:      true,
			},
			{
				title:     this.getTranslation('MENU_VIEW.SETUP'),
				icon:      'settings-2-outline',
				link:      '/setup',
				pathMatch: 'prefix',
			},
		];
	}
	
	getTranslation(prefix: string)
	{
		let result = '';
		this.translate.get(prefix).subscribe((res) =>
		                                     {
			                                     result = res;
		                                     });
		return result;
	}
	
	private _applyTranslationOnSmartTable()
	{
		this.translate.onLangChange.subscribe(() =>
		                                      {
			                                      this.initialize();
		                                      });
	}
}
