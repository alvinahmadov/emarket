import { NgModule }             from '@angular/core';
import { CommonModule }         from '@angular/common';
import { FormsModule }          from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule }      from '@ngx-translate/core';
import { IonicModule }          from '@ionic/angular';
import { LoginPage }            from './login';
import { AuthService }          from '../../services/auth.service';
import { StorageService }       from '../../services/storage.service';

const routes: Routes = [
	{
		path:      '',
		component: LoginPage,
	},
];

@NgModule({
	          declarations: [LoginPage],
	          imports:      [
		          IonicModule,
		          FormsModule,
		          CommonModule,
		          TranslateModule.forChild(),
		          RouterModule.forChild(routes),
	          ],
	          providers:    [
	          		AuthService,
		            StorageService
	          ],
          })
export class LoginPageModule {}
