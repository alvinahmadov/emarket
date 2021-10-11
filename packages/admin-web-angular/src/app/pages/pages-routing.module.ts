import { RouterModule, Routes } from '@angular/router';
import { NgModule }             from '@angular/core';
import { environment }          from 'environments/environment';
import { PagesComponent }       from './pages.component';
import { FakeDataModuleGuard }  from './+fakeData/fakeData.module.guard';

function logModuleCatch(error: any): void
{
	if(!environment.production)
	{
		console.error(error);
	}
}

const routes: Routes = [
	{
		path:      '',
		component: PagesComponent,
		children:  [
			{
				path:       '',
				redirectTo: 'sign-in-redirect',
				pathMatch:  'full',
			},
			{
				path:         'sign-in-redirect',
				loadChildren: () => import('app/pages/+sign-in-redirect/sign-in-redirect.module')
						.then((m) => m.SignInRedirectModule)
						.catch(err => logModuleCatch(err)),
			},
			{
				path:         'dashboard',
				loadChildren: () => import('app/pages/+dashboard/dashboard.module')
						.then((m) => m.DashboardModule)
						.catch(err => logModuleCatch(err)),
			},
			{
				path:         'simulation',
				loadChildren: () => import('app/pages/+simulation/simulation.module')
						.then((m) => m.SimulationModule)
						.catch(err => logModuleCatch(err)),
			},
			{
				path:         'chats',
				loadChildren: () => import('app/pages/+chats/chats.module')
						.then((m) => m.ChatsModule)
						.catch(err => logModuleCatch(err)),
			},
			{
				path:         'stores',
				loadChildren: () => import('app/pages/+warehouses/warehouses.module')
						.then((m) => m.WarehousesModule)
						.catch(err => logModuleCatch(err)),
			},
			{
				path:         'carriers',
				loadChildren: () => import('app/pages/+carriers/carriers.module')
						.then((m) => m.CarriersModule)
						.catch(err => logModuleCatch(err)),
			},
			{
				path:         'setup',
				loadChildren: () => import('app/pages/+setup/setup.module')
						.then((m) => m.SetupModule)
						.catch(err => logModuleCatch(err)),
			},
			{
				path:         'generate-initial-data',
				loadChildren: () => import('app/pages/+fakeData/fakeData.module')
						.then((m) => m.FakeDataModule)
						.catch(err => logModuleCatch(err)),
				canActivate:  [FakeDataModuleGuard],
			},
			{
				path:         'devices',
				loadChildren: () => import('app/pages/+device/device.module')
						.then((m) => m.DeviceModule)
						.catch(err => logModuleCatch(err)),
			},
			{
				path:         'customers',
				loadChildren: () => import('app/pages/+customers/customers.module')
						.then((m) => m.CustomersModule)
						.catch(err => logModuleCatch(err)),
			},
			{
				path:         'orders',
				loadChildren: () => import('app/pages/+orders/orders.module')
						.then((m) => m.OrdersModule)
						.catch(err => logModuleCatch(err)),
			},
			{
				path:         'products',
				loadChildren: () => import('app/pages/+products/products.module')
						.then((m) => m.ProductsModule)
						.catch(err => logModuleCatch(err)),
			},
			{
				path:         'profile',
				loadChildren: () => import('app/pages/+profile/profile.module')
						.then((m) => m.ProfileModule)
						.catch(err => logModuleCatch(err)),
			},
		],
	},
];

@NgModule({
	          imports: [RouterModule.forChild(routes)],
	          exports: [RouterModule],
          })
export class PagesRoutingModule {}
