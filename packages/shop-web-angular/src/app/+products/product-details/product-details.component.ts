import {
	Component, HostBinding,
	OnDestroy, OnInit, AfterViewInit
}                                              from '@angular/core';
import { ActivatedRoute, Router }              from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { TranslateService }                    from '@ngx-translate/core';
import { Subject }                             from 'rxjs';
import { takeUntil, first }                    from 'rxjs/operators';
import { ILocaleMember }                       from '@modules/server.common/interfaces/ILocale';
import { IProductImage }                       from '@modules/server.common/interfaces/IProduct';
import IWarehouse                              from '@modules/server.common/interfaces/IWarehouse';
import DeliveryType                            from '@modules/server.common/enums/DeliveryType';
import RegistrationSystem                      from '@modules/server.common/enums/RegistrationSystem';
import Product                                 from '@modules/server.common/entities/Product';
import Warehouse                               from '@modules/server.common/entities/Warehouse';
import WarehouseProduct                        from '@modules/server.common/entities/WarehouseProduct';
import { ProductLocalesService }               from '@modules/client.common.angular2/locale/product-locales.service';
import { OrderRouter }                         from '@modules/client.common.angular2/routers/order-router.service';
import { WarehouseRouter }                     from '@modules/client.common.angular2/routers/warehouse-router.service';
import { WarehouseOrdersRouter }               from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { WarehouseProductsRouter }             from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import { environment }                         from 'environments/environment';
import { StorageService }                      from 'app/services/storage';

const defaultDeliveryTimeMin = environment.DELIVERY_TIME_MIN;
const defaultDeliveryTimeMax = environment.DELIVERY_TIME_MAX;

interface RouteParams
{
	productId: string;
	warehouseId: string;
}

@Component({
	           selector:    'product-details',
	           styleUrls:   ['./product-details.component.scss'],
	           animations:  [
		           trigger('enterAnimation', [
			           transition(':enter', [
				           style({ opacity: 0 }),
				           animate('200ms', style({ opacity: 1 })),
			           ]),
			           transition(':leave', [
				           style({ opacity: 1 }),
				           animate('200ms', style({ opacity: 0 })),
			           ]),
		           ]),
	           ],
	           templateUrl: './product-details.component.html',
           })
export class ProductDetailsComponent implements OnInit, AfterViewInit, OnDestroy
{
	@HostBinding('@enterAnimation')
	public enterAnimation: any;
	
	public readonly PREFIX: string = "PRODUCTS_VIEW.";
	public readonly READY_FOR: string = "READYFOR"
	public readonly MINUTES: string = "MINUTES";
	
	public productId: string;
	public warehouseId: string;
	
	public warehouse: IWarehouse;
	public warehouseProduct: WarehouseProduct;
	
	public images: IProductImage[];
	
	public isTakeaway: boolean;
	
	public warehouseLoaded: boolean = false;
	
	private _ngDestroy$: Subject<void> = new Subject<void>();
	private minutesText: string;
	private readyForText: string;
	
	constructor(
			private readonly route: ActivatedRoute,
			private readonly router: Router,
			private readonly warehouseRouter: WarehouseRouter,
			private readonly warehouseProductsRouter: WarehouseProductsRouter,
			private readonly warehouseOrdersRouter: WarehouseOrdersRouter,
			private readonly orderRouter: OrderRouter,
			private readonly _productLocalesService: ProductLocalesService,
			public readonly storage: StorageService,
			private translateService: TranslateService
	)
	{
		this.isTakeaway = this.storage.deliveryType === DeliveryType.Takeaway;
		this.route.params
		    .pipe(takeUntil(this._ngDestroy$))
		    .subscribe((params: RouteParams) => this.onParams(params));
	}
	
	public ngOnInit()
	{}
	
	public ngAfterViewInit(): void
	{
		this.getMinutesText();
		this.getReadyForText();
		this.warehouseRouter
		    .get(this.warehouseId, true)
		    .pipe(
				    takeUntil(this._ngDestroy$),
				    first()
		    )
		    .subscribe((warehouse: Warehouse) =>
		               {
			               this.warehouseProduct = warehouse.products.filter(
					               (res) => res.product['id'] === this.productId
			               )[0];
			               this.warehouse = warehouse;
			
			               // if(!this.storage.getSeen(this.productId))
			               // {
			               //     this.warehouseProductsRouter
			               //         .increaseViewsCount(this.warehouseId, this.productId, 1);
			               //     this.storage.setSeen(this.productId, true);
			               // }
			               this.warehouseLoaded = true;
			               this.loadImages();
		               });
	}
	
	public ngOnDestroy()
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	public async createOrder(): Promise<void>
	{
		if(
				!this.storage.customerId &&
				this.storage.registrationSystem === RegistrationSystem.Disabled
		)
		{
			this.storage.registrationSystem = RegistrationSystem.Once;
			this.storage.buyProductId = this.warehouseProduct.id;
			this.storage.merchantId = this.warehouseId;
			this.router.navigate(['/auth'])
			    .catch(err => console.error(err));
		}
		else
		{
			const customerId = this.storage.customerId;
			
			const order = await this.warehouseOrdersRouter.createByProductType(
					customerId,
					this.warehouseId,
					this.productId,
					this.storage.deliveryType
			);
			
			await this.orderRouter.confirm(order.id);
			
			await this.router.navigate(['/orders']);
		}
	}
	
	public getDeliveryTime(): string
	{
		if(this.warehouseProduct != null)
		{
			
			if(!this.isTakeaway)
			{
				if(
						this.warehouseProduct.deliveryTimeMax != null &&
						this.warehouseProduct.deliveryTimeMin != null
				)
				{
					return (
							this.warehouseProduct.deliveryTimeMin +
							'-' +
							this.warehouseProduct.deliveryTimeMax +
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
				if(
						this.warehouseProduct.deliveryTimeMax == null ||
						this.warehouseProduct.deliveryTimeMax <= 15
				)
				{
					return this.readyForText;
				}
				else
				{
					// noinspection PointlessBooleanExpressionJS
					if(
							this.warehouseProduct.deliveryTimeMax != null &&
							this.warehouseProduct.deliveryTimeMin != null
					)
					{
						return (
								this.warehouseProduct.deliveryTimeMin +
								'-' +
								this.warehouseProduct.deliveryTimeMax +
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
	}
	
	public localeTranslate(member: ILocaleMember[]): string
	{
		return this._productLocalesService.getTranslate(member);
	}
	
	public selectImage(
			topImage: HTMLImageElement,
			image: IProductImage
	)
	{
		topImage.src = image.url;
	}
	
	private onParams(params: RouteParams): void
	{
		this.productId = params.productId;
		this.warehouseId = params.warehouseId;
	}
	
	private getMinutesText()
	{
		this.translateService
		    .get(this.PREFIX + this.MINUTES)
		    .pipe(
				    takeUntil(this._ngDestroy$),
				    first()
		    )
		    .subscribe(text => this.minutesText = text);
	}
	
	private getReadyForText()
	{
		this.translateService
		    .get(this.PREFIX + this.READY_FOR)
		    .pipe(
				    takeUntil(this._ngDestroy$),
				    first()
		    )
		    .subscribe(text => this.readyForText = text);
	}
	
	private loadImages()
	{
		const currentProduct = this.warehouseProduct.product as Product;
		
		if(currentProduct.images.length > 1)
		{
			const horizontal = currentProduct.images.filter(
					(i: IProductImage) => i.orientation === 2
			);
			
			const vertical = currentProduct.images.filter(
					(i: IProductImage) => i.orientation !== 2
			);
			
			if(
					vertical.length === horizontal.length &&
					vertical.length === 1
			)
			{
				// here use "[0]" because from expression we have exactly one image
				this.images = [horizontal[0]];
			}
			else if(vertical.length === 1)
			{
				this.images = horizontal;
			}
			else if(horizontal.length === 1)
			{
				this.images = vertical;
			}
			else
			{
				if(horizontal.length > 0)
				{
					this.images = horizontal;
				}
				else
				{
					this.images = vertical;
				}
			}
		}
		else if(currentProduct.images.length === 1)
		{
			// here use "[0]" because from expression we have exactly one image
			this.images = [currentProduct.images[0]];
		}
	}
}
