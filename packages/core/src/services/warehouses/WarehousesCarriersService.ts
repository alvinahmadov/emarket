import { inject, injectable, LazyServiceIdentifer }      from 'inversify';
import _                                                 from 'lodash';
import { of, Observable }                                from 'rxjs';
import {
	catchError,
	distinctUntilChanged,
	exhaustMap,
	map,
	switchMap
}                                                        from 'rxjs/operators';
import { routerName, observableListener, asyncListener } from '@pyro/io';
import Carrier                                           from '@modules/server.common/entities/Carrier';
import Warehouse                                         from '@modules/server.common/entities/Warehouse';
import IWarehouseCarriersRouter                          from '@modules/server.common/routers/IWarehouseCarriersRouter';
import { WarehousesService }                             from './WarehousesService';
import { AuthService, AuthServiceFactory }               from '../auth';
import { CarriersService }                               from '../carriers';
import { env }                                           from '../../env';

class NoWarehouseRestrictedCarriersError extends Error
{
	constructor()
	{
		super('Warehouse doesn\'t have carriers restricted to himself');
	}
}

/**
 * Warehouses Carriers Service
 *
 * @export
 * @class WarehousesCarriersService
 * @implements {IWarehouseCarriersRouter}
 */
@injectable()
@routerName('warehouse-carriers')
export class WarehousesCarriersService implements IWarehouseCarriersRouter
{
	private readonly authService: AuthService<Carrier>;
	
	constructor(
			@inject(new LazyServiceIdentifer(() => CarriersService))
			private readonly carriersService: CarriersService,
			@inject(new LazyServiceIdentifer(() => WarehousesService))
			private readonly warehousesService: WarehousesService,
			@inject('Factory<AuthService>')
			private readonly authServiceFactory: AuthServiceFactory
	)
	{
		const authConfig = {
			role: 'carrier',
			Entity: Carrier,
			saltRounds: env.CARRIER_PASSWORD_BCRYPT_SALT_ROUNDS
		};
		
		this.authService = this.authServiceFactory(authConfig);
	}
	
	/**
	 * Get Carriers assigned to given Store
	 * Returns null if !warehouse.hasRestrictedCarriers
	 * @param {String} warehouseId
	 * @returns {Observable<Carrier[] | null>}
	 */
	@observableListener()
	get(warehouseId: Warehouse['id']): Observable<Carrier[] | null>
	{
		return this.warehousesService
		           .get(warehouseId)
		           .pipe(
				           map((warehouse) =>
				               {
					               if(!warehouse.hasRestrictedCarriers)
					               {
						               throw new NoWarehouseRestrictedCarriersError();
					               }
					
					               return warehouse.usedCarriersIds;
				               }),
				           distinctUntilChanged((carrierIds1, carrierIds2) =>
				                                {
					                                return _.isEqual(carrierIds1.sort(), carrierIds2.sort());
				                                }),
				           exhaustMap((carrierIds) =>
				                      {
					                      return this.carriersService.getMultipleByIds(carrierIds);
				                      }),
				           switchMap((carriers) => carriers),
				           catchError((err) =>
				                      {
					                      if(!(err instanceof NoWarehouseRestrictedCarriersError))
					                      {
						                      throw err;
					                      }
					
					                      return of(null);
				                      })
		           );
	}
	
	/**
	 * Update carrier password
	 *
	 * @param {Carrier['id']} id
	 * @param {String} password
	 * @returns {Promise<void>}
	 * @memberof WarehousesCarriersService
	 */
	@asyncListener()
	async updatePassword(id: Carrier['id'], password: string): Promise<void>
	{
		await this.carriersService.throwIfNotExists(id);
		await this.authService.savePassword(id, password);
	}
}
