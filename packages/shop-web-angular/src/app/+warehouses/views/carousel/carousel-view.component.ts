import { Component, Input, Output, EventEmitter } from '@angular/core';
import Warehouse                                  from '@modules/server.common/entities/Warehouse';

@Component({
	           selector: 'carousel-view',
	           styleUrls: ['./carousel-view.component.scss'],
	           templateUrl: './carousel-view.component.html',
           })
export class CarouselViewComponent
{
	@Input()
	warehouses: Warehouse[];
	currentIndex = 0;
	direction = 'right';
	
	warehousesCount: number = 5;
	
	@Output()
	loadWarehouses = new EventEmitter<number>();
	
	constructor()
	{}
	
	async showRight()
	{
		const warehousesLength = this.warehouses?.length;
		
		if(this.currentIndex + 1 >= warehousesLength - 3)
		{
			this.loadWarehouses.emit(this.warehousesCount);
		}
	}
}
