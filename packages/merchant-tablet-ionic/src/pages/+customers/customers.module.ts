import { NgModule }                  from '@angular/core';
import { TranslateModule }           from '@ngx-translate/core';
import { Routes, RouterModule }      from '@angular/router';
import { IonicModule }               from '@ionic/angular';
import { CommonModule }              from '@angular/common';
import { FormsModule }               from '@angular/forms';
import { Ng2SmartTableModule }       from 'ng2-smart-table';
import { WarehouseCustomersService } from '@modules/client.common.angular2/routers/warehouse-customers.service';
import { PipesModule }               from '@modules/client.common.angular2/pipes/pipes.module';
import { CustomersPage }             from './customers';
import { ConfirmDeletePopupModule }  from '../../components/confirm-delete-popup/confirm-delete-popup.module';
import { ComponentsModule }          from '../../components/components.module';
import { UserPhoneComponent }        from '../../components/users-table/phone';
import { AddressComponent }          from '../../components/users-table/address';
import { OrdersComponent }           from '../../components/users-table/orders';
import { TotalComponent }            from '../../components/users-table/total';
import { EmailComponent }            from '../../components/users-table/email';
import { ImageUserComponent }        from '../../components/users-table/image';
import { OrdersService }             from '../../services/orders.service';
import { WarehouseOrdersService }    from '../../services/warehouse-orders.service';

const routes: Routes = [
	{
		path:      '',
		component: CustomersPage,
	},
];

@NgModule({
	          declarations:    [
		          CustomersPage,
		          ImageUserComponent,
		          AddressComponent,
		          OrdersComponent,
		          TotalComponent,
		          EmailComponent,
	          ],
	          imports:         [
		          PipesModule,
		          ComponentsModule,
		          IonicModule,
		          RouterModule.forChild(routes),
		          CommonModule,
		          FormsModule,
		          TranslateModule.forChild(),
		          Ng2SmartTableModule,
		          ConfirmDeletePopupModule,
	          ],
	          entryComponents: [
		          UserPhoneComponent,
		          ImageUserComponent,
		          AddressComponent,
		          OrdersComponent,
		          TotalComponent,
		          EmailComponent,
	          ],
	          providers:       [OrdersService, WarehouseCustomersService, WarehouseOrdersService],
          })
export class CustomersPageModule {}
