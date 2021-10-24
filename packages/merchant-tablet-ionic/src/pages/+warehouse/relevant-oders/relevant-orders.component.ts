import {
	Component,
	Input,
	AfterViewInit,
	OnDestroy,
	OnChanges,
	Output,
	EventEmitter,
}                                 from '@angular/core';
import { Subject }                from 'rxjs';
import { takeUntil }              from 'rxjs/operators';
import OrderWarehouseStatus       from '@modules/server.common/enums/OrderWarehouseStatus';
import Order                      from '@modules/server.common/entities/Order';
import { WarehouseOrdersService } from 'services/warehouse-orders.service';
import { StorageService }         from 'services/storage.service';
import { OrderState }             from '../warehouse';

const showOrdersNumber: number = 10;

@Component({
	           selector:    'merchant-relevant-orders',
	           templateUrl: 'relevant-orders.component.html',
	           styleUrls:   ['./relevant-orders.component.scss'],
           })
export class RelevantOrdersComponent
		implements AfterViewInit, OnDestroy, OnChanges, OnDestroy
{
	@Input()
	public getWarehouseStatus: (os: OrderWarehouseStatus) => string;
	
	@Input()
	public onUpdateWarehouseStatus: any;
	
	@Input()
	public orderState: (Order) => void;
	
	@Input()
	public focusedOrder: Order;
	
	@Input()
	public isOrderContainerLive: boolean;
	
	@Output()
	public toggleOrderContainer: EventEmitter<boolean> = new EventEmitter();
	
	@Input()
	public filter: string;
	
	public orders: Order[] = [];
	public ordersCount: number;
	public OrderState: any = OrderState;
	public page: number = 1;
	public ordersLoaded: boolean;
	
	private readonly ngDestroy$ = new Subject<void>();
	private loadedPages = [];
	private subscriptions: any = [];
	
	constructor(
			private warehouseOrdersService: WarehouseOrdersService,
			private storageService: StorageService
	)
	{}
	
	public ngOnChanges()
	{
		if(this.focusedOrder)
		{
			this.orders = [this.focusedOrder];
		}
		else
		{
			this.loadAllOrders(this.filter ? this.filter : 'relevant');
		}
	}
	
	public ngAfterViewInit() {}
	
	public ngOnDestroy()
	{
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
	
	public async loadData(event = null, status = 'relevant')
	{
		const sub = this.warehouseOrdersService
		                .getStoreOrdersTableData(
				                this.storageService.warehouseId,
				                {
					                sort:  {
						                field:  '_createdAt',
						                sortBy: 'desc',
					                },
					                skip:  (this.page - 1) * showOrdersNumber,
					                limit: showOrdersNumber,
				                },
				                status
		                )
		                .pipe(takeUntil(this.ngDestroy$))
		                .subscribe((res) =>
		                           {
			                           const orders = res['orders'];
			                           const page = res['page'];
			
			                           if(!this.focusedOrder)
			                           {
				                           if(this.loadedPages.includes(res['page']))
				                           {
					                           const start = (page - 1) * showOrdersNumber;
					                           this.orders.splice(start, showOrdersNumber, ...orders);
				                           }
				                           else
				                           {
					                           this.loadedPages.push(res['page']);
					                           this.orders.push(...orders);
					
					                           this.page++;
				                           }
				                           if(event)
				                           {
					                           event.target.complete();
				                           }
			                           }
			                           this.ordersLoaded = true;
		                           });
		
		this.subscriptions.push(sub);
	}
	
	private async loadAllOrders(status = 'relevant')
	{
		await this.loadOrdersCount(status);
		
		this.orders = [];
		
		this.page = 1;
		
		for(const sub of this.subscriptions)
		{
			await sub.unsubscribe();
		}
		
		this.subscriptions = [];
		
		this.loadedPages = [];
		
		this.loadData(null, status);
	}
	
	private async loadOrdersCount(status = 'relevant')
	{
		this.ordersCount = await this.warehouseOrdersService.getCountOfStoreOrders(
				this.storageService.warehouseId,
				status
		);
	}
}
