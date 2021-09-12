import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalController }                     from '@ionic/angular';
import { TranslateService }                    from '@ngx-translate/core';
import { forkJoin, Observable, Subject }       from 'rxjs';
import { takeUntil }                           from 'rxjs/operators';
import { LocalDataSource }                     from 'ng2-smart-table';
import Customer                                from '@modules/server.common/entities/Customer';
import Order                                   from '@modules/server.common/entities/Order';
import Carrier                                 from '@modules/server.common/entities/Carrier';
import CommonUtils                             from '@modules/server.common/utilities/common';
import { CustomerOrdersRouter }                from '@modules/client.common.angular2/routers/customer-orders-router.service';
import { AddressComponent }                    from '../../../components/customer-deliveries-table/address';
import { DeliveryComponent }                   from '../../../components/customer-deliveries-table/delivery';
import { OrderIdComponent }                    from '../../../components/customer-deliveries-table/orderId';
import { StatusComponent }                     from '../../../components/customer-deliveries-table/status';

@Component({
	           selector:    'customer-deliveries-popup',
	           styleUrls:   ['./customer-deliveries-popup.scss'],
	           templateUrl: './customer-deliveries-popup.html',
           })
export class CustomerDeliveriesPopupPage implements OnInit, OnDestroy
{
	@Input()
	customer: Customer;
	orders: Order[];
	ordersFromWarehouse: Order[];
	customerId: string;
	showNoDeliveryIcon: boolean;
	ordersCurrentWarehouse: Order[];
	carrier: Carrier;
	totalOrdersSum: number = 0;
	
	settingsSmartTable: object;
	sourceSmartTable = new LocalDataSource();
	
	private _ngDestroy$ = new Subject<void>();
	private $orders: any;
	
	constructor(
			public modalController: ModalController,
			private readonly userOrdersRouter: CustomerOrdersRouter,
			private readonly translateService: TranslateService
	)
	{
		this._loadSettingsSmartTable();
	}
	
	get warehouseId()
	{
		return localStorage.getItem('_warehouseId');
	}
	
	compareByCreateDate(a, b)
	{
		if(new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime())
		{
			return -1;
		}
		if(new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime())
		{
			return 1;
		}
		return 0;
	}
	
	ngOnInit(): void
	{
		this.customerId = this.customer.id;
		this.$orders = this.userOrdersRouter
		                   .get(this.customer.id)
		                   .subscribe((orders) =>
		                              {
			                              this.orders = orders;
			                              if(this.orders.length === 0)
			                              {
				                              this.showNoDeliveryIcon = true;
			                              }
			                              this.getOrders();
		                              });
	}
	
	getCustomerFullAddress(order: Order)
	{
		if(order.isCompleted)
		{
			const addressUser: Customer = order.customer as Customer;
			const geoLocation = addressUser.geoLocation;
			return `${geoLocation.city}, ${geoLocation.streetAddress} ${geoLocation.house}`;
		}
	}
	
	getTotalDeliveryTime(order: Order)
	{
		return CommonUtils.getTotalDeliveryTime(order);
	}
	
	getOrders()
	{
		const loadData = (orders) =>
		{
			const usersVM = orders.map((o: Order) =>
			                           {
				                           let status = o.isCompleted ? 'Completed' : '';
				                           status += o.isPaid ? 'Paid' : '';
				                           return {
					                           orderId:  CommonUtils.getIdFromTheDate(o),
					                           status,
					                           address:  this.getCustomerFullAddress(o),
					                           delivery: this.getTotalDeliveryTime(o),
					                           order:    o,
				                           };
			                           });
			
			this.sourceSmartTable.load(usersVM);
		};
		
		this.ordersCurrentWarehouse = this.orders.filter(
				(o: Order) => o.warehouse === this.warehouseId
		);
		this.ordersCurrentWarehouse.forEach((o) =>
		                                    {
			                                    this.totalOrdersSum += o.totalPrice;
		                                    });
		this.ordersCurrentWarehouse.sort(this.compareByCreateDate);
		loadData(this.ordersCurrentWarehouse);
		return this.ordersCurrentWarehouse;
	}
	
	cancelModal()
	{
		this.modalController.dismiss();
	}
	
	private _loadSettingsSmartTable()
	{
		const columnTitlePrefix = 'CUSTOMER_ORDERS_POP_UP.';
		const getTranslate = (name: string): Observable<string> =>
				this.translateService.get(columnTitlePrefix + name);
		
		forkJoin(
				getTranslate('ORDER_ID'),
				getTranslate('DELIVERY'),
				getTranslate('ADDRESS'),
				getTranslate('STATUS')
		)
				.pipe(takeUntil(this._ngDestroy$))
				.subscribe(([orderId, delivery, address, status]) =>
				           {
					           this.settingsSmartTable = {
						           actions: true,
						           columns: {
							           orderId:  {
								           title:           orderId,
								           class:           'text-align-left',
								           type:            'custom',
								           renderComponent: OrderIdComponent,
							           },
							           delivery: {
								           title:           delivery,
								           type:            'custom',
								           renderComponent: DeliveryComponent,
							           },
							           address:  {
								           title:           address,
								           type:            'custom',
								           renderComponent: AddressComponent,
							           },
							           status:   {
								           title:           status,
								           type:            'custom',
								           renderComponent: StatusComponent,
							           },
						           },
						           pager:   {
							           display: true,
							           perPage: 4,
						           },
					           };
				           });
	}
	
	ngOnDestroy()
	{
		if(this.$orders)
		{
			this.$orders.unsubscribe();
		}
		
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
