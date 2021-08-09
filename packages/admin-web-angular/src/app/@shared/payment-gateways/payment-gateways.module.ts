import { NgModule }                 from '@angular/core';
import { ThemeModule }              from '@app/@theme';
import { CommonModule }             from '@angular/common';
import { TranslateModule }          from '@ngx-translate/core';
import { PaymentGatewaysComponent } from './payment-gateways.component';
import { StripeGatewayComponent }   from './stripe-gateway/stripe-gateway.component';
import { PayPalGatewayComponent }   from './paypal-gateway/paypal-gateway.component';
import { YooMoneyGatewayComponent } from './yoomoney-gateway/yoomoney-gateway.component';
import { BitpayGatewayComponent }   from './bitpay-gateway/bitpay-gateway.component';
import { FileUploaderModule }       from '@app/@shared/file-uploader/file-uploader.module';
import { CurrenciesService }        from '@app/@core/data/currencies.service';

@NgModule({
	          imports: [
		          CommonModule,
		          ThemeModule,
		          TranslateModule.forChild(),
		          FileUploaderModule,
	          ],
	          declarations: [
		          PaymentGatewaysComponent,
		          StripeGatewayComponent,
		          PayPalGatewayComponent,
		          YooMoneyGatewayComponent,
		          BitpayGatewayComponent
	          ],
	          exports: [PaymentGatewaysComponent],
	          providers: [CurrenciesService],
          })
export class PaymentGatewaysModule {}
