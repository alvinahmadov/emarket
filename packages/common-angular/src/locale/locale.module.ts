import { NgModule }              from '@angular/core';
import {
	TranslateService,
	TranslateModule,
	TranslateLoader,
	TranslateFakeLoader,
}                                from '@ngx-translate/core';
import { ProductLocalesService } from './product-locales.service';

@NgModule({
	          imports:   [
		          TranslateModule.forRoot(
				          {
					          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
				          }
		          ),
	          ],
	          providers: [ProductLocalesService, TranslateService],
          })
export class LocaleModule {}
