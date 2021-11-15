import { injectable }                                                   from 'inversify';
import Logger                                                           from 'bunyan';
import _                                                                from 'lodash';
import { Observable, of }                                               from 'rxjs';
import { concat, exhaustMap, filter, share }                            from 'rxjs/operators';
import { asyncListener, observableListener, routerName, serialization } from '@pyro/io';
import { ExistenceEventType }                                           from '@pyro/db-server';
import IWarehouse                                                       from '@modules/server.common/interfaces/IWarehouse';
import IGeoLocation                                                     from '@modules/server.common/interfaces/IGeoLocation';
import GeoLocation                                                      from '@modules/server.common/entities/GeoLocation';
import Warehouse                                                        from '@modules/server.common/entities/Warehouse';
import IGeoLocationWarehousesRouter                                     from '@modules/server.common/routers/IGeoLocationWarehousesRouter';
import { GeoUtils }                                                     from '@modules/server.common/utilities';
import { WarehousesService }                                            from '../../services/warehouses';
import IService                                                         from '../../services/IService';
import { createLogger }                                                 from '../../helpers/Log';

@injectable()
@routerName('geo-location-warehouses')
export class GeoLocationsWarehousesService
		implements IGeoLocationWarehousesRouter, IService
{
	public static TrackingDistance: number = Number.MAX_SAFE_INTEGER;
	protected log: Logger = createLogger({
		                                     name: 'geoLocationsWarehousesService'
	                                     });
	
	constructor(protected warehousesService: WarehousesService) {}
	
	public static isNearly(warehouse: Warehouse, geoLocation: GeoLocation): boolean
	{
		return (
				GeoUtils.getDistance(warehouse.geoLocation, geoLocation) <=
				GeoLocationsWarehousesService.TrackingDistance
		);
	}
	
	@observableListener()
	public get(
			@serialization((g: IGeoLocation) => new GeoLocation(g))
					geoLocation: GeoLocation,
			@serialization((o: any) => _.omit(o, ['fullProducts', 'activeOnly']))
					_options?: { fullProducts?: boolean; activeOnly?: boolean }
	): Observable<Warehouse[]>
	{
		const options = {
			fullProducts: _options != null && _options.fullProducts != null,
			activeOnly:   _options != null && _options.activeOnly != null
			              ? _options.activeOnly
			              : false
		};
		
		return of(null).pipe(
				concat(
						this.warehousesService.existence
						    .pipe(
								    filter((existenceEvent) =>
								           {
									           let warehouse: Warehouse | null;
									           let oldWarehouse: Warehouse | null;
									
									           switch(existenceEvent.type as ExistenceEventType)
									           {
										           case ExistenceEventType.Created:
											           warehouse = existenceEvent.value;
											
											           if(warehouse == null)
											           {
												           return false;
											           }
											
											           const isNearly = GeoLocationsWarehousesService.isNearly(
													           warehouse,
													           geoLocation
											           );
											
											           return (
													           isNearly &&
													           (options.activeOnly
													            ? warehouse.isActive
													            : true)
											           );
										
										           case ExistenceEventType.Updated:
											           warehouse = existenceEvent.value;
											           oldWarehouse = existenceEvent.lastValue;
											           if(warehouse == null || oldWarehouse == null)
											           {
												           return false;
											           }
											
											           return (
													           GeoLocationsWarehousesService.isNearly(
															           warehouse,
															           geoLocation
													           ) !==
													           GeoLocationsWarehousesService.isNearly(
															           oldWarehouse,
															           geoLocation
													           ) &&
													           (options.activeOnly
													            ? warehouse.isActive !==
													              oldWarehouse.isActive
													            : true)
											           );
										
										           case ExistenceEventType.Removed:
											           oldWarehouse = existenceEvent.lastValue;
											
											           if(oldWarehouse == null)
											           {
												           return false;
											           }
											
											           return (
													           GeoLocationsWarehousesService.isNearly(
															           oldWarehouse,
															           geoLocation
													           ) &&
													           (options.activeOnly
													            ? oldWarehouse.isActive
													            : true)
											           );
									           }
								           }),
								    share()
						    )
				),
				exhaustMap(() =>
						           this._factory(
								           geoLocation,
								           options
						           )
				),
				share()
		);
	}
	
	@asyncListener()
	public async getStores(
			geoLocation: IGeoLocation,
			maxDistance: number,
			options: {
				fullProducts: boolean;
				activeOnly: boolean;
				merchantsIds?: string[];
				inStoreMode?: boolean;
			}
	): Promise<IWarehouse[]>
	{
		return this._get(geoLocation as GeoLocation, options);
	}
	
	/**
	 * Get warehouses available for given location
	 *
	 * @private
	 * @param {GeoLocation} geoLocation
	 * @param {{ fullProducts: boolean; activeOnly: boolean }} options
	 * @returns {Promise<Warehouse[]>}
	 * @memberof GeoLocationsWarehousesService
	 */
	private async _get(
			geoLocation: GeoLocation,
			options: {
				fullProducts: boolean;
				activeOnly: boolean;
				merchantsIds?: string[];
				inStoreMode?: boolean;
			}
	): Promise<Warehouse[]>
	{
		const merchantsIds = options?.merchantsIds;
		let findObjOpts = _.assign({},
		                           options?.activeOnly ? { isActive: true } : {},
		                           options?.inStoreMode ? { inStoreMode: true } : {},
		                           merchantsIds && merchantsIds.length > 0
		                           ? {
					                           _id: { $in: merchantsIds }
				                           }
		                           : {}
		);
		
		return await this.warehousesService
		                 .Model
		                 .find(_.assign(
				                 {
					                 'geoLocation.loc': {
						                 $near: {
							                 $geometry:    {
								                 type:        'Point',
								                 coordinates: geoLocation.loc.coordinates
							                 },
							                 $maxDistance: GeoLocationsWarehousesService.TrackingDistance
						                 }
					                 }
				                 }, findObjOpts
		                 ))
		                 .populate(options.fullProducts ? 'products.product' : '')
		                 .lean()
		                 .exec();
	}
	
	private async _factory(geoLocation: GeoLocation, options: any)
	{
		let warehouses = await this._get(geoLocation, options);
		return warehouses.map((warehouse) => new Warehouse(warehouse));
	}
}
