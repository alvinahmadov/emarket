import { NgModule }               from '@angular/core';
import { TranslateModule }        from '@ngx-translate/core';
import { NbSpinnerModule }        from '@nebular/theme';
import { FormWizardModule }       from '@ever-co/angular2-wizard';
import { ThemeModule }            from '@app/@theme/theme.module';
import { ProductCreateComponent } from './product-create.component';
import { ProductFormsModule }     from '../forms';

// noinspection AngularInvalidImportedOrDeclaredSymbol
@NgModule({
	          imports:         [
		          ThemeModule,
		          FormWizardModule,
		          TranslateModule.forChild(),
		          ProductFormsModule,
		          NbSpinnerModule,
	          ],
	          exports:         [ProductCreateComponent],
	          declarations:    [ProductCreateComponent],
	          entryComponents: [ProductCreateComponent],
          })
export class ProductCreateModule {}
