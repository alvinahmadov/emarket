import { Component, Input } from '@angular/core';
import WarehouseProduct     from '@modules/server.common/entities/WarehouseProduct';

@Component({
	           selector:    'product-discount',
	           styleUrls:   ['./discount.scss'],
	           templateUrl: './discount.html',
           })
export class DiscountComponent
{
	@Input()
	public currentProduct: WarehouseProduct;
	
	constructor() {}
	
	/**
	 * @returns % of discount, e.g. 25 (so we display it as 25% in UI)
	 * Returns 0 if no discount
	 * */
	public getDiscount()
	{
		if(
				!this.currentProduct ||
				!this.currentProduct.initialPrice ||
				this.currentProduct.price === this.currentProduct.initialPrice
		)
		{
			return 0;
		}
		
		return Math.floor(
				(1 - this.currentProduct.price / this.currentProduct.initialPrice) *
				100
		);
	}
}
