import { NgModule }                         from '@angular/core';
import { CommonModule }                     from '@angular/common';
import { RouterModule }                     from '@angular/router';
import { NbSpinnerModule, NbButtonModule }  from '@nebular/theme';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient }                       from '@angular/common/http';
import { TranslateHttpLoader }              from '@ngx-translate/http-loader';
import { ToasterModule }                    from 'angular2-toaster';
import FakeDataCarriers                     from '@app/@core/data/fakeDataServices/carriers';
import FakeDataUsers                        from '@app/@core/data/fakeDataServices/customers';
import FakeDataInvites                      from '@app/@core/data/fakeDataServices/invites';
import FakeDataProducts                     from '@app/@core/data/fakeDataServices/products';
import FakeDataProductsCategories           from '@app/@core/data/fakeDataServices/productsCategories';
import FakeDataWarehouses                   from '@app/@core/data/fakeDataServices/warehouses';
import FakeDataWarehousesProducts           from '@app/@core/data/fakeDataServices/warehousesProducts';
import { InvitesService }                   from '@app/@core/data/invites.service';
import { InvitesRequestsService }           from '@app/@core/data/invites-requests.service';
import { CurrenciesService }                from '@app/@core/data/currencies.service';
import { CustomersService }                 from '@app/@core/data/customers.service';
import { NotifyService }                    from '@app/@core/services/notify/notify.service';
import { ThemeModule }                      from '@app/@theme/theme.module';
import { routes }                           from './fakeData.routes';
import { FakeDataComponent }                from './fakeData.component';

export function HttpLoaderFactory(http: HttpClient)
{
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
	          imports:      [
		          CommonModule,
		          ThemeModule,
		          ToasterModule.forRoot(),
		          TranslateModule.forChild({
			                                   loader: {
				                                   provide:    TranslateLoader,
				                                   useFactory: HttpLoaderFactory,
				                                   deps:       [HttpClient],
			                                   },
		                                   }),
		          RouterModule.forChild(routes),
		          NbSpinnerModule,
		          NbButtonModule,
	          ],
	          declarations: [FakeDataComponent],
	          providers:    [
		          FakeDataInvites,
		          FakeDataCarriers,
		          FakeDataProducts,
		          FakeDataWarehouses,
		          FakeDataWarehousesProducts,
		          FakeDataUsers,
		          FakeDataProductsCategories,
		          InvitesService,
		          InvitesRequestsService,
		          CustomersService,
		          NotifyService,
		          CurrenciesService,
	          ],
          })
export class FakeDataModule
{
	public static routes = routes;
	
	constructor()
	{}
}
