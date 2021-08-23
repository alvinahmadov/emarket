import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthModuleGuard }      from './+auth/auth.module.guard';
import { WarehouseModuleGuard } from './+warehouse/warehouse.module.guard';
import { InfoModuleGuard }      from './+info/info.module.guard';

const routes: Routes = [
	{
		path: 'auth',
		loadChildren: () =>
				import('./+auth/auth.module').then((m) => m.AuthPageModule),
		canLoad: [AuthModuleGuard],
	},
	{
		path: 'warehouse',
		loadChildren: () =>
				import('./+warehouse/warehouse.module').then(
						(m) => m.WarehousePageModule
				),
		canLoad: [WarehouseModuleGuard],
	},
	{
		path: 'language',
		loadChildren: () =>
				import('./+language/language.module').then(
						(m) => m.LanguagePageModule
				),
		canLoad: [WarehouseModuleGuard],
	},
	{
		path: 'customers',
		loadChildren: () =>
				import('./+customers/customers.module').then(
						(m) => m.CustomersPageModule
				),
		canLoad: [WarehouseModuleGuard],
	},
	{
		path: 'carriers',
		loadChildren: () =>
				import('./+carriers/carriers.module').then(
						(m) => m.CarrierssPageModule
				),
		canLoad: [WarehouseModuleGuard],
	},
	{
		path: 'track',
		loadChildren: () =>
				import('./+track/track.module').then((m) => m.TrackPageModule),
		canLoad: [WarehouseModuleGuard],
	},
	{
		path: 'track/:id',
		loadChildren: () =>
				import('./+track/track.module').then((m) => m.TrackPageModule),
		canLoad: [WarehouseModuleGuard],
	},
	{
		path: 'settings',
		loadChildren: () =>
				import('./+settings/settings.module').then(
						(m) => m.SettingsPageModule
				),
		canLoad: [WarehouseModuleGuard],
	},
	{
		path: 'info',
		loadChildren: () =>
				import('./+info/info.module').then((m) => m.InfoModule),
		canLoad: [InfoModuleGuard],
	},
	{
		path: 'promotions',
		loadChildren: () =>
				import('./+promotions/promotion.module').then(
						(m) => m.PromotionModule
				),
		canLoad: [WarehouseModuleGuard],
	},
	{
		path: 'errors',
		loadChildren: () =>
				import('./+errors/errors.module').then((m) => m.ErrorsModule),
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'warehouse',
	},
];

@NgModule({
	          imports: [RouterModule.forChild(routes)],
	          providers: [
		          AuthModuleGuard,
		          WarehouseModuleGuard,
		          InfoModuleGuard
	          ],
	          exports: [RouterModule],
          })
export class PagesModule {}
