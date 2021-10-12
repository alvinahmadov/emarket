import { NgModule }                         from '@angular/core';
import { CommonModule }                     from '@angular/common';
import { TranslateModule }                  from '@ngx-translate/core';
import { MomentModule }                     from 'ngx-moment';
import { ThemeModule }                      from '@app/@theme';
import { PriceCountInputComponent }         from './price-countInput/price-countInput.component';
import { RedirectIdComponent }              from './redirect-id';
import { RedirectNameComponent }            from './name-redirect/name-redirect.component';
import { RedirectChatComponent }            from './chat-redirect/chat-redirect.component';
import { CreatedComponent }                 from './created/created.component';
import { CustomerEmailComponent }           from './customer-email/customer-email.component';
import { CustomerPhoneComponent }           from './customer-phone/customer-phone.component';
import { CheckboxComponent }                from './customer-orders-table/checkbox/checkbox.component';
import { ProductTitleRedirectComponent }    from './product-title-redirect/product-title-redirect.component';
import { ProductImageRedirectComponent }    from './product-image-redirect/product-image-redirect.component';
import { ProductCheckboxComponent }         from './product-checkbox/product-checkbox';
import { ProductTitleComponent }            from './product-title/product-title.component';
import { ProductImageComponent }            from './product-image/product-image.component';
import { IsAvailableCheckBox }              from './store-product-is-available-checkbox/is-available-checkbox.component';
import { ProductTakeawayDeliveryComponent } from './product-takeaway-delivery/product-takeaway-delivery.component';

const COMPONENTS = [
	PriceCountInputComponent,
	RedirectIdComponent,
	RedirectNameComponent,
	RedirectChatComponent,
	CreatedComponent,
	ProductTitleRedirectComponent,
	ProductImageRedirectComponent,
	ProductCheckboxComponent,
	CheckboxComponent,
	ProductTitleComponent,
	ProductImageComponent,
	CustomerEmailComponent,
	CustomerPhoneComponent,
	IsAvailableCheckBox,
	ProductTakeawayDeliveryComponent,
];

@NgModule({
	          imports:         [
		          CommonModule,
		          ThemeModule,
		          MomentModule,
		          TranslateModule.forChild(),
	          ],
	          declarations:    COMPONENTS,
	          entryComponents: COMPONENTS,
          })
export class RenderComponentsModule {}
