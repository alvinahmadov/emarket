import { NgModule }             from '@angular/core';
import { LoginPage }            from './login';
import { TranslateModule }      from '@ngx-translate/core';
import { AuthService }          from '../../services/auth.service';
import { Storage }              from 'services/storage.service';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule }         from '@angular/common';
import { FormsModule }          from '@angular/forms';
import { IonicModule }          from '@ionic/angular';
import { TabModule }            from "@modules/client.common.angular2/components/tabs/tab.module";

const routes: Routes = [
	{
		path:      '',
		component: LoginPage,
	},
];

@NgModule({
	          declarations: [LoginPage],
	          providers:    [AuthService, Storage],
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
