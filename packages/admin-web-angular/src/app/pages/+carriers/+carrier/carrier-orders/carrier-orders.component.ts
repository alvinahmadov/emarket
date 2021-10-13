// noinspection PointlessBooleanExpressionJS

import {
	Component,
	EventEmitter,
	Input,
	Output,
	OnChanges,
	OnDestroy,
	AfterViewInit,
}                                         from '@angular/core';
import _                                  from 'lodash';
import { LocalDataSource }                from 'ng2-smart-table';
import {
	Subject, Observable,
	forkJoin, Subscription
}                                         from 'rxjs';
import { TranslateService }               from '@ngx-translate/core';
import CarrierStatus                      from '@modules/server.common/enums/CarrierStatus';
import OrderCarrierStatus                 from '@modules/server.common/enums/OrderCarrierStatus';
import Carrier                            from '@modules/server.common/entities/Carrier';
import GeoLocation                        from '@modules/server.common/entities/GeoLocation';
import Order                              from '@modules/server.common/entities/Order';
import { ICarrierOrdersRouterGetOptions } from '@modules/server.common/routers/ICarrierOrdersRouter';
import { CarrierOrdersRouter }            from '@modules/client.common.angular2/routers/carrier-orders-router.service';
import { OrderRouter }                    from '@modules/client.common.angular2/routers/order-router.service';
import { CarriersService }                from '@app/@core/data/carriers.service';
import { GeoLocationOrdersService }       from '@app/@core/data/geo-location-orders.service';
import { CreatedComponent }               from '@app/@shared/render-component/created/created.component';
import { StoreOrderComponent }            from '@app/@shared/render-component/carrier-orders-table/store-order.component';
import { UserOrderComponent }             from '@app/@shared/render-component/carrier-orders-table/user-order-component';

const perPage = 3;
let searchCustomer: boolean;
let oldSearch = '';

@Component({
	           selector:    'ea-carrier-orders',
	           templateUrl: '/carrier-orders.component.html',
	           styleUrls:   ['./carrier-orders.component.scss'],
           })
export class CarrierOrdersComponent
		implements OnDestroy, OnChanges, AfterViewInit
{
	static $customerSearch = new EventEmitter<string>();
	public selectedOrder: Order;
	public subscription: Subscription;
	public carrierOnlineStatus = CarrierStatus.Online;
	
	@Input()
	protected carrierOrderOptions: ICarrierOrdersRouterGetOptions;
	
	@Input()
	protected selectedCarrier: Carrier;
	
	@Output()
	protected selectedOrderEvent = new EventEmitter<Order>();
	
	protected currentOrders: Order[];
	protected settingsSmartTable: object;
	protected sourceSmartTable: LocalDataSource = new LocalDataSource();
	protected enumOrderCarrierStatus: typeof OrderCarrierStatus = OrderCarrierStatus;
	private ngDestroy$ = new Subject<void>();
	private _isWork: boolean;
	private dataCount: number;
	private $locationOrders: Subscription;
	
	constructor(
			private carrierOrdersRouter: CarrierOrdersRouter,
			private orderRouter: OrderRouter,
			private _translateService: TranslateService,
			private carriersService: CarriersService,
			private geoLocationOrdersService: GeoLocationOrdersService
	)
	{
		this._setupSmartTable();
	}
	
	public ngAfterViewInit()
	{
		this.loadSmartTableTranslates();
		this.smartTableChange();
		
		this.subscription = CarrierOrdersComponent.$customerSearch.subscribe(
				async(searchText: string) =>
				{
					await this.loadDataCount({
						                         byRegex: [{ key: 'user.firstName', value: searchText }],
					                         });
					await this.loadSmartTableData(1, {
						byRegex: [{ key: 'user.firstName', value: searchText }],
					});
				}
		);
	}
	
	public ngOnChanges()
	{
		this.loadDataCount();
		this.getAllAvailableOrders();
		this._isWork = true;
	}
	
	public ngOnDestroy()
	{
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
		this.subscription.unsubscribe();
		this.$locationOrders.unsubscribe();
	}
	
	public get isCarrierPickupOrder(): boolean
	{
		return (
				this.selectedOrder &&
				this.selectedOrder !== undefined &&
				this.selectedOrder.carrierStatus ===
				this.enumOrderCarrierStatus.CarrierPickedUpOrder
		);
	}
	
	public get isCarrierArrivedToCustomer(): boolean
	{
		return (
				this.selectedOrder &&
				this.selectedOrder !== undefined &&
				this.selectedOrder.carrierStatus ===
				this.enumOrderCarrierStatus.CarrierArrivedToCustomer
		);
	}
	
	protected get canControl(): boolean
	{
		return _.some(this.currentOrders, (order) =>
				order
				? OrderCarrierStatus.CarrierPickedUpOrder <=
				  order.carrierStatus &&
				  OrderCarrierStatus.DeliveryCompleted >= order.carrierStatus
				: false
		);
	}
	
	public async getAllAvailableOrders()
	{
		await this.loadSmartTableData();
	}
	
	public async smartTableChange()
	{
		this.subscription = this.sourceSmartTable
		                        .onChanged()
		                        .subscribe(async(event) =>
		                                   {
			                                   if(event.action === 'page')
			                                   {
				                                   const page = event.paging.page;
				                                   this.loadSmartTableData(page);
			                                   }
		                                   });
	}
	
	public selectOrder(ev)
	{
		const order = ev.data as Order;
		
		if(this.selectedOrder && order.id === this.selectedOrder.id)
		{
			this.selectedOrderEvent.emit(null);
			this.selectedOrder = null;
			this._isWork = false;
		}
		else
		{
			this.selectedOrderEvent.emit(order);
			this.selectedOrder = order;
			this._isWork = true;
		}
	}
	
	public loadSmartTableTranslates()
	{
		this._translateService.onLangChange.subscribe(() =>
		                                              {
			                                              this._setupSmartTable();
		                                              });
	}
	
	protected async updateOrderCarrierStatus(status: OrderCarrierStatus)
	{
		this.selectedOrder = await this.orderRouter.updateCarrierStatus(
				this.selectedOrder.id,
				status
		);
		
		await this.loadSmartTableData();
	}
	
	private _setupSmartTable()
	{
		const columnTitlePrefix = 'CARRIERS_VIEW.CARRIER_PAGE.';
		const getTranslate = (name: string): Observable<string | any> =>
				this._translateService.get(columnTitlePrefix + name);
		
		this.subscription = forkJoin(
				this._translateService.get('Id'),
				getTranslate('WAREHOUSE'),
				getTranslate('CUSTOMER'),
				getTranslate('WAREHOUSE_STATUS'),
				getTranslate('CARRIER_STATUS'),
				getTranslate('CREATED')
		).subscribe(
				([
					 id,
					 warehouse,
					 customer,
					 warehouseStatus,
					 carrierStatus,
					 created,
				 ]) =>
				{
					this.settingsSmartTable = {
						actions: false,
						columns: {
							Warehouse:       {
								title:           warehouse,
								type:            'custom',
								renderComponent: StoreOrderComponent,
								width:           '20%',
							},
							Customer:        {
								title:           customer,
								type:            'custom',
								renderComponent: UserOrderComponent,
								width:           '20%',
								filterFunction(
										cell?: string,
										search?: string
								): boolean
								{
									if(!searchCustomer && oldSearch !== search)
									{
										oldSearch = search;
										
										searchCustomer = true;
										setTimeout(() =>
										           {
											           searchCustomer = false;
											
											           CarrierOrdersComponent.$customerSearch.emit(
													           search
											           );
										           }, 1000);
									}
									
									return true;
								},
							},
							WarehouseStatus: {
								title:                warehouseStatus,
								type:                 'string',
								valuePrepareFunction: (_, order: Order) =>
								                      {
									                      let warehouseStat = 'BAD_STATUS';
									                      getTranslate(
											                      order.warehouseStatusText
									                      ).subscribe((y) =>
									                                  {
										                                  warehouseStat = y;
									                                  });
									
									                      return warehouseStat;
								                      },
							},
							CarrierStatus:   {
								title:                carrierStatus,
								type:                 'string',
								valuePrepareFunction: (_, order: Order) =>
								                      {
									                      let carrierStat = 'No Status';
									                      getTranslate(order.carrierStatusText).subscribe(
											                      (y) =>
											                      {
												                      carrierStat = y;
											                      }
									                      );
									
									                      return carrierStat;
								                      },
							},
							Created:         {
								title:           created,
								type:            'custom',
								renderComponent: CreatedComponent,
							},
						},
						pager:   {
							display: true,
							perPage,
						},
					};
				}
		);
	}
	
	private async loadDataCount(searchObj?: {
		byRegex: Array<{ key: string; value: string }>;
	})
	{
		const getOrdersGeoObj = {
			loc: {
				type:        'Point',
				coordinates: this.selectedCarrier.geoLocation.loc.coordinates,
			},
		};
		this.dataCount = await this.geoLocationOrdersService.getCountOfOrdersForWork(
				getOrdersGeoObj as GeoLocation,
				this.selectedCarrier.skippedOrderIds,
				searchObj
		);
	}
	
	private async loadSmartTableData(
			page = 1,
			searchObj?: { byRegex: Array<{ key: string; value: string }> }
	)
	{
		const getOrdersGeoObj = {
			loc: {
				type:        'Point',
				coordinates: this.selectedCarrier.geoLocation.loc.coordinates,
			},
		};
		
		if(this.$locationOrders)
		{
			await this.$locationOrders.unsubscribe();
		}
		
		this.$locationOrders = this.geoLocationOrdersService
		                           .getOrdersForWork(
				                           getOrdersGeoObj as GeoLocation,
				                           this.selectedCarrier.skippedOrderIds,
				                           {
					                           skip:  perPage * (page - 1),
					                           limit: perPage,
				                           },
				                           searchObj
		                           )
		                           .subscribe(async(ordersForWork: Order[]) =>
		                                      {
			                                      const currentOrder = await this.carriersService.getCarrierCurrentOrder(
					                                      this.selectedCarrier.id
			                                      );
			
			                                      if(currentOrder)
			                                      {
				                                      this.currentOrders = [currentOrder];
			                                      }
			                                      else
			                                      {
				                                      this.currentOrders = new Array(this.dataCount);
				                                      this.currentOrders.splice(
						                                      perPage * (page - 1),
						                                      perPage,
						                                      ...ordersForWork
				                                      );
			                                      }
			
			                                      await this.sourceSmartTable.load(this.currentOrders);
		                                      });
	}
}
