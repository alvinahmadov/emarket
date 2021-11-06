import { NgModule }                         from '@angular/core';
import { CommonModule }                     from '@angular/common';
import { HttpClient }                       from '@angular/common/http';
import { FormsModule }                      from '@angular/forms';
import { IonicModule }                      from '@ionic/angular';
import { FileTransfer }                     from '@ionic-native/file-transfer/ngx';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader }              from '@ngx-translate/http-loader';
import { FileUploadModule }                 from 'ng2-file-upload';
import { ProductsCategoryService }          from 'services/products-category.service';
import { EditProductTypePopupPage }         from './edit-product-type-popup';
import { ProductImagesPopupModule }         from '../product-pictures-popup/product-images-popup.module';

export function HttpLoaderFactory(http: HttpClient)
{
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
	          declarations:    [EditProductTypePopupPage],
	          entryComponents: [EditProductTypePopupPage],
	          providers:       [FileTransfer, ProductsCategoryService],
	          imports:         [
		          FileUploadModule,
		          TranslateModule.forChild({
			                                   loader: {
				                                   provide:    TranslateLoader,
				                                   useFactory: HttpLoaderFactory,
				                                   deps:       [HttpClient],
			                                   },
		                                   }),
		          CommonModule,
		          FormsModule,
		          IonicModule,
		          ProductImagesPopupModule,
	          ],
          })
export class EditProductTypePopupPageModule {}
