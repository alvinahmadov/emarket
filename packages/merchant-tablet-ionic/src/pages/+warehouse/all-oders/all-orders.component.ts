import {
	Component,
	Input,
	OnInit,
	OnDestroy,
	OnChanges,
	Output,
	EventEmitter,
}                                 from '@angular/core';
import { Subscription }           from 'rxjs';
import Order                      from '@modules/server.common/entities/Order';
import { StorageService }         from 'services/storage.service';
import { WarehouseOrdersService } from 'services/warehouse-orders.service';
import { OrderState }             from '../warehouse';

@Component({
	           selector:    'merchant-all-orders',
	           templateUrl: 'all-orders.component.html',
	           styleUrls:   ['./all-orders.component.scss'],
           })
export class AllOrdersComponent implements OnInit, OnDestroy, OnChanges
{
	@Input()
	public getWarehouseStatus: () => void;
	
	@Input()
	public onUpdateWarehouseStatus: any;
	
	@Input()
	public orderState: (order: Order) => OrderState;
	
	@Input()
	public focusedOrder: Order;
	
	@Input()
	public isOrderContainerLive: boolean;
	
	@Output()
	public toggleOrderContainer: EventEmitter<boolean> = new EventEmitter();
	
	public orders: Order[] = [];
	public ordersCount: number;
	public OrderState: OrderState;
	public page: number = 1;
	public ordersLoaded: boolean;
	
	private orders$: Subscription;
	
	constructor(
			private warehouseOrdersService: WarehouseOrdersService,
			private store: StorageService
	)
	{}
	
	public ngOnDestroy()
	{
		if(this.orders$)
		{
			this.orders$.unsubscribe();
		}
	}
	
	public ngOnChanges()
	{
		if(this.focusedOrder)
		{
			this.orders = [this.focusedOrder];
		}
		else
		{
			this.orders = [];
			this.page = 1;
			this.loadAllOrders();
		}
	}
	
	public checkOrderState(order: Order, state: OrderState): boolean
	{
		return this.orderState(order) === state;
	}
	
	public ngOnInit()
	{
		this.loadAllOrders();
	}
	
	public async loadPage(page: number)
	{
		if(this.orders$)
		{
			await this.orders$.unsubscribe();
		}
		
		this.orders$ = this.warehouseOrdersService
		                   .getStoreOrdersTableData(
				                   this.store.warehouseId,
				                   {
					                   sort:  {
						                   field:  '_createdAt',
						                   sortBy: 'desc',
					                   },
					                   skip:  (page - 1) * 10,
					                   limit: 10,
				                   },
				                   'all'
		                   )
		                   .subscribe(async(res) =>
		                              {
			                              const orders = res['orders'];
			                              await this.loadOrdersCount();
			
			                              if(!this.focusedOrder)
			                              {
				                              this.page = page;
				                              this.orders = orders;
			                              }
			                              this.ordersLoaded = true;
		                              });
	}
	
	private async loadAllOrders()
	{
		await this.loadOrdersCount();
		this.loadPage(1);
	}
	
	private async loadOrdersCount()
	{
		this.ordersCount = await this.warehouseOrdersService.getCountOfStoreOrders(
				this.store.warehouseId,
				'all'
		);
	}
}
