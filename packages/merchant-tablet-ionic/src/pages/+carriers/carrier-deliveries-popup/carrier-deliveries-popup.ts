import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalController }                     from '@ionic/angular';
import { TranslateService }                    from '@ngx-translate/core';
import Carrier                                 from '@modules/server.common/entities/Carrier';
import Order                                   from '@modules/server.common/entities/Order';
import Warehouse                               from '@modules/server.common/entities/Warehouse';
import CommonUtils                             from '@modules/server.common/utilities/common';
import { CarrierOrdersRouter }                 from '@modules/client.common.angular2/routers/carrier-orders-router.service';
import { LocalDataSource }                     from 'ng2-smart-table';
import { forkJoin, Observable, Subject }       from 'rxjs';
import { takeUntil }                           from 'rxjs/operators';
import { CustomerComponent }                   from '../../../components/carrier-deliveries-table/customer';
import { DeliveryComponent }                   from '../../../components/carrier-deliveries-table/delivery';
import { StatusComponent }                     from '../../../components/carrier-deliveries-table/status';
import { WarehouseComponent }                  from '../../../components/carrier-deliveries-table/warehouse';

@Component({
	           selector:    'carrier-deliveries-popup',
	           styleUrls:   ['./carrier-deliveries-popup.scss'],
	           templateUrl: './carrier-deliveries-popup.html',
           })
export class CarrierDeliveriesPopupPage implements OnInit, OnDestroy
{
	@Input()
	carrier: Carrier;
	
	orders: Order[];
	
	showNoDeliveryIcon: boolean;
	
	settingsSmartTable: object;
	
	sourceSmartTable = new LocalDataSource();
	
	private _ngDestroy$ = new Subject<void>();
	private $orders: any;
	
	constructor(
			private modalCtrl: ModalController,
			private readonly carrierOrdersRouter: CarrierOrdersRouter,
			private readonly translateService: TranslateService
	)
	{
		this._loadSettingsSmartTable();
	}
	
	getUserName(order: Order): string
	{
		return order.customer.fullName
	}
	
	getStoreFullAddress(order: Order)
	{
		const store: Warehouse = order.warehouse as Warehouse;
		const geoLocation = store.geoLocation;
		return `${geoLocation.city}, ${geoLocation.streetAddress} ${geoLocation.house}`;
	}
	
	getTotalDeliveryTime(order: Order)
	{
		return CommonUtils.getTotalDeliveryTime(order);
	}
	
	cancelModal()
	{
		this.modalCtrl.dismiss();
	}
	
	ngOnInit(): void
	{
		const loadData = (orders: Order[]): void =>
		{
			const dataVM = orders.map((o: Order) =>
			                          {
				                          let status = o.isCompleted
				                                       ? 'Completed'
				                                       : '';
				                          status += o.isPaid
				                                    ? 'Paid'
				                                    : '';
				                          return {
					                          customer:  this.getUserName(o),
					                          status,
					                          warehouse: o.warehouse['name'],
					                          delivery:  this.getTotalDeliveryTime(o),
					                          order:     o,
				                          };
			                          });
			
			this.sourceSmartTable.load(dataVM);
		};
		
		this.$orders = this.carrierOrdersRouter
		                   .get(this.carrier.id, {
			                   populateWarehouse: true,
			                   completion:        'completed',
		                   })
		                   .subscribe((orders: Order[]) =>
		                              {
			                              this.orders = orders;
			                              loadData(orders);
			                              if(this.orders.length === 0)
			                              {
				                              this.showNoDeliveryIcon = true;
			                              }
		                              });
	}
	
	ngOnDestroy(): void
	{
		if(this.$orders)
		{
			this.$orders.unsubscribe();
		}
	}
	
	private _loadSettingsSmartTable()
	{
		const columnTitlePrefix = 'CARRIERS_VIEW.DELIVERIES_POP_UP.';
		const getTranslate = (name: string): Observable<string> =>
				this.translateService.get(columnTitlePrefix + name);
		
		forkJoin(
				getTranslate('CUSTOMER'),
				getTranslate('WAREHOUSE'),
				getTranslate('STATUS'),
				getTranslate('DELIVERY')
		)
				.pipe(takeUntil(this._ngDestroy$))
				.subscribe(([customer, warehouse, status, delivery]) =>
				           {
					           this.settingsSmartTable = {
						           actions: true,
						           columns: {
							           customer:  {
								           title:           customer,
								           type:            'custom',
								           renderComponent: CustomerComponent,
							           },
							           warehouse: {
								           title:           warehouse,
								           type:            'custom',
								           renderComponent: WarehouseComponent,
							           },
							           status:    {
								           title:           status,
								           type:            'custom',
								           renderComponent: StatusComponent,
							           },
							           delivery:  {
								           title:           delivery,
								           type:            'custom',
								           renderComponent: DeliveryComponent,
							           },
						           },
						           pager:   {
							           display: true,
							           perPage: 5,
						           },
					           };
				           });
	}
}
