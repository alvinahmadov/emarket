import { Routes }                    from '@angular/router';
import { WarehouseDetailsComponent } from './warehouse-details';
import { WarehousesComponent }       from './warehouses.component';

export const routes: Routes = [
	{
		path: '',
		component: WarehousesComponent,
	},
	{
		path: 'warehouses/:warehouseId',
		component: WarehouseDetailsComponent,
	}
];
