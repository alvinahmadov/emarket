import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import DeliveryType                                from '@modules/server.common/enums/DeliveryType';

@Component({
	           selector: 'order-type',
	           styleUrls: ['./order-type.component.scss'],
	           templateUrl: './order-type.component.html',
           })
export class OrderTypeComponent implements OnInit
{
	@Output()
	public orderTypeEmitter = new EventEmitter<DeliveryType>();
	
	public ngOnInit() {}
	
	public chooseOption(type: DeliveryType)
	{
		this.orderTypeEmitter.emit(type);
	}
}
