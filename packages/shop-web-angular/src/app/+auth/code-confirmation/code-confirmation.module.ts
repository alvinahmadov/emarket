import { NgModule }                  from '@angular/core';
import { CommonModule }              from '@angular/common';
import { ReactiveFormsModule }       from '@angular/forms';
import { TranslateModule }           from '@ngx-translate/core';
import { MatBoldInputModule }        from '@modules/material-extensions';
import { CodeConfirmationComponent } from './code-confirmation.component';

@NgModule({
	          declarations: [CodeConfirmationComponent],
	          imports:      [
		          CommonModule,
		          TranslateModule.forChild(),
		          ReactiveFormsModule,
		          MatBoldInputModule,
	          ]
          })
export class CodeConfirmationModule {}
