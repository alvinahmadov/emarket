import {
	Component,
	Input,
	Output,
	EventEmitter,
	OnInit,
	OnChanges
}                                  from '@angular/core';
import { TranslateService }        from '@ngx-translate/core';
import _                           from 'lodash';
import WarehouseProduct            from '@modules/server.common/entities/WarehouseProduct';
import { WarehouseProductsRouter } from '@modules/client.common.angular2/routers/warehouse-products-router.service';

export type RatingType = "total" | "custom";

@Component({
	           selector:    'es-rating',
	           templateUrl: './rating.component.html',
	           styleUrls:   ['./rating.component.scss']
           })
export class RatingComponent implements OnInit, OnChanges
{
	@Input()
	public fillStar: boolean = true;
	
	@Input()
	public ratingType: RatingType = "custom";
	
	@Input()
	public warehouseProduct: WarehouseProduct;
	
	@Input()
	public warehouseId: string;
	
	@Input()
	public customerId: string;
	
	public productId: string;
	public readonly: boolean = false;
	public rate: number;
	public readonly max: number = 5;
	
	@Output()
	public rateChanged: EventEmitter<number> = new EventEmitter<number>();
	
	public readonly PREFIX: string = "PRODUCTS_VIEW.PRODUCT_DETAILS_VIEW.RATING.";
	
	constructor(
			private readonly _warehouseProductRouter: WarehouseProductsRouter,
			private readonly translateService: TranslateService
	)
	{}
	
	public ngOnInit(): void
	{
		if(this.fillStar == undefined || !this.fillStar)
			this.fillStar = true;
		
		if(this.warehouseProduct !== undefined)
		{
			this.productId = typeof this.warehouseProduct.product === "string"
			                 ? this.warehouseProduct.product
			                 : this.warehouseProduct.product.id;
			
			this.calcRate();
		}
	}
	
	public ngOnChanges(changes: any): void
	{
		this.calcRate();
	}
	
	public OnRateChange(rate: number)
	{
		if(isNaN(rate))
			return;
		
		if(!this.customerId)
			return;
		
		if(!this.warehouseId || !this.productId)
			return;
		
		this._warehouseProductRouter
		    .changeRate(
				    this.warehouseId,
				    this.productId,
				    this.customerId,
				    rate
		    );
		this.calcRate();
		
		this.rateChanged.emit(this.rate);
	}
	
	public calcRate()
	{
		if(this.ratingType === "total")
		{
			this.readonly = false;
			let ratedCount = this.warehouseProduct.rating?.length;
			if(!ratedCount)
				ratedCount = 1;
			
			this.rate = _.reduce(
					this.warehouseProduct.rating,
					(prev, curr) => prev + curr.rate,
					0
			) / ratedCount;
			this.readonly = true;
		}
		else
		{
			if(this.customerId)
			{
				const rating = this.warehouseProduct.rating
				                   .find(rating => rating.ratedBy === this.customerId);
				
				if(rating)
				{
					this.rate = rating.rate;
				}
				this.readonly = false;
			}
			else
			{
				this.rate = 0;
				this.readonly = true;
			}
		}
	}
	
	public tooltip(ratingId: number): string
	{
		if(!this.customerId)
			return this._translate("REGISTRATION_NEEDED");
		
		switch(ratingId)
		{
			case 1:
				return this._translate("BAD");
			case 2:
				return this._translate("NORMAL");
			case 3:
				return this._translate("GOOD");
			case 4:
				return this._translate("BEST");
			case 5:
				return this._translate("PRETTY");
		}
	}
	
	private _translate(key: string): string
	{
		let translationResult = "";
		key = this.PREFIX + key;
		this.translateService
		    .get(key)
		    .subscribe((res) => translationResult = res);
		
		return translationResult;
	}
}
