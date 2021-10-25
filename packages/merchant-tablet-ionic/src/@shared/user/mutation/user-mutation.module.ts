import { CommonModule }          from '@angular/common';
import { NgModule }              from '@angular/core';
import { FormsModule }           from '@angular/forms';
import { TranslateModule }       from '@ngx-translate/core';
import { IonicModule }           from '@ionic/angular';
import { CustomersService }      from 'services/customers.service';
import { UserMutationComponent } from './user-mutation.component';
import { UserFormsModule }       from '../forms/user-forms.module';
import { GoogleMapModule }       from '../../google-map/google-map.module';

@NgModule({
	          imports:         [
		          TranslateModule.forChild(),
		          UserFormsModule,
		          GoogleMapModule,
		          IonicModule,
		          CommonModule,
		          FormsModule,
	          ],
	          providers:       [CustomersService],
	          exports:         [UserMutationComponent],
	          declarations:    [UserMutationComponent],
	          entryComponents: [UserMutationComponent],
          })
export class UserMutationModule {}
