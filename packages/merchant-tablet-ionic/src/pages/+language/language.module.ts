import { NgModule }                         from '@angular/core';
import { CommonModule }                     from '@angular/common';
import { HttpClient }                       from '@angular/common/http';
import { FormsModule }                      from '@angular/forms';
import { Routes, RouterModule }             from '@angular/router';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader }              from '@ngx-translate/http-loader';
import { IonicModule }                      from '@ionic/angular';
import { StorageService }                   from 'services/storage.service';
import { LanguagePage }                     from './language';

export function HttpLoaderFactory(http: HttpClient)
{
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const routes: Routes = [
	{
		path:      '',
		component: LanguagePage,
	},
];

@NgModule({
	          declarations: [LanguagePage],
	          imports:      [
		          IonicModule,
		          RouterModule.forChild(routes),
		          CommonModule,
		          FormsModule,
		          TranslateModule.forChild({
			                                   loader: {
				                                   provide:    TranslateLoader,
				                                   useFactory: HttpLoaderFactory,
				                                   deps:       [HttpClient],
			                                   },
		                                   }),
	          ],
	          providers:    [StorageService],
          })
export class LanguagePageModule {}
