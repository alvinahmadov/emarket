import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { environment }          from 'environments/environment';
import { AuthModuleGuard }      from './+auth/auth.module.guard';
import { LoginModuleGuard }     from './+login/login.module.guard';
import { WarehouseModuleGuard } from './+warehouse/warehouse.module.guard';
import { InfoModuleGuard }      from './+info/info.module.guard';

function catchModuleErr(err)
{
	if(!environment.production)
	{
		console.error(err);
	}
}

const routes: Routes = [
	{
		path:         'auth',
		loadChildren: () => import('./+auth/auth.module')
				.then((m) => m.AuthPageModule)
				.catch(err => catchModuleErr(err)),
		canLoad:      [AuthModuleGuard],
		canActivate:  [AuthModuleGuard]
	},
	{
		path:         'login',
		loadChildren: () => import('./+login/login.module')
				.then((m) => m.LoginPageModule)
				.catch(err => catchModuleErr(err)),
		canLoad:      [LoginModuleGuard],
	},
	{
		path:         'warehouse',
		loadChildren: () => import('./+warehouse/warehouse.module')
				.then((m) => m.WarehousePageModule)
				.catch(err => catchModuleErr(err)),
		canLoad:      [WarehouseModuleGuard],
	},
	{
		path:         'language',
		loadChildren: () => import('./+language/language.module')
				.then((m) => m.LanguagePageModule)
				.catch(err => catchModuleErr(err)),
		canLoad:      [WarehouseModuleGuard],
	},
	{
		path:         'customers',
		loadChildren: () => import('./+customers/customers.module')
				.then((m) => m.CustomersPageModule)
				.catch(err => catchModuleErr(err)),
		canLoad:      [WarehouseModuleGuard],
	},
	{
		path:         'carriers',
		loadChildren: () => import('./+carriers/carriers.module')
				.then((m) => m.CarrierssPageModule)
				.catch(err => catchModuleErr(err)),
		canLoad:      [WarehouseModuleGuard],
	},
	{
		path:         'chats',
		loadChildren: () => import('./+chats/chats.module')
				.then((m) => m.ChatsModule)
				.catch(err => catchModuleErr(err)),
		canLoad:      [WarehouseModuleGuard],
	},
	{
		path:         'track',
		loadChildren: () => import('./+track/track.module')
				.then((m) => m.TrackPageModule)
				.catch(err => catchModuleErr(err)),
		canLoad:      [WarehouseModuleGuard],
	},
	{
		path:         'track/:id',
		loadChildren: () => import('./+track/track.module')
				.then((m) => m.TrackPageModule)
				.catch(err => catchModuleErr(err)),
		canLoad:      [WarehouseModuleGuard],
	},
	{
		path:         'settings',
		loadChildren: () => import('./+settings/settings.module')
				.then((m) => m.SettingsPageModule)
				.catch(err => catchModuleErr(err)),
		canLoad:      [WarehouseModuleGuard],
	},
	{
		path:         'info',
		loadChildren: () => import('./+info/info.module')
				.then((m) => m.InfoModule)
				.catch(err => catchModuleErr(err)),
		canLoad:      [InfoModuleGuard],
	},
	{
		path:         'promotions',
		loadChildren: () => import('./+promotions/promotion.module')
				.then((m) => m.PromotionModule)
				.catch(err => catchModuleErr(err)),
		canLoad:      [WarehouseModuleGuard],
	},
	{
		path:         'errors',
		loadChildren: () => import('./+errors/errors.module')
				.then((m) => m.ErrorsModule)
				.catch(err => catchModuleErr(err)),
	},
	{
		path:       '',
		pathMatch:  'full',
		redirectTo: 'auth',
	},
];

@NgModule({
	          imports:   [RouterModule.forChild(routes)],
	          providers: [
		          AuthModuleGuard,
		          WarehouseModuleGuard,
		          InfoModuleGuard
	          ],
	          exports:   [RouterModule],
          })
export class PagesModule {}
