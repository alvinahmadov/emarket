import { inject, injectable }                       from 'inversify';
import _                                            from 'lodash';
import { ObjectId }                                 from 'bson';
import Logger                                       from 'bunyan';
import Bluebird                                     from 'bluebird';
import { of, from, Observable }                     from 'rxjs';
import { concat, exhaustMap, filter, first, share } from 'rxjs/operators';
import {
	observableListener,
	routerName,
	serialization,
	asyncListener
}                                                   from '@pyro/io';
import { ExistenceEventType }                       from '@pyro/db-server';
import IGeoLocation                                 from '@modules/server.common/interfaces/IGeoLocation';
import IGeoLocationOrdersRouter,
{
	IGeoLocationOrdersRouterOptions,
	IGeoLocationOrdersSearchObject,
	IGeoLocationOrdersPagingOptions
}                                                   from '@modules/server.common/routers/IGeoLocationOrdersRouter';
import OrderWarehouseStatus                         from '@modules/server.common/enums/OrderWarehouseStatus';
import OrderCarrierStatus                           from '@modules/server.common/enums/OrderCarrierStatus';
import Order                                        from '@modules/server.common/entities/Order';
import Warehouse                                    from '@modules/server.common/entities/Warehouse';
import GeoLocation                                  from '@modules/server.common/entities/GeoLocation';
import { GeoLocationsWarehousesService }            from './GeoLocationsWarehousesService';
import {
	WarehousesProductsService,
	WarehousesOrdersService,
	WarehousesService
}                                                   from '../warehouses';
import { OrdersService }                            from '../orders';
import IService                                     from '../IService';
import { createLogger }                             from '../../helpers/Log';

@injectable()
@routerName('geo-location-orders')
export class GeoLocationsOrdersService
		implements IGeoLocationOrdersRouter, IService
{
	protected readonly log: Logger = createLogger({
		                                              name: 'geoLocationsOrdersService'
	                                              });
	
	constructor(
			@inject(OrdersService)
			protected ordersService: OrdersService,
			@inject(WarehousesService)
			protected warehousesService: WarehousesService,
			@inject(GeoLocationsWarehousesService)
			protected geoLocationsWarehousesService: GeoLocationsWarehousesService,
			@inject(WarehousesProductsService)
			protected warehousesProductsService: WarehousesProductsService,
			@inject(WarehousesOrdersService)
			protected warehousesOrdersService: WarehousesOrdersService
	)
	{}
	
	@observableListener()
	public get(
			@serialization(
					(geoLocationParam: IGeoLocation) =>
							new GeoLocation(geoLocationParam)
			)
					geoLocation: GeoLocation,
			options: IGeoLocationOrdersRouterOptions = {}
	): Observable<Order[]>
	{
		return of(null).pipe(
				concat(
						this.ordersService.existence.pipe(
								exhaustMap((existenceEvent) =>
								           {
									           switch(existenceEvent.type as ExistenceEventType)
									           {
										           case ExistenceEventType.Created:
										           case ExistenceEventType.Updated:
											           if(existenceEvent.value != null)
											           {
												           return this.warehousesService
												                      .get(existenceEvent.value.warehouseId)
												                      .pipe(first());
											           }
											           else
											           {
												           return this.warehousesService
												                      .get('wrong')
												                      .pipe(first());
											           }
										           case ExistenceEventType.Removed:
											           if(existenceEvent.lastValue != null)
											           {
												           return this.warehousesService
												                      .get(
														                      existenceEvent.lastValue.warehouseId
												                      )
												                      .pipe(first());
											           }
											           else
											           {
												           return this.warehousesService
												                      .get('wrong')
												                      .pipe(first());
											           }
									           }
								           }),
								filter((warehouse) =>
										       warehouse != null
										       ? GeoLocationsWarehousesService.isNearly(
												       warehouse,
												       geoLocation
										       )
										       : true
								),
								share()
						)
				),
				exhaustMap(() => from(this._get(geoLocation, options)))
		);
	}
	
	@asyncListener()
	public async getCountOfOrdersForWork(
			geoLocation: IGeoLocation,
			skippedOrderIds: string[] = [],
			searchObj?: IGeoLocationOrdersSearchObject
	): Promise<number>
	{
		const merchants = await this.geoLocationsWarehousesService.getStores(
				geoLocation,
				GeoLocationsWarehousesService.TrackingDistance,
				{ fullProducts: false, activeOnly: true }
		);
		
		const merchantsIds = merchants.map((m) => m._id.toString());
		
		let searchByRegex = [];
		
		if(searchObj && searchObj.byRegex.length > 0)
		{
			searchByRegex = searchObj.byRegex.map(
					(s) => ({ [s.key]: { $regex: s.value, $options: 'i' } })
			);
		}
		
		const count = await this.ordersService.Model.aggregate(
				[
					{
						$lookup: {
							from:     'warehouses',
							let:      {
								wh: '$warehouse'
							},
							pipeline: [
								{
									$match: {
										$expr: {
											$eq: [
												{
													$toString: '$_id'
												},
												'$$wh'
											]
										}
									}
								},
								{
									$project: {
										carrierCompetition: {
											$cond: {
												if:   {
													$eq: [
														'$carrierCompetition',
														true
													]
												},
												then:
												      OrderCarrierStatus.CarrierSelectedOrder,
												else: OrderCarrierStatus.NoCarrier
											}
										}
									}
								}
							],
							as:       'fromWH'
						}
					},
					{
						$unwind: {
							path: '$fromWH'
						}
					},
					{
						$match: _.assign(
								{
									warehouse:       { $in: merchantsIds },
									warehouseStatus: {
										$eq: OrderWarehouseStatus.PackagingFinished
									},
									$expr:           {
										$lte: [
											'$carrierStatus',
											'$fromWH.carrierCompetition'
										]
									},
									_id:             { $nin: skippedOrderIds }
								},
								...searchByRegex
						)
					}
				]
		);
		return count.length;
	}
	
	@asyncListener()
	public async getOrdersForWork(
			geoLocation: IGeoLocation,
			skippedOrderIds: string[] = [],
			pagingOptions: IGeoLocationOrdersPagingOptions,
			searchObj?: IGeoLocationOrdersSearchObject
	): Promise<Order[]>
	{
		const merchants = await this.geoLocationsWarehousesService.getStores(
				geoLocation,
				GeoLocationsWarehousesService.TrackingDistance,
				{ fullProducts: false, activeOnly: true }
		);
		
		const merchantsIds = merchants.map((m) => m._id.toString());
		
		let searchByRegex = [];
		
		if(searchObj)
		{
			const byRegex = searchObj.byRegex;
			
			if(byRegex && byRegex.length > 0)
			{
				searchByRegex = byRegex.map((s) =>
				                            {
					                            return { [s.key]: { $regex: s.value, $options: 'i' } };
				                            });
			}
			
			const isCancelled = searchObj.isCancelled;
			
			if(isCancelled != null)
			{
				searchByRegex.push({ isCancelled });
			}
		}
		
		const orders = await this.ordersService.Model.aggregate(
				                         [
					                         {
						                         $lookup: {
							                         from:     'warehouses',
							                         let:      {
								                         wh: '$warehouse'
							                         },
							                         pipeline: [
								                         {
									                         $match: {
										                         $expr: {
											                         $eq: [
												                         {
													                         $toString: '$_id'
												                         },
												                         '$$wh'
											                         ]
										                         }
									                         }
								                         },
								                         {
									                         $project: {
										                         carrierCompetition: {
											                         $cond: {
												                         if:   {
													                         $eq: [
														                         '$carrierCompetition',
														                         true
													                         ]
												                         },
												                         then:
												                               OrderCarrierStatus.CarrierSelectedOrder,
												                         else: OrderCarrierStatus.NoCarrier
											                         }
										                         }
									                         }
								                         }
							                         ],
							                         as:       'fromWH'
						                         }
					                         },
					                         {
						                         $unwind: {
							                         path: '$fromWH'
						                         }
					                         },
					                         {
						                         $match: _.assign(
								                         {
									                         warehouse:       { $in: merchantsIds },
									                         warehouseStatus: {
										                         $eq: OrderWarehouseStatus.PackagingFinished
									                         },
									                         $expr:           {
										                         $lte: [
											                         '$carrierStatus',
											                         '$fromWH.carrierCompetition'
										                         ]
									                         },
									                         _id:             {
										                         $nin: skippedOrderIds.map((id) => new ObjectId(id))
									                         }
								                         },
								                         ...searchByRegex
						                         )
					                         },
					                         {
						                         $sort: {
							                         _createdAt:
									                         pagingOptions.sort &&
									                         pagingOptions.sort.toLowerCase()
									                                      .includes('desc')
									                         ? -1
									                         : 1
						                         }
					                         }
				                         ]
		                         )
		                         .allowDiskUse(true)
		                         .skip(pagingOptions.skip || 0)
		                         .limit(pagingOptions.limit || 1)
		                         .exec();
		
		return orders
				.filter((o) => o !== null)
				.filter((o) => o.orderType === 0)
				.map((o) => new Order(o));
	}
	
	/**
	 * Get Orders from Warehouses near the given location
	 *
	 * @private
	 * @param {GeoLocation} geoLocation
	 * @param {{ populateWarehouse?: boolean; populateCarrier?: boolean }} [options={}]
	 * @returns {Promise<Order[]>}
	 * @memberof GeoLocationsOrdersService
	 */
	private async _get(
			geoLocation: GeoLocation,
			options: IGeoLocationOrdersRouterOptions = {}
	): Promise<Order[]>
	{
		// First we look up warehouses which can contain interesting orders because they are close enough to given
		// location Note: we can't embed warehouse location into order document itself, because warehouses could MOVE
		// in theory while we process order. Next we will get all orders from founded warehouses
		
		const warehouses = await this.geoLocationsWarehousesService
		                             .get(geoLocation, { activeOnly: true })
		                             .pipe(first())
		                             .toPromise();
		
		this.log.info(
				{
					geoLocation,
					warehouses
				},
				'warehouses by location'
		);
		
		const orders = _.flatten(
				await Bluebird.map(warehouses, async(warehouse: Warehouse) =>
				{
					const warehouseOrders = await this.warehousesOrdersService
					                                  .get(warehouse.id, {
						                                  populateCarrier: !!options.populateCarrier
					                                  })
					                                  .pipe(first())
					                                  .toPromise();
					
					if(options.populateWarehouse)
					{
						_.each(
								warehouseOrders,
								(order) => (order.warehouse = warehouse)
						);
					}
					
					this.log.info(
							{
								geoLocation,
								warehouseOrders,
								warehouse
							},
							'orders by warehouse'
					);
					
					return warehouseOrders;
				})
		);
		
		this.log.info(
				{
					geoLocation,
					orders
				},
				'orders by warehouses'
		);
		
		return orders;
	}
}
