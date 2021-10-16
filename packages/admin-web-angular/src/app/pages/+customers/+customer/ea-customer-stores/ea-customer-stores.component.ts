import { Component, EventEmitter, Input, OnDestroy, OnInit, } from '@angular/core';
import { ActivatedRoute }                                     from '@angular/router';
import { NgbModal }                                           from '@ng-bootstrap/ng-bootstrap';
import { combineLatest, Subscription, Subject }               from 'rxjs';
import { first, takeUntil }                                   from 'rxjs/operators';
import { ToasterService }                                     from 'angular2-toaster';
import Customer                                               from '@modules/server.common/entities/Customer';
import GeoLocation                                            from '@modules/server.common/entities/GeoLocation';
import Warehouse                                              from '@modules/server.common/entities/Warehouse';
import { CustomerRouter }                                     from '@modules/client.common.angular2/routers/customer-router.service';
import { WarehouseViewModel }                                 from '@app/models/WarehouseViewModel';
import { WarehousesService }                                  from '@app/@core/data/warehouses.service';
import { OrdersService }                                      from '@app/@core/data/orders.service';
import { WarehouseMutationComponent }                         from '@app/@shared/warehouse/warehouse-mutation';

@Component({
	           selector:    'ea-customer-stores',
	           styleUrls:   ['./ea-customer-stores.component.scss'],
	           templateUrl: './ea-customer-stores.component.html',
           })
export class CustomerStoresComponent implements OnInit, OnDestroy
{
	@Input()
	public currentCustomer: Customer;
	
	public params$: Subscription;
	
	public sourceEventEmitter: EventEmitter<WarehouseViewModel[]> =
			       new EventEmitter<WarehouseViewModel[]>();
	
	private _selectedCustomerDestroy$: Subject<void> = new Subject<void>();
	private _ngDestroy$: Subject<void> = new Subject<void>();
	
	private _selectedWarehouses: WarehouseViewModel[] = [];
	
	constructor(
			private readonly _toasterService: ToasterService,
			private readonly _modalService: NgbModal,
			private readonly _warehousesService: WarehousesService,
			private readonly _ordersService: OrdersService,
			private readonly _router: ActivatedRoute,
			private customerRouter: CustomerRouter
	)
	{
		this.params$ = this._router
		                   .params
		                   .subscribe(
				                   async(res) =>
				                   {
					                   const customer = await this.customerRouter
					                                              .get(res.id)
					                                              .pipe(first())
					                                              .toPromise();
					                   this._destroyExceptSelectedCustomerSubscriber();
					                   this.currentCustomer = customer;
					                   if(this.currentCustomer)
					                   {
						                   this._loadNearbyWarehouses();
					                   }
				                   }
		                   );
	}
	
	public ngOnInit(): void
	{
		if(this.currentCustomer)
		{
			this._loadNearbyWarehouses();
		}
	}
	
	public ngOnDestroy(): void
	{
		this._selectedCustomerDestroy$.next();
		this._selectedCustomerDestroy$.complete();
		
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
		
		if(this.params$)
		{
			this.params$.unsubscribe();
		}
	}
	
	public get hasSelectedWarehouses(): boolean
	{
		return this._selectedWarehouses.length > 0;
	}
	
	public createWarehouseModel(): void
	{
		this._modalService.open(WarehouseMutationComponent, {
			size:      'lg',
			container: 'nb-layout',
		});
	}
	
	public deleteSelectedRows(): void
	{
		const idsForDelete: string[] = this._selectedWarehouses.map(
				(w) => w.id
		);
		
		this._warehousesService
		    .removeByIds(idsForDelete)
		    .subscribe((res: boolean) =>
		               {
			               if(res)
			               {
				               this._selectedWarehouses
				                   .forEach((warehouse) => this._toasterService.pop(
						                            `success`,
						                            `Warehouse '${warehouse.name}' DELETED`
				                            )
				                   );
				
				               this._selectedWarehouses = [];
			               }
			               else
			               {
				               this._toasterService.pop(
						               `fail`,
						               `Stores are not DELETED`
				               )
			               }
		               });
	}
	
	public selectWarehouseTmp(ev): void
	{
		this._selectedWarehouses = ev.selected;
	}
	
	private _destroyExceptSelectedCustomerSubscriber(): void
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
		this._ngDestroy$ = new Subject<void>();
	}
	
	private async _setupStoresData(warehouses: Warehouse[]): Promise<WarehouseViewModel[]>
	{
		const merchantsOrders = await this._ordersService.getMerchantsOrdersCountInfo(
				warehouses.map((w) => w.id)
		);
		
		const noInfoSign = '';
		
		return warehouses.map((warehouse) =>
		                      {
			                      const merchantOrders = merchantsOrders.find(
					                      (res) => res['id'] === warehouse.id
			                      );
			                      return {
				                      id:        warehouse.id,
				                      name:      warehouse.name || noInfoSign,
				                      email:     warehouse.contactEmail || noInfoSign,
				                      phone:     warehouse.contactPhone || noInfoSign,
				                      city:      warehouse.geoLocation.city || noInfoSign,
				                      address:   `${warehouse.geoLocation.streetAddress || noInfoSign}, №
				                      ${warehouse.geoLocation.house || noInfoSign}`,
				                      ordersQty: merchantOrders ? merchantOrders.ordersCount : 0,
				                      actions:   {
					                      actionName:    'Order',
					                      actionOwnerId: this.currentCustomer.id,
				                      },
			                      } as WarehouseViewModel;
		                      });
	}
	
	private _loadNearbyWarehouses(): void
	{
		const emitSource = async(stores: Warehouse[]) =>
		{
			const sourceResult = await this._setupStoresData(stores);
			this.sourceEventEmitter.emit(sourceResult);
		};
		
		const {
			      loc: { type, coordinates },
		      } = this.currentCustomer.geoLocation;
		const geoInput = { loc: { type, coordinates } } as GeoLocation;
		
		const stores$ = this._warehousesService.getNearbyStores(geoInput);
		
		combineLatest(stores$)
				.pipe(takeUntil(this._ngDestroy$))
				.subscribe((res) => emitSource(res[0]));
	}
}
