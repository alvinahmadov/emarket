import { CommonModule }                  from '@angular/common';
import { NgModule }                      from '@angular/core';
import { FormsModule }                   from '@angular/forms';
import { TranslateModule }               from '@ngx-translate/core';
import { IonicModule }                   from '@ionic/angular';
import { Ng2SmartTableModule }           from 'ng2-smart-table';
import { AddressComponent }              from './address.component';
import { ChooseCustomerOptionComponent } from './choose-customer-option.component';
import { MakeOrderComponent }            from './make-order/make-order.component';
import { OrderComponent }                from './order.component';
import { OrderTypeComponent }            from './order-type/order-type.component';
import { MakeOrderInputComponent }       from './make-order/make-order-input.component';
import { MakeOrderCommentComponent }     from './make-order/order-comment/make-order-comment.component';
import { SelectAddCustomerComponent }    from './select-add-customer.component';
import { UserMutationModule }            from '../../@shared/user/mutation/user-mutation.module';
import { CustomersService }              from '../../services/customers.service';
import { WarehouseOrdersService }        from '../../services/warehouse-orders.service';

@NgModule({
	          imports:         [
		          Ng2SmartTableModule,
		          IonicModule,
		          CommonModule,
		          FormsModule,
		          UserMutationModule,
		          TranslateModule.forChild(),
	          ],
	          declarations:    [
		          OrderComponent,
		          ChooseCustomerOptionComponent,
		          SelectAddCustomerComponent,
		          MakeOrderComponent,
		          MakeOrderInputComponent,
		          MakeOrderCommentComponent,
		          OrderTypeComponent,
		          AddressComponent,
	          ],
	          entryComponents: [
		          AddressComponent,
		          MakeOrderInputComponent,
		          MakeOrderCommentComponent
	          ],
	          exports:         [
		          OrderComponent,
		          ChooseCustomerOptionComponent,
		          SelectAddCustomerComponent,
		          MakeOrderComponent,
		          MakeOrderCommentComponent
	          ],
	          providers:       [CustomersService, WarehouseOrdersService],
          })
export class OrderModule {}
