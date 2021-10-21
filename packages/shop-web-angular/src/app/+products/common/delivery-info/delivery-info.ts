import { Component, Input, OnInit } from '@angular/core';
import { TranslateService }         from '@ngx-translate/core';
import { first }                    from 'rxjs/operators';
import DeliveryType                 from '@modules/server.common/enums/DeliveryType';
import WarehouseProduct             from '@modules/server.common/entities/WarehouseProduct';
import { StorageService }           from 'app/services/storage';
import { environment }              from 'environments/environment';

const defaultDeliveryTimeMin = environment.DELIVERY_TIME_MIN;
const defaultDeliveryTimeMax = environment.DELIVERY_TIME_MAX;

@Component({
	           selector:    'product-delivery-info',
	           styleUrls:   ['./delivery-info.scss'],
	           templateUrl: './delivery-info.html',
           })
export class DeliveryInfoComponent implements OnInit
{
	@Input()
	public currentProduct: WarehouseProduct;
	
	@Input()
	public overImage: boolean;
	
	@Input()
	public hasDiscount: boolean;
	
	private deliveryText: string;
	private takeawayText: string;
	private minutesText: string;
	private readyForText: string;
	
	private readonly isTakeaway: boolean;
	
	constructor(
			private translateService: TranslateService,
			private storage: StorageService
	)
	{
		this.isTakeaway = this.storage.deliveryType === DeliveryType.Takeaway;
	}
	
	public ngOnInit(): void
	{
		this.getDeliveryText();
		this.getTakeawayText();
		this.getMinutesText();
		this.getReadyForText();
	}
	
	public async getDeliveryText()
	{
		this.deliveryText = await this.translateService
		                              .get('PRODUCTS_VIEW.DELIVERY')
		                              .pipe(first())
		                              .toPromise();
	}
	
	public async getTakeawayText()
	{
		this.takeawayText = await this.translateService
		                              .get('PRODUCTS_VIEW.TAKEAWAY')
		                              .pipe(first())
		                              .toPromise();
	}
	
	public async getMinutesText()
	{
		this.minutesText = await this.translateService
		                             .get('PRODUCTS_VIEW.MINUTES')
		                             .pipe(first())
		                             .toPromise();
	}
	
	public async getReadyForText()
	{
		this.readyForText = await this.translateService
		                              .get('PRODUCTS_VIEW.READYFOR')
		                              .pipe(first())
		                              .toPromise();
	}
	
	public getIsInstant(currentProduct: WarehouseProduct): boolean
	{
		if(currentProduct == null)
		{
			return false;
		}
		
		const productInfo = currentProduct;
		
		if(productInfo.isDeliveryRequired)
		{
			// Delivery
			return productInfo.deliveryTimeMax !=
			       null /*should always be not null*/ &&
			       productInfo.deliveryTimeMax <= 15;
		}
		else
		{
			// For Takeaway
			return productInfo.deliveryTimeMax == null ||
			       productInfo.deliveryTimeMax <= 15;
		}
	}
	
	public getProductDeliverySignIconName()
	{
		if(this.currentProduct == null)
		{
			return '';
		}
		
		return this.isTakeaway ? 'flash_on' : 'directions_bike';
	}
	
	public getProductDeliveryLine1()
	{
		if(this.currentProduct == null)
		{
			return '';
		}
		
		const productInfo = this.currentProduct;
		
		if(!this.isTakeaway)
		{
			// Delivery
			if(
					productInfo.deliveryTimeMax != null &&
					productInfo.deliveryTimeMin != null
			)
			{
				return (
						productInfo.deliveryTimeMin +
						'-' +
						productInfo.deliveryTimeMax +
						' ' +
						this.minutesText
				);
			}
			else
			{
				return (
						defaultDeliveryTimeMin +
						'-' +
						defaultDeliveryTimeMax +
						' ' +
						this.minutesText
				);
			}
		}
		else
		{
			// For Takeaway
			
			if(
					productInfo.deliveryTimeMax == null ||
					productInfo.deliveryTimeMax <= 15
			)
			{
				// If it's instant takeaway
				return this.readyForText;
			}
			else
			{
				// not instant takeaway
				if(
						productInfo.deliveryTimeMax != null &&
						productInfo.deliveryTimeMin != null
				)
				{
					return (
							productInfo.deliveryTimeMin +
							'-' +
							productInfo.deliveryTimeMax +
							' ' +
							this.minutesText
					);
				}
				else
				{
					return (
							defaultDeliveryTimeMin +
							'-' +
							defaultDeliveryTimeMax +
							' ' +
							this.minutesText
					);
				}
			}
		}
	}
	
	public getProductDeliveryLine2()
	{
		if(this.currentProduct == null)
		{
			return '';
		}
		
		if(!this.isTakeaway)
		{
			return this.deliveryText;
		}
		else
		{
			return this.takeawayText;
		}
	}
}
