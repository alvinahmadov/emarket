import {
	ChangeDetectionStrategy,
	Component,
	Input,
	OnInit,
}                         from '@angular/core';
import { Platform }       from '@ionic/angular';
import _                  from 'lodash';
import { getCountryName } from '@modules/server.common/data/countries';
import OrderStatus        from '@modules/server.common/enums/OrderStatus';
import Order              from '@modules/server.common/entities/Order';
import Warehouse          from '@modules/server.common/entities/Warehouse';
import Carrier            from '@modules/server.common/entities/Carrier';
import OrderProduct       from '@modules/server.common/entities/OrderProduct';
import { CommonUtils }    from '@modules/server.common/utilities';
import { StorageService } from '../../../services/storage.service';
import { environment }    from '../../../environments/environment';

@Component({
	           selector:        'e-cu-order',
	           styleUrls:       ['./order.component.scss'],
	           templateUrl:     'order.component.html',
	           changeDetection: ChangeDetectionStrategy.OnPush,
           })
export class OrderComponent implements OnInit
{
	public carrierAddress: string;
	public createOrderdAt: number;
	public deliveryOrderTime: any;
	
	public customerDefaultLogo: string = environment.DEFAULT_CUSTOMER_LOGO;
	public orderProductsToShow: OrderProduct[] = [];
	
	@Input()
	public productsMaxAmountToShow: number;
	public carrier: Carrier;
	
	@Input()
	public order: Order;
	
	@Input()
	public showDetailsButton: boolean = false;
	
	constructor(
			private readonly storageService: StorageService,
			public platform: Platform
	)
	{}
	
	public ngOnInit()
	{
		this._sliceOrderProducts();
	}
	
	public get carrierId(): string
	{
		return this.storageService.carrierId;
	}
	
	public get customerLogo()
	{
		return this.order.customer.avatar || this.customerDefaultLogo;
	}
	
	public get id()
	{
		return this.order.id;
	}
	
	public get warehouseLogo()
	{
		return (this.order.warehouse as Warehouse).logo;
	}
	
	public get warehouseName()
	{
		return (this.order.warehouse as Warehouse).name;
	}
	
	public get customerBasicInfo()
	{
		const firstName = this.order.customer.firstName;
		const lastName = this.order.customer.lastName;
		
		return _.isEmpty(firstName) || _.isEmpty(lastName)
		       ? this.order.customer._id
		       : `${firstName} ${lastName}`;
	}
	
	public get customerAddress()
	{
		const countryName = getCountryName(
				this.storageService.language,
				this.order.customer.geoLocation.countryId
		);
		
		return `${countryName} ${this.order.customer.geoLocation.postcode}, ${this.order.customer.geoLocation.city}`;
	}
	
	public get customerNotes()
	{
		const customerNotes =
				      this.order.customer.geoLocation.notes === null
				      ? ''
				      : this.order.customer.geoLocation.notes;
		
		return `Notes: ${customerNotes}`;
	}
	
	public get warehouseAddress()
	{
		const warehouse = this.order.warehouse as Warehouse;
		const countryName = getCountryName(
				this.storageService.language,
				warehouse.geoLocation.countryId
		);
		
		return `${countryName} ${warehouse.geoLocation.postcode}, ${warehouse.geoLocation.city}`;
	}
	
	public get totalPrice()
	{
		return _.chain(this.order.products)
		        .map((p) => p.count * p.price)
		        .reduce((p1, p2) => p1 + p2)
		        .value();
	}
	
	public get createdAt(): string | Date
	{
		return this.order._createdAt;
	}
	
	public get deliveryTime()
	{
		const createOrderAtDate = this.order._createdAt;
		this.createOrderdAt = new Date(createOrderAtDate.toString()).getTime();
		const deliveryOrderDate =
				      this.order.deliveryTime !== null
				      ? this.order.deliveryTime
				      : this.createOrderdAt;
		this.deliveryOrderTime = new Date(deliveryOrderDate).getTime();
		const time = this.deliveryOrderTime - this.createOrderdAt;
		return this.order.deliveryTime !== undefined
		       ? CommonUtils.millisToMinutes(time) + ' min'
		       : 'In Delivery';
	}
	
	public get statusText(): string
	{
		return this.order.getStatusText(this.storageService.language);
	}
	
	public get badgeClass(): string
	{
		switch(this.order.status)
		{
			case OrderStatus.CanceledWhileInDelivery:
			case OrderStatus.CanceledWhileWarehousePreparation:
				return 'badge-energized';
			case OrderStatus.CarrierIssue:
			case OrderStatus.WarehouseIssue:
				return 'badge-assertive';
			default:
				return 'badge-balanced';
		}
	}
	
	public get showMoreIcon(): boolean
	{
		return this.productsMaxAmountToShow < this.order.products.length;
	}
	
	public toggleOrderProducts()
	{
		if(this.orderProductsToShow.length > this.productsMaxAmountToShow)
		{
			this._sliceOrderProducts();
		}
		else
		{
			this.orderProductsToShow = this.order.products;
		}
	}
	
	private _sliceOrderProducts()
	{
		this.orderProductsToShow = this.order.products.slice(
				0,
				this.productsMaxAmountToShow
		);
	}
}
