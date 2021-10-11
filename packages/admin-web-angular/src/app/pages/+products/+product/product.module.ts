// noinspection AngularInvalidImportedOrDeclaredSymbol

import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';
import { RouterModule }        from '@angular/router';
import { TranslateModule }     from '@ngx-translate/core';
import { ToasterModule }       from 'angular2-toaster';
import { HighlightModule }     from 'ngx-highlightjs';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { FormWizardModule }    from '@ever-co/angular2-wizard';
import { ThemeModule }         from '@app/@theme';
import { ProductComponent }    from './product.component';
import { routes }              from './product.routes';

@NgModule({
	          imports:      [
		          CommonModule,
		          ThemeModule,
		          FormWizardModule,
		          Ng2SmartTableModule,
		          ToasterModule.forRoot(),
		          TranslateModule.forChild(),
		          RouterModule.forChild(routes),
		          HighlightModule.forRoot({ theme: 'github' })
	          ],
	          declarations: [ProductComponent],
          })
export class ProductModule {}
