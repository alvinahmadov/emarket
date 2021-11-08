import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import DeliveryType                                from '@modules/server.common/enums/DeliveryType';

type SegmentSection = 'options' | 'select/add' | 'type' | 'order';

@Component({
	           selector: 'order',
	           styleUrls: ['./order.component.scss'],
	           templateUrl: './order.component.html',
           })
export class OrderComponent implements OnInit
{
	public readonly availSegmentOptions = {
		options: 'options' as SegmentSection,
		selectAdd: 'select/add' as SegmentSection,
		type: 'type' as SegmentSection,
		order: 'order' as SegmentSection,
	};
	
	@Output()
	public orderFinishedEmitter = new EventEmitter<void>();
	
	public segmentSection: SegmentSection = this.availSegmentOptions.options;
	public selectAddCustomerOption: number;
	public customerIdToOrder: string;
	public orderType: DeliveryType;
	
	public ngOnInit() {}
	
	public onOptionSelected(optionBit: number)
	{
		this.segmentSection = this.availSegmentOptions.selectAdd;
		this.selectAddCustomerOption = optionBit;
	}
	
	public onCustomerSelected(customerId: string)
	{
		this.segmentSection = this.availSegmentOptions.type;
		this.customerIdToOrder = customerId;
	}
	
	public onOrderTypeSelected(type: DeliveryType)
	{
		this.segmentSection = this.availSegmentOptions.order;
		this.orderType = type;
	}
}
