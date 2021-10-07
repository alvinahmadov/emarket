import { NgModule }                      from '@angular/core';
import { CommonModule }                  from '@angular/common';
import { HighlightModule }               from 'ngx-highlightjs';
import { TranslateModule }               from '@ngx-translate/core';
import { ThemeModule }                   from '@app/@theme';
import { CustomerImageComponent }        from './customer-table/customer-image.component';
import { CustomerOrdersNumberComponent } from './customer-orders-number/customer-orders-number.component';

const COMPONENTS = [CustomerImageComponent, CustomerOrdersNumberComponent];

@NgModule({
	          imports:         [
		          CommonModule,
		          ThemeModule,
		          HighlightModule.forRoot({ theme: 'github' }),
		          TranslateModule.forChild(),
	          ],
	          declarations:    COMPONENTS,
	          entryComponents: COMPONENTS,
	          exports:         COMPONENTS,
          })
export class CustomerTableModule {}
