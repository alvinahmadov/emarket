import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router }                  from '@angular/router';
import _                                           from 'lodash';
import { Subject, Subscription }                   from 'rxjs';
import { first }                                   from 'rxjs/operators';
import { ToasterService }                          from 'angular2-toaster';
import { ICarrierCreateObject }                    from '@modules/server.common/interfaces/ICarrier';
import CarrierStatus                               from '@modules/server.common/enums/CarrierStatus';
import OrderCarrierStatus                          from '@modules/server.common/enums/OrderCarrierStatus';
import Order                                       from '@modules/server.common/entities/Order';
import Carrier                                     from '@modules/server.common/entities/Carrier';
import { ICarrierOrdersRouterGetOptions }          from '@modules/server.common/routers/ICarrierOrdersRouter';
import { CarriersService }                         from '@app/@core/data/carriers.service';
import { CarrierOrdersComponent }                  from './carrier-orders/carrier-orders.component';

@Component({
	           selector:    'ea-carrier',
	           styleUrls:   ['./carrier.component.scss'],
	           templateUrl: './carrier.component.html',
           })
export class CarrierComponent implements OnInit, OnDestroy
{
	@ViewChild('carrierOrders', { static: false })
	public carrierOrders: CarrierOrdersComponent;
	public carriers: Carrier[];
	public carrierOrderOptions: ICarrierOrdersRouterGetOptions;
	public selectedOrdersId: string[] = [];
	public selectedOrder: Order;
	public selectedCarrier: Carrier;
	private ngDestroy$ = new Subject();
	private inDeliveryOrders: Order[] = [];
	private closeOrders: Order[] = [];
	private carriers$: Subscription;
	private currentTab: string;
	
	constructor(
			private readonly _route: ActivatedRoute,
			private readonly _router: Router,
			private readonly _toasterService: ToasterService,
			private carriersService: CarriersService
	)
	{}
	
	public ngOnInit()
	{
		this.getAllCarriers();
	}
	
	public ngOnDestroy()
	{
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
		if(this.carriers$)
		{
			this.carriers$.unsubscribe();
		}
	}
	
	public get showOrderStatus()
	{
		return (
				this.selectedOrder &&
				this.selectedOrder.carrierStatus <
				OrderCarrierStatus.CarrierPickedUpOrder &&
				this.selectedCarrier &&
				this.selectedCarrier.status === CarrierStatus.Online
		);
	}
	
	public get isCarrierDelivering()
	{
		return this.inDeliveryOrders.length > 0;
	}
	
	public get currentOrders()
	{
		if(this.isCarrierDelivering)
		{
			return this.inDeliveryOrders;
		}
		else
		{
			return this.closeOrders;
		}
	}
	
	public get shouldShowOrdersStatusesControl()
	{
		return (
				this.selectedOrdersId.length > 0 &&
				_.find(
						this.currentOrders,
						(order) => order.id === this.selectedOrdersId[0]
				)!.carrierStatus <= OrderCarrierStatus.CarrierSelectedOrder
		);
	}
	
	public getChangeOrder(order: Order)
	{
		this.selectedOrder = order;
	}
	
	public getChangeCarrier(carrier: Carrier)
	{
		if(carrier.status === CarrierStatus.Offline)
		{
			this.carrierOrders.selectedOrder = null;
			this.selectedOrder = null;
		}
	}
	
	public carrierSelect(newCarrier: unknown)
	{
		const carrier = newCarrier as Carrier;
		this._router.navigate([`/carriers/${carrier.id}`]);
		
		this.selectedOrder = null;
		
		const objToCompare: ICarrierOrdersRouterGetOptions = {
			populateWarehouse: true,
			completion:        'not-completed',
		};
		
		this.carrierOrderOptions =
				this.carrierOrderOptions === objToCompare ? null : objToCompare;
		
		this.selectedCarrier =
				this.selectedCarrier === carrier ? null : carrier;
	}
	
	public getAllCarriers()
	{
		this.carriers$ = this.carriersService
		                     .getCarriers()
		                     .subscribe((carriers: Carrier[]) =>
		                                {
			                                this.carriers = carriers;
			                                this._selectCarrierIfIdExists();
		                                });
	}
	
	public orderStatusShow(warehouseOrderProducts)
	{
		if(warehouseOrderProducts)
		{
			// TODO: next line is most probably a bug, because selectedOrdersId is array,
			// but warehouseOrderProducts.id is single value!
			this.selectedOrdersId = warehouseOrderProducts.id;
			this.selectedOrder = warehouseOrderProducts;
		}
		else
		{
			this.selectedOrder = null;
		}
	}
	
	public selectTab(ev)
	{
		if(this.currentTab !== ev.tabTitle)
		{
			this.currentTab = ev.tabTitle;
			if(this.carrierOrders)
			{
				this.carrierOrders.selectedOrder = null;
			}
			this.selectedOrder = null;
		}
	}
	
	public selectedOrdersChange(selectedOrdersIds: string[])
	{
		this.selectedOrdersId = selectedOrdersIds;
	}
	
	private async _selectCarrierIfIdExists()
	{
		const p = await this._route.params.pipe(first()).toPromise();
		
		const carrierId = p.id;
		if(carrierId !== undefined)
		{
			const carrier = this.carriers.find(
					(c) => c._id.toString() === carrierId
			);
			if(carrier !== undefined)
			{
				this.carrierSelect(carrier as Carrier);
			}
			else
			{
				this._toasterService.pop(
						`warning`,
						`Carrier with id '${carrierId}' is not active!`
				);
			}
		}
	}
}
