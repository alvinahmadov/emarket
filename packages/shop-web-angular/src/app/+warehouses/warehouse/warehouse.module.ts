import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';
import { TranslateModule }     from '@ngx-translate/core';
import { FormsModule }         from '@angular/forms';
import { MatButtonModule }     from '@angular/material/button';
import { MatCardModule }       from '@angular/material/card';
import { RouterModule }        from '@angular/router';
import { WarehouseLogoModule } from 'app/warehouse-logo';
import { WarehouseComponent }  from './warehouse.component';

@NgModule({
	          imports: [
		          CommonModule,
		          TranslateModule.forChild(),
		          FormsModule,
		          MatCardModule,
		          MatButtonModule,
		          RouterModule,
		          WarehouseLogoModule
	          ],
	          exports: [WarehouseComponent],
	          declarations: [WarehouseComponent],
          })
export class WarehouseModule {}
