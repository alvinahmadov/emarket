import { NgModule }                      from '@angular/core';
import { CommonModule }                  from '@angular/common';
import { RouterModule }                  from '@angular/router';
import { FormsModule }                   from '@angular/forms';
import { NbButtonModule }                from '@nebular/theme';
import { TranslateModule }               from '@ngx-translate/core';
import { NgSelectModule }                from '@ng-select/ng-select';
import { ToasterModule }                 from 'angular2-toaster';
import { Ng2SmartTableModule }           from 'ng2-smart-table';
import { HighlightModule }               from 'ngx-highlightjs';
import { CustomerOrdersTableModule }     from '@app/@shared/render-component/customer-orders-table/customer-orders-table.module';
import { CustomerProductsTableModule }   from '@app/@shared/render-component/customer-products-table/customer-products-table.module';
import { RenderComponentsModule }        from '@app/@shared/render-component/render-components.module';
import { CustomerWarehousesTableModule } from '@app/@shared/warehouse/customer-warehouses-table/customer-warehouses-table.module';
import { WarehouseMutationModule }       from '@app/@shared/warehouse/warehouse-mutation';
import { WarehouseOrderModalModule }     from '@app/@shared/warehouse/+warehouse-order-modal/warehouse-order-modal.module';
import { ThemeModule }                   from '@app/@theme';
import { CustomerComponent }             from './customer.component';
import { CustomerInfoComponent }         from './ea-customer-info/ea-customer-info.component';
import { CustomerProductsComponent }     from './ea-customer-products/ea-customer-products/ea-customer-products.component';
import { CustomerLocationComponent }     from './ea-customer-location/ea-customer-location.component';
import { CustomerStoresComponent }       from './ea-customer-stores/ea-customer-stores.component';
import { CustomerOrdersModule }          from './ea-customer-orders/ea-customer-orders.module';
import { CustomerMetricsComponent }      from './ea-customer-metrics/ea-customer-metrics.component';

const routes = [
	{
		path:      '',
		component: CustomerComponent,
	},
	{
		path:         'edit',
		loadChildren: () =>
				              import('./+customer-edit/customer-edit.module').then(
						              (m) => m.CustomerEditModule
				              ),
	},
];

@NgModule({
	          imports:         [
		          CommonModule,
		          Ng2SmartTableModule,
		          ThemeModule,
		          ToasterModule.forRoot(),
		          RouterModule.forChild(routes),
		          TranslateModule.forChild(),
		          HighlightModule.forRoot({ theme: 'github' }),
		          RenderComponentsModule,
		          WarehouseMutationModule,
		          CustomerOrdersTableModule,
		          CustomerProductsTableModule,
		          CustomerWarehousesTableModule,
		          WarehouseOrderModalModule,
		          CustomerOrdersModule,
		          NgSelectModule,
		          FormsModule,
		          NbButtonModule,
	          ],
	          declarations:    [
		          CustomerComponent,
		          CustomerLocationComponent,
		          CustomerInfoComponent,
		          CustomerProductsComponent,
		          CustomerStoresComponent,
		          CustomerMetricsComponent,
	          ],
	          entryComponents: [],
          })
export class CustomerModule {}
