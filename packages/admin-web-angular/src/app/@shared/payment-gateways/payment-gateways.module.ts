import { NgModule }                 from '@angular/core';
import { ThemeModule }              from '@app/@theme';
import { CommonModule }             from '@angular/common';
import { TranslateModule }          from '@ngx-translate/core';
import { NbInputModule }            from '@nebular/theme';
import { CurrenciesService }        from '@app/@core/data/currencies.service';
import { FileUploaderModule }       from '@app/@shared/file-uploader/file-uploader.module';
import { PaymentGatewaysComponent } from './payment-gateways.component';
import { BitpayGatewayComponent }   from './bitpay-gateway/bitpay-gateway.component';
import { PayPalGatewayComponent }   from './paypal-gateway/paypal-gateway.component';
import { StripeGatewayComponent }   from './stripe-gateway/stripe-gateway.component';
import { YooMoneyGatewayComponent } from './yoomoney-gateway/yoomoney-gateway.component';

@NgModule({
	          imports:      [
		          CommonModule,
		          ThemeModule,
		          TranslateModule.forChild(),
		          FileUploaderModule,
		          NbInputModule,
	          ],
	          declarations: [
		          PaymentGatewaysComponent,
		          StripeGatewayComponent,
		          PayPalGatewayComponent,
		          YooMoneyGatewayComponent,
		          BitpayGatewayComponent
	          ],
	          exports:      [PaymentGatewaysComponent],
	          providers:    [CurrenciesService],
          })
export class PaymentGatewaysModule {}
