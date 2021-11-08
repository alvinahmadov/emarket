import { NgModule }             from '@angular/core';
import { TranslateModule }      from '@ngx-translate/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule }         from '@angular/common';
import {
	FormsModule,
	ReactiveFormsModule
}                               from '@angular/forms';
import { IonicModule }          from '@ionic/angular';
import { TabModule }            from '@modules/client.common.angular2/components/tabs/tab.module';
import { AuthPage }             from './auth';
import { AuthService }          from 'services/auth.service';
import { CustomersService }     from 'services/customers.service';
import { StorageService }       from 'services/storage.service';

const routes: Routes = [
	{
		path:      '',
		component: AuthPage,
		children:  [
			{
				path:      'logout',
				component: AuthPage,
			}
		]
	}
];

@NgModule({
	          declarations: [AuthPage],
	          providers:    [AuthService, StorageService, CustomersService],
	          imports:      [
		          IonicModule,
		          RouterModule.forChild(routes),
		          CommonModule,
		          FormsModule,
		          TranslateModule.forChild(),
		          TabModule,
		          ReactiveFormsModule,
	          ],
          })
export class AuthPageModule {}
