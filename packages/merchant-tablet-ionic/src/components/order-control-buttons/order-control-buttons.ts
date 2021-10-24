import { Component, Input, OnInit } from '@angular/core';
import { map }                      from 'rxjs/operators';
import DeliveryType                 from '@modules/server.common/enums/DeliveryType';
import { OrderRouter }              from '@modules/client.common.angular2/routers/order-router.service';
import { StorageService }           from 'services/storage.service';
import { WarehousesService }        from 'services/warehouses.service';

@Component({
	           selector:    'order-control-buttons',
	           styleUrls:   ['./order-control-buttons.scss'],
	           templateUrl: 'order-control-buttons.html',
           })
export class OrderControlButtonsComponent implements OnInit
{
	@Input()
	public orderId: string;
	
	@Input()
	public warehouseStatus: number;
	
	@Input()
	public carrierStatus: number;
	
	@Input()
	public onUpdateWarehouseStatus: any;
	
	@Input()
	public orderType: DeliveryType;
	
	public orderTypeDelivery: DeliveryType = DeliveryType.Delivery;
	public orderTypeTakeaway: DeliveryType = DeliveryType.Takeaway;
	
	public ordersShortProcess: boolean;
	public _storeID: string;
	
	constructor(
			private orderRouter: OrderRouter,
			private storage: StorageService,
			private warehousesService: WarehousesService
	)
	{}
	
	public ngOnInit()
	{
		this._storeID = this.storage.warehouseId;
		this.warehousesService
		    .getWarehouseOrderProcess(this._storeID)
		    .pipe(map((store) => store.ordersShortProcess))
		    .subscribe((isShortProcess) => this.ordersShortProcess = isShortProcess);
	}
}
