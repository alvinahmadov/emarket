import { Component, Input }      from '@angular/core';
import Order                     from '@modules/server.common/entities/Order';
import { ILocaleMember }         from '@modules/server.common/interfaces/ILocale';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';

@Component({
	           selector: 'order-delivery-problem',
	           templateUrl: './order-delivery-problem.html',
           })
export class OrderDeliveryProblemComponent
{
	@Input()
	public getWarehouseStatus: () => void;
	
	@Input()
	public order: Order;
	
	constructor(private _translateProductLocales: ProductLocalesService) {}
	
	protected localeTranslate(member: ILocaleMember[]): string
	{
		return this._translateProductLocales.getTranslate(member);
	}
}
