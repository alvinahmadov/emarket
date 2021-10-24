import { NgModule }             from '@angular/core';
import { CommonModule }         from '@angular/common';
import { FormsModule }          from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule }          from '@ionic/angular';
import { TranslateModule }      from '@ngx-translate/core';
import { TabModule }            from '@modules/client.common.angular2/components/tabs/tab.module';
import { AuthService }          from 'services/auth.service';
import { StorageService }       from 'services/storage.service';
import { LoginPage }            from './login';

const routes: Routes = [
	{
		path:      '',
		component: LoginPage,
	},
];

@NgModule({
	          declarations: [LoginPage],
	          providers:    [AuthService, StorageService],
	          imports:      [
		          IonicModule,
		          RouterModule.forChild(routes),
		          CommonModule,
		          FormsModule,
		          TranslateModule.forChild(),
		          TabModule,
	          ],
          })
export class LoginPageModule {}
