import { NgModule }                         from '@angular/core';
import { CommonModule }                     from '@angular/common';
import { HttpClient }                       from '@angular/common/http';
import { Routes, RouterModule }             from '@angular/router';
import { IonicModule }                      from '@ionic/angular';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader }              from '@ngx-translate/http-loader';
import { NgxPaginationModule }              from 'ngx-pagination';
import { NgxMasonryModule }                 from 'ngx-masonry';
import { StorageService }                   from 'services/storage.service';
import { WarehouseOrdersService }           from 'services/warehouse-orders.service';
import { WarehouseProductsService }         from 'services/warehouse-products.service';
import { WarehousesService }                from 'services/warehouses.service';
import { ComponentsModule }                 from 'components/components.module';
import { OrderModule }                      from 'components/order/order.module';
import { AllOrdersComponent }               from './all-oders/all-orders.component';
import { AllProductsComponent }             from './all-products/all-products.component';
import { WarehouseCommonModule }            from './common/warehouse.common.module';
import { RelevantOrdersComponent }          from './relevant-oders/relevant-orders.component';
import { TopProductsComponent }             from './top-products/top-products.component';
import { CreateProductTypePopupPageModule } from './create-product-type-popup/create-product-type-popup.module';
import { EditProductTypePopupPageModule }   from './edit-product-type-popup/edit-product-type-popup.module';
import { WarehousePage }                    from './warehouse';
import { OrderStatusFilterPipe }            from './warehouse.pipe';

export function HttpLoaderFactory(http: HttpClient)
{
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const routes: Routes = [
	{
		path:      '',
		component: WarehousePage,
	},
];

@NgModule({
	          declarations: [
		          WarehousePage,
		          AllOrdersComponent,
		          RelevantOrdersComponent,
		          AllProductsComponent,
		          TopProductsComponent,
		          OrderStatusFilterPipe,
	          ],
	          imports:      [
		          ComponentsModule,
		          OrderModule,
		          CommonModule,
		          IonicModule,
		          RouterModule.forChild(routes),
		          TranslateModule.forChild({
			                                   loader: {
				                                   provide:    TranslateLoader,
				                                   useFactory: HttpLoaderFactory,
				                                   deps:       [HttpClient],
			                                   },
		                                   }),
		          NgxPaginationModule,
		          WarehouseCommonModule,
		          NgxMasonryModule,
		          CreateProductTypePopupPageModule,
		          EditProductTypePopupPageModule,
	          ],
	          providers:    [
		          WarehouseOrdersService,
		          StorageService,
		          WarehouseProductsService,
		          WarehousesService,
	          ],
          })
export class WarehousePageModule {}
