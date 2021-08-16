import Logger                 from 'bunyan';
import _                      from 'lodash';
import { inject, injectable } from 'inversify';
import {
	Observable,
	of
}                             from 'rxjs';
import {
	concat,
	exhaustMap,
	first,
	map,
	switchMap,
	tap
}                             from 'rxjs/operators';
import { v1 as uuid }         from 'uuid';
import {
	asyncListener,
	observableListener,
	routerName,
	serialization
}                             from '@pyro/io';
import { DBService }          from '@pyro/db-server';
import { CreateObject }       from "@pyro/db/db-create-object";
import IWarehouse             from '@modules/server.common/interfaces/IWarehouse';
import { IGeoLocationCreateObject } from '@modules/server.common/interfaces/IGeoLocation';
import IPagingOptions               from '@modules/server.common/interfaces/IPagingOptions';
import Warehouse                    from '@modules/server.common/entities/Warehouse';
import IWarehouseRouter             from '@modules/server.common/routers/IWarehouseRouter';
import IService                     from '../IService';
import { ProductsService }          from '../products';
import { createLogger }             from '../../helpers/Log';

/**
 * Warehouses Service
 *
 * @export
 * @class WarehousesService
 * @extends {DBService<Warehouse>}
 * @implements {IWarehouseRouter}
 * @implements {IService}
 */
@injectable()
@routerName('warehouse')
export class WarehousesService extends DBService<Warehouse>
		implements IWarehouseRouter, IService
{
	public readonly DBObject: any = Warehouse;
	
	protected log: Logger = createLogger({ name: 'warehousesService' });
	
	constructor(
			@inject(ProductsService)
			private readonly productsService: ProductsService
	)
	{
		super();
	}
	
	@asyncListener()
	async create(warehouse: CreateObject<Warehouse>): Promise<Warehouse>
	{
		return super.create(warehouse);
	}
	
	/**
	 * Get Merchants
	 *
	 * @param {*} findInput
	 * @param {IPagingOptions} pagingOptions
	 * @returns
	 * @memberof WarehousesService
	 */
	async getMerchants(findInput: any, pagingOptions: IPagingOptions)
	{
		const sortObj = {};
		if(pagingOptions.sort)
		{
			sortObj[pagingOptions.sort.field] = pagingOptions.sort.sortBy;
		}
		
		return this.Model
		           .find({
			                 ...findInput,
			                 isDeleted: { $eq: false }
		                 })
		           .sort(sortObj)
		           .skip(pagingOptions.skip)
		           .limit(pagingOptions.limit)
		           .lean()
		           .exec();
	}
	
	/**
	 * Get all active merchants
	 *
	 * @param {boolean} [fullProducts=false]
	 * @returns {Observable<Warehouse[]>}
	 * @memberof WarehousesService
	 */
	@observableListener()
	getAllActive(fullProducts: boolean = false): Observable<Warehouse[]>
	{
		const callId = uuid();
		
		this.log.info(
				{ callId, fullProducts },
				'.getAllActive(fullProducts) called'
		);
		
		return of(null).pipe(
				concat(this.existence),
				exhaustMap(() => this._getAllCurrentActive(fullProducts)),
				tap({
					    next: (warehouses: Warehouse[]) =>
					    {
						    this.log.info(
								    { callId, fullProducts, warehouses },
								    '.getAllActive(fullProducts) emitted next value'
						    );
					    },
					    error: (err: any) =>
					    {
						    this.log.error(
								    { callId, fullProducts, err },
								    '.getAllActive(fullProducts) thrown error!'
						    );
					    }
				    })
		);
	}
	
	/**
	 * Get all merchants
	 *
	 * @param {boolean} [fullProducts=false]
	 * @returns {Observable<Warehouse[]>}
	 * @memberof WarehousesService
	 */
	@observableListener()
	getAllStores(fullProducts: boolean = false): Observable<Warehouse[]>
	{
		const callId = uuid();
		
		this.log.info(
				{ callId, fullProducts },
				'.getAllStores(fullProducts) called'
		);
		
		return of(null)
				.pipe(
						concat(this.existence),
						exhaustMap(() => this._getAllStores(fullProducts)),
						tap({
							    next: (warehouses: Warehouse[]) =>
							    {
								    this.log.info(
										    { callId, fullProducts, warehouses },
										    '.getAllStores(fullProducts) emitted next value'
								    );
							    },
							    error: (err: any) =>
							    {
								    this.log.error(
										    { callId, fullProducts, err },
										    '.getAllStores(fullProducts) thrown error!'
								    );
							    }
						    })
				);
	}
	
	/**
	 * Get Merchant
	 *
	 * @param {string} id
	 * @param {boolean} [fullProducts=true]
	 * @returns {(Observable<Warehouse | null>)}
	 * @memberof WarehousesService
	 */
	@observableListener()
	get(id: string, fullProducts = true): Observable<Warehouse | null>
	{
		if(!fullProducts)
		{
			return super.get(id)
			            .pipe(
					            map(async(warehouse: Warehouse | null) =>
					                {
						                await this.throwIfNotExists(id);
						                return warehouse;
					                }),
					            switchMap((warehouse: Promise<Warehouse>) => warehouse)
			            );
		}
		else
		{
			return super.get(id)
			            .pipe(
					            map(async(warehouse: Warehouse | null) =>
					                {
						                await this.throwIfNotExists(id);
						                return warehouse;
					                }),
					            switchMap((warehouse) => warehouse)
			            )
			            .pipe(exhaustMap(() => this._get(id, true)));
		}
	}
	
	/**
	 * Set new location for existed warehouse
	 * Note: we support moving merchants. For example, some people/companies sell products on the "go".
	 * In such case, this method will be called periodically to update Merchant location in real-time
	 *
	 * @param {string} warehouseId
	 * @param {IGeoLocationCreateObject} geoLocation
	 * @returns {Promise<Warehouse>}
	 * @memberof WarehousesService
	 */
	@asyncListener()
	async updateGeoLocation(
			warehouseId: string,
			geoLocation: IGeoLocationCreateObject
	): Promise<Warehouse>
	{
		await this.throwIfNotExists(warehouseId);
		return this.update(warehouseId, { geoLocation });
	}
	
	/**
	 * Set warehouse to available or not available
	 * (e.g. warehouse close or open etc)
	 *
	 * @param {string} warehouseId
	 * @param {boolean} isAvailable
	 * @returns {Promise<Warehouse>}
	 * @memberof WarehousesService
	 */
	@asyncListener()
	async updateAvailability(
			warehouseId: string,
			isAvailable: boolean
	): Promise<Warehouse>
	{
		// await this.throwIfNotExists(warehouseId);
		return this.update(warehouseId, { isActive: isAvailable });
	}
	
	/**
	 * Update Merchant details
	 *
	 * @param {Warehouse} warehouse
	 * @returns {Promise<Warehouse>}
	 * @memberof WarehousesService
	 */
	@asyncListener()
	async save(
			@serialization((w: IWarehouse) => new Warehouse(w)) warehouse: Warehouse
	): Promise<Warehouse>
	{
		// await this.throwIfNotExists(warehouse.id);
		
		warehouse = _.clone(warehouse);
		
		_.each(warehouse.products, (warehouseProduct) =>
		{
			warehouseProduct.product = warehouseProduct.productId;
		});
		
		return this.update(warehouse.id, warehouse);
	}
	
	/**
	 * Check if merchant record exists and not deleted.
	 * Throws exception if not found or deleted.
	 *
	 * @param {string} storeId
	 * @memberof WarehousesService
	 */
	async throwIfNotExists(storeId: string): Promise<void>
	{
		const store = await super.get(storeId)
		                         .pipe(first())
		                         .toPromise();
		
		if(!store || store.isDeleted)
		{
			throw Error(`Store with id '${storeId}' does not exists!`);
		}
	}
	
	private async _get(id: string, fullProducts = false): Promise<Warehouse>
	{
		const _warehouse = (await this.Model
		                              .findById(id)
		                              .populate(fullProducts ? 'products.product' : '')
		                              .lean()
		                              .exec()) as IWarehouse;
		
		return new Warehouse(_warehouse);
	}
	
	private async _getAllCurrentActive(
			fullProducts = false
	): Promise<Warehouse[]>
	{
		return _.map(
				(await this.Model
				           .find({
					                 isActive: true,
					                 isDeleted: { $eq: false }
				                 })
				           .populate(fullProducts ? 'products.product' : '')
				           .lean()
				           .exec()) as IWarehouse[],
				(warehouse) => new Warehouse(warehouse)
		);
	}
	
	private async _getAllStores(fullProducts = false): Promise<Warehouse[]>
	{
		return _.map(
				(await this.Model
				           .find({
					                 isDeleted: { $eq: false }
				                 })
				           .populate(fullProducts ? 'products.product' : '')
				           .lean()
				           .exec()) as IWarehouse[],
				(warehouse) => new Warehouse(warehouse)
		);
	}
}
