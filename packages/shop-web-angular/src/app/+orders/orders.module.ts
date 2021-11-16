import { NgModule }                         from '@angular/core';
import { RouterModule }                     from '@angular/router';
import { FormsModule }                      from '@angular/forms';
import { CommonModule }                     from '@angular/common';
import { MatButtonModule }                  from '@angular/material/button';
import { MatCardModule }                    from '@angular/material/card';
import { MatDialogModule }                  from '@angular/material/dialog';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient }                       from '@angular/common/http';
import { TranslateHttpLoader }              from '@ngx-translate/http-loader';
import { PipesModule }                      from 'pipes/pipes.module';
import { MessagePopUpModalModule }          from 'app/shared/message-pop-up/message-pop-up.module';
import { PaymentDialogModule }              from 'app/shared/payment-dialog/payment-dialog.module';
import { OrderComponent }                   from './order';
import { OrdersComponent }                  from './orders.component';
import { OrdersContainerComponent }         from './orders.container.component';
import { routes }                           from './orders.routes';
import { CarrierLocationComponent }         from './location/carrier-location.component';
import { WarehouseLogoModule }              from '../warehouse-logo';

export function HttpLoaderFactory(http: HttpClient)
{
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
	          declarations:    [
		          OrdersContainerComponent,
		          OrdersComponent,
		          OrderComponent,
		          CarrierLocationComponent,
	          ],
	          entryComponents: [CarrierLocationComponent],
	          imports:         [
		          CommonModule,
		          MessagePopUpModalModule,
		          PaymentDialogModule,
		          TranslateModule.forChild({
			                                   loader: {
				                                   provide:    TranslateLoader,
				                                   useFactory: HttpLoaderFactory,
				                                   deps:       [HttpClient],
			                                   },
		                                   }),
		          FormsModule,
		          RouterModule.forChild(routes),
		
		          MatDialogModule,
		          MatButtonModule,
		          MatCardModule,
		
		          WarehouseLogoModule,
		          PipesModule,
	          ],
          })
export class OrdersModule {}
