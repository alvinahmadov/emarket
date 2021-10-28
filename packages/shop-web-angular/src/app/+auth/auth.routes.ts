import { Routes }                      from '@angular/router';
import { AuthComponent }               from './auth.component';
import { RegisterByLocationComponent } from './by-location/by-location.component';
import { CodeConfirmationComponent }   from './code-confirmation/code-confirmation.component';
import { SocieModuleGuard }            from './socie.module.guard';

export const routes: Routes = [
	{
		path:      '',
		component: AuthComponent
	},
	{
		path:        'socie/:id',
		component:   AuthComponent,
		canActivate: [SocieModuleGuard],
	},
	{
		path:      'by-location/:id',
		component: RegisterByLocationComponent,
	},
	{
		path:      'by-location',
		component: RegisterByLocationComponent,
	},
	{
		path:      'code',
		component: CodeConfirmationComponent
	}
];
