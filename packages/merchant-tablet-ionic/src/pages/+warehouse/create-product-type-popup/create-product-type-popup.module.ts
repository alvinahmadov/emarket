import { NgModule }                   from '@angular/core';
import { CommonModule }               from '@angular/common';
import { FormsModule }                from '@angular/forms';
import { IonicModule }                from '@ionic/angular';
import { FileTransfer }               from '@ionic-native/file-transfer/ngx';
import { TranslateModule }            from '@ngx-translate/core';
import { FileUploadModule }           from 'ng2-file-upload';
import { ProductsCategoryService }    from 'services/products-category.service';
import { CreateProductTypePopupPage } from './create-product-type-popup';
import { ProductImagesPopupModule }   from '../product-pictures-popup/product-images-popup.module';

@NgModule({
	          declarations:    [CreateProductTypePopupPage],
	          entryComponents: [CreateProductTypePopupPage],
	          providers:       [FileTransfer, ProductsCategoryService],
	          imports:         [
		          FileUploadModule,
		          TranslateModule.forChild(),
		          CommonModule,
		          FormsModule,
		          IonicModule,
		          ProductImagesPopupModule,
	          ],
	          exports:         [CreateProductTypePopupPage]
          })
export class CreateProductTypePopupPageModule {}
