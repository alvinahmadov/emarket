import { Component, Input }      from '@angular/core';
import { ILocaleMember }         from '@modules/server.common/interfaces/ILocale';
import Order                     from '@modules/server.common/entities/Order';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';

@Component({
	           selector:    'order-without-carrier',
	           styleUrls:   ['./order-without-carrier.scss'],
	           templateUrl: './order-without-carrier.html',
           })
export class OrderWithoutCarrierComponent
{
	@Input()
	public getWarehouseStatus: () => void;
	
	@Input()
	public order: Order;
	
	@Input()
	public onUpdateWarehouseStatus: any;
	
	constructor(private _translateProductLocales: ProductLocalesService) {}
	
	public get hasProducts(): boolean
	{
		return !!(this.order && this.order.products && this.order.products.length);
	}
	
	public localeTranslate(member: ILocaleMember[]): string
	{
		return this._translateProductLocales.getTranslate(member);
	}
}
