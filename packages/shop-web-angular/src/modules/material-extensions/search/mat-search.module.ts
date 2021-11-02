import { CommonModule }       from '@angular/common';
import { NgModule }           from '@angular/core';
import { MatButtonModule }    from '@angular/material/button';
import { MatRippleModule }    from '@angular/material/core';
import { MatInputModule }     from '@angular/material/input';
import { TranslateModule }    from '@ngx-translate/core';
import { MatSearchComponent } from './mat-search.component';

@NgModule({
	          imports:      [
		          CommonModule,
		          MatButtonModule,
		          MatRippleModule,
		          TranslateModule.forChild(),
		          MatInputModule,
	          ],
	          declarations: [MatSearchComponent],
	          exports:      [MatSearchComponent],
          })
export class MatSearchModule {}
