import { Component, Input }      from '@angular/core';
import Order                     from '@modules/server.common/entities/Order';
import OrderWarehouseStatus      from '@modules/server.common/enums/OrderWarehouseStatus';
import { ILocaleMember }         from '@modules/server.common/interfaces/ILocale';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';

@Component({
	           selector:    'order-with-carrier',
	           styleUrls:   ['./order-with-carrier.scss'],
	           templateUrl: './order-with-carrier.html',
           })
export class OrderWithCarrierComponent
{
	@Input()
	public getWarehouseStatus: () => void;
	
	@Input()
	public order: Order;
	
	@Input()
	public onUpdateWarehouseStatus: any;
	
	constructor(private _translateProductLocales: ProductLocalesService) {}
	
	public isGivenToCarrier(): boolean
	{
		return (
				this.order.warehouseStatus === OrderWarehouseStatus.GivenToCarrier
		);
	}
	
	protected localeTranslate(member: ILocaleMember[]): string
	{
		return this._translateProductLocales.getTranslate(member);
	}
}
