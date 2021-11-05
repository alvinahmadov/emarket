import { NgModule }         from '@angular/core';
import { CommonModule }     from '@angular/common';
import { TranslateModule }  from '@ngx-translate/core';
import { IonicModule }      from '@ionic/angular';
import { StorageService }   from 'services/storage.service';
import { ProductComponent } from './product.component';

@NgModule({
	          imports:      [IonicModule, CommonModule, TranslateModule.forChild()],
	          providers:    [StorageService],
	          exports:      [ProductComponent],
	          declarations: [ProductComponent],
          })
export class ProductModule {}
