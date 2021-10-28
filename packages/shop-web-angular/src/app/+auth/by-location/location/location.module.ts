import { CommonModule }                     from '@angular/common';
import { NgModule }                         from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule }                     from '@angular/router';
import { MatButtonModule }                  from '@angular/material/button';
import { MatCheckboxModule }                from '@angular/material/checkbox';
import { MatFormFieldModule }               from '@angular/material/form-field';
import { MatIconModule }                    from '@angular/material/icon';
import { MatInputModule }                   from '@angular/material/input';
import { MatSelectModule }                  from '@angular/material/select';
import { TranslateModule }                  from '@ngx-translate/core';
import { NgxMatSelectSearchModule }         from 'ngx-mat-select-search';
import {
	MatSearchModule,
	MatBoldInputModule,
}                                           from '@modules/material-extensions';
import { LocationFormComponent }            from './location.component';

@NgModule({
	          declarations: [LocationFormComponent],
	          exports:      [LocationFormComponent],
	          imports:      [
		          CommonModule,
		          FormsModule,
		          ReactiveFormsModule,
		
		          MatFormFieldModule,
		          MatButtonModule,
		          MatInputModule,
		          MatSelectModule,
		          MatIconModule,
		          MatCheckboxModule,
		          NgxMatSelectSearchModule,
		
		          MatSearchModule,
		          MatBoldInputModule,
		          TranslateModule.forChild(),
		          RouterModule,
	          ],
          })
export class LocationFormModule {}
