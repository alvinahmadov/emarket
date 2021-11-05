import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';
import { IonicModule }         from '@ionic/angular';
import { TranslateModule }     from '@ngx-translate/core';
import { StorageService }      from 'services/storage.service';
import { OrderComponent }      from './order.component';
import { ProductModule }       from './product/product.module';
import { WarehouseLogoModule } from '../../warehouse-logo/warehouse-logo.module';

@NgModule({
	          imports:      [
		          IonicModule,
		          CommonModule,
		          WarehouseLogoModule,
		          ProductModule,
		          TranslateModule.forChild(),
	          ],
	          providers:    [StorageService],
	          exports:      [OrderComponent],
	          declarations: [OrderComponent],
          })
export class OrderModule {}
