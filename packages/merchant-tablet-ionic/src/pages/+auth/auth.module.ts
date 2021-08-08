import { NgModule } from '@angular/core';
import { AuthPage } from './auth';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { Store } from '../../services/store.service';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TabModule } from '@modules/client.common.angular2/components/tabs/tab.module';

const routes: Routes = [
	{
		path: '',
		component: AuthPage,
	},
];

@NgModule({
	declarations: [AuthPage],
	providers: [AuthService, Store],
	imports: [
		IonicModule,
		RouterModule.forChild(routes),
		CommonModule,
		FormsModule,
		TranslateModule.forChild(),
		TabModule,
	],
})
export class AuthPageModule {}
