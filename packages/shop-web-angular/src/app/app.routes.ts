import { Routes }                 from '@angular/router';
import { environment }            from 'environments/environment'
import { AppModuleGuard }         from './app.module.guard';
import { NoContentComponent }     from './no-content';
import { AuthGuard }              from './authentication/auth.guard';
import { AuthModuleGuard }        from './+auth/auth.module.guard';
import { MaintenanceModuleGuard } from './+maintenance-info/maintenance-info.module.guard';
import { ProductsModuleGuard }    from './+products/products.module.guard';
import { WarehousesModuleGuard }  from './+warehouses/warehouses.module.guard';

function catchError(error)
{
	if(!environment.production)
	{
		console.error(error?.message)
	}
}

export const ROUTES: Routes = [
	{
		path:        '',
		children:    [
			{
				path:       '',
				redirectTo: '/auth',
				pathMatch:  'full',
			},
			{
				path:         'auth',
				loadChildren: () =>
						              import('./+auth')
								              .then((m) => m.AuthModule)
								              .catch(err => catchError(err)),
				canActivate:  [AuthModuleGuard],
			},
			{
				path:         'products',
				loadChildren: () =>
						              import('./+products')
								              .then((m) => m.ProductsModule)
								              .catch(err => catchError(err)),
				canActivate:  [ProductsModuleGuard, AuthGuard],
			},
			{
				path:         'orders',
				loadChildren: () =>
						              import('./+orders')
								              .then((m) => m.OrdersModule)
								              .catch(err => catchError(err)),
				canActivate:  [AuthGuard],
			},
			{
				path:         'warehouses',
				loadChildren: () =>
						              import('./+warehouses')
								              .then((m) => m.WarehousesModule)
								              .catch(err => catchError(err)),
				canActivate:  [WarehousesModuleGuard, AuthGuard],
			},
			{
				path:         'profile',
				loadChildren: () =>
						              import('./+profile')
								              .then((m) => m.ProfileModule)
								              .catch(err => catchError(err)),
				canActivate:  [AuthGuard],
			},
		],
		canActivate: [AppModuleGuard],
	},
	{
		path:         'maintenance-info',
		loadChildren: () =>
				              import('./+maintenance-info/maintenance-info.module')
						              .then((m) => m.MaintenanceInfoModule)
						              .catch(err => catchError(err)),
		canActivate:  [MaintenanceModuleGuard],
	},
	{
		path:         'server-down',
		loadChildren: () =>
				              import('./+server-down/server-down.module')
						              .then((m) => m.ServerDownModule)
						              .catch(err => catchError(err)),
	},
	{
		path:      '**',
		component: NoContentComponent,
	},
];
