import { Observable }               from 'rxjs';
import { map }                      from 'rxjs/operators';
import { Router, RouterFactory }    from '../lib/router';
import _                            from 'lodash';
import { Injectable }               from '@angular/core';
import IWarehouseRouter             from '@modules/server.common/routers/IWarehouseRouter';
import Warehouse                    from '@modules/server.common/entities/Warehouse';
import IWarehouse                   from '@modules/server.common/interfaces/IWarehouse';
import { IGeoLocationCreateObject } from '@modules/server.common/interfaces/IGeoLocation';

@Injectable()
export class WarehouseRouter implements IWarehouseRouter
{
	private readonly router: Router;
	
	constructor(routerFactory: RouterFactory)
	{
		this.router = routerFactory.create('warehouse');
	}
	
	get(id: string, fullProducts: boolean = true): Observable<Warehouse>
	{
		return this.router
		           .runAndObserve<IWarehouse>('get', id, fullProducts)
		           .pipe(map((warehouse) => this._warehouseFactory(warehouse)));
	}
	
	getAllActive(fullProducts: boolean = false): Observable<Warehouse[]>
	{
		return this.router
		           .runAndObserve<IWarehouse[]>('getAllActive', fullProducts)
		           .pipe(
				           map((warehouses) =>
						               _.map(warehouses, (warehouse) =>
								               this._warehouseFactory(warehouse)
						               )
				           )
		           );
	}
	
	getAll(fullProducts: boolean = false): Observable<Warehouse[]>
	{
		return this.router
		           .runAndObserve<IWarehouse[]>('getAllStores', fullProducts)
		           .pipe(
				           map((warehouses) =>
						               _.map(warehouses, (warehouse) =>
								               this._warehouseFactory(warehouse)
						               )
				           )
		           );
	}
	
	async updateGeoLocation(
			warehouseId: string,
			geoLocation: IGeoLocationCreateObject
	): Promise<Warehouse>
	{
		const warehouse = await this.router.run<IWarehouse>(
				'updateGeoLocation',
				warehouseId,
				geoLocation
		);
		return this._warehouseFactory(warehouse);
	}
	
	async updateAvailability(
			warehouseId: string,
			isAvailable: boolean
	): Promise<Warehouse>
	{
		const warehouse = await this.router.run<IWarehouse>(
				'updateAvailability',
				warehouseId,
				isAvailable
		);
		return this._warehouseFactory(warehouse);
	}
	
	async save(w: Warehouse): Promise<Warehouse>
	{
		const warehouse = await this.router.run<IWarehouse>('save', w);
		return this._warehouseFactory(warehouse);
	}
	
	protected _warehouseFactory(warehouse: IWarehouse)
	{
		return warehouse == null ? null : new Warehouse(warehouse);
	}
}
