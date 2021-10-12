// noinspection AngularInvalidImportedOrDeclaredSymbol

import { NgModule }                          from '@angular/core';
import { CommonModule }                      from '@angular/common';
import { TranslateModule }                   from '@ngx-translate/core';
import { NbSpinnerModule }                   from '@nebular/theme';
import { FormWizardModule }                  from '@ever-co/angular2-wizard';
import { Ng2SmartTableModule }               from 'ng2-smart-table';
import { UserFormsModule }                   from '@app/@shared/user/forms';
import { LocationFormModule }                from '@app/@shared/forms/location';
import { GoogleMapModule }                   from '@app/@shared/forms/google-map/google-map.module';
import { WarehouseOrderModalModule }         from '@app/@shared/warehouse/+warehouse-order-modal/warehouse-order-modal.module';
import { ThemeModule }                       from '@app/@theme';
import { WarehouseOrderComponent }           from './warehouse-order.component';
import { WarehouseOrderCreateUserComponent } from './create-user/warehouse-order-create-user.component';

@NgModule({
	          imports:         [
		          CommonModule,
		          ThemeModule,
		          FormWizardModule,
		          Ng2SmartTableModule,
		          TranslateModule.forChild(),
		          UserFormsModule,
		          LocationFormModule,
		          GoogleMapModule,
		          WarehouseOrderModalModule,
		          NbSpinnerModule,
	          ],
	          declarations:    [WarehouseOrderComponent, WarehouseOrderCreateUserComponent],
	          entryComponents: [WarehouseOrderComponent],
          })
export class WarehouseOrderModule {}
