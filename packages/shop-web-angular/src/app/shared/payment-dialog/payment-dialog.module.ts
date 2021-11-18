import { NgModule }               from '@angular/core';
import { CommonModule }           from '@angular/common';
import { PaymentDialogComponent } from './payment-dialog.component';
import { PaymentDirective }       from './payment/payment.directive';
import { PaymentItemDirective }   from './payment/payment-item.directive';
import { PaymentSubmitDirective } from './payment/payment-submit.directive';
import { TranslateModule }        from '@ngx-translate/core';
import { PipesModule }            from 'pipes/pipes.module';

const COMPONENTS = [
	PaymentDialogComponent,
	PaymentDirective,
	PaymentItemDirective,
	PaymentSubmitDirective
];

@NgModule({
	          imports:         [
		          CommonModule,
		          TranslateModule.forChild(),
		          PipesModule
	          ],
	          declarations:    COMPONENTS,
	          exports:         COMPONENTS,
	          entryComponents: [PaymentDialogComponent],
	
          })
export class PaymentDialogModule {}
