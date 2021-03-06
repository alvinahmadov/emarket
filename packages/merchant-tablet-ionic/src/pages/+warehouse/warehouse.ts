import { Component, OnInit }                  from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular';
import { Mixpanel }                           from '@ionic-native/mixpanel/ngx';
import { BarcodeScanner }                     from '@ionic-native/barcode-scanner/ngx';
import { Subscription }                       from 'rxjs';
import { ILocaleMember }                      from '@modules/server.common/interfaces/ILocale';
import OrderCarrierStatus                     from '@modules/server.common/enums/OrderCarrierStatus';
import OrderWarehouseStatus                   from '@modules/server.common/enums/OrderWarehouseStatus';
import Order                                  from '@modules/server.common/entities/Order';
import Product                                from '@modules/server.common/entities/Product';
import Warehouse                              from '@modules/server.common/entities/Warehouse';
import WarehouseProduct                       from '@modules/server.common/entities/WarehouseProduct';
import { OrderRouter }                        from '@modules/client.common.angular2/routers/order-router.service';
import { WarehouseProductsRouter }            from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import { ProductLocalesService }              from '@modules/client.common.angular2/locale/product-locales.service';
import { WarehousesService }                  from 'services/warehouses.service';
import { StorageService }                     from 'services/storage.service';
import { CreateProductTypePopupPage }         from './create-product-type-popup/create-product-type-popup';
import { EditProductTypePopupPage }           from './edit-product-type-popup/edit-product-type-popup';
import { OrdersFilterModes }                  from '../../filters/orders-filters';

export enum OrderState
{
	WarehousePreparation,
	WarehousePreparationProblem,
	InDelivery,
	Canceled,
	DeliveryProblem,
	Delivered,
}

export enum OrderStatus
{
	'all'               = 'ALL',
	'confirmed'         = 'CONFIRMED',
	'processing'        = 'PROCESSING',
	'alocation_started' = 'ALLOCATION_STARTED',
	'packaging'         = 'PACKAGING_STARTED',
	'packaged'          = 'PACKAGED',
	'in_delivery'       = 'GIVEN_TO_CARRIER',
}

@Component({
	           selector:    'page-warehouse',
	           styleUrls:   ['./warehouse.scss'],
	           templateUrl: 'warehouse.html',
           })
export class WarehousePage implements OnInit
{
	public filterMode: OrdersFilterModes = 'ready';
	public warehouse: Warehouse;
	public OrderState: any = OrderState;
	public isOrderContainerLive: boolean = false;
	public productsLoading: boolean = true;
	public ordersCount: number;
	public showRelevant: boolean = true;
	public showAllProducts: boolean = true;
	public hideTopProducts: boolean = false;
	public focusedOrder: Order;
	public focusedOrder$: any;
	public orderStatus: any;
	
	public filter: any;
	public keys = Object.keys;
	public statuses = OrderStatus;
	
	private warehouse$: Subscription;
	
	public constructor(
			public popoverCtrl: PopoverController,
			private modalCtrl: ModalController,
			private orderRouter: OrderRouter,
			private warehouseProductsRouter: WarehouseProductsRouter,
			private mixpanel: Mixpanel,
			private translateProductLocales: ProductLocalesService,
			private storageService: StorageService,
			private barcodeScanner: BarcodeScanner,
			private warehouseService: WarehousesService
	)
	{
		this.showAllProducts = this.storageService.warehouseView === "products";
		this.hideTopProducts = !this.storageService.topShown;
	}
	
	public ngOnInit(): void
	{
		this.getOrderShortProcess()
		    .then(console.log)
		    .catch(console.error);
	}
	
	public get isLogged(): string
	{
		return this.storageService.warehouseId;
	}
	
	public get warehouseId(): string
	{
		return this.storageService.warehouseId;
	}
	
	public get language(): string
	{
		return this.storageService.locale;
	}
	
	public get isBrowser(): boolean
	{
		return this.storageService.platform === "browser"
	}
	
	public switchOrders(showRelevant, event?): void
	{
		if(this.focusedOrder$)
		{
			this.focusedOrder$.unsubscribe();
		}
		this.focusedOrder = null;
		this.showRelevant = showRelevant;
		
		if(event != null)
		{
			this.filter = event.target.value;
		}
		else
		{
			this.filter = null;
		}
	}
	
	public onOrderFinish(): void
	{
		this.toggleOrderContainer();
	}
	
	public toggleOrderContainer(): void
	{
		this.isOrderContainerLive = !this.isOrderContainerLive;
		this.showAllProducts = !this.isOrderContainerLive;
	}
	
	public toggleAllProducts()
	{
		if(!this.isOrderContainerLive)
		{
			this.showAllProducts = !this.showAllProducts;
			this.storageService.warehouseView = this.showAllProducts ? 'products' : 'orders';
		}
	}
	
	public toggleTopProducts()
	{
		this.hideTopProducts = !this.hideTopProducts;
		this.storageService.topShown = !this.hideTopProducts;
	}
	
	public getWarehouseProductImageUrl(p: Product): string
	{
		if(p instanceof Product)
		{
			const productImg = p.images.filter((i) => i.locale.includes(this.language))[0];
			if(productImg)
			{
				return productImg.url;
			}
			return p.images[0].url;
		}
	}
	
	public truncateTitle(title: string): string
	{
		if(title)
		{
			title = title.replace(/[ ]{2,}/, ' ');
			if(title.length <= 15)
			{
				return title;
			}
			return title.substring(0, 12) + '...';
		}
	}
	
	public localeTranslate(member: ILocaleMember[]): string
	{
		if(member !== undefined)
		{
			return this.translateProductLocales.getTranslate(member);
		}
	}
	
	public orderState(order: Order): OrderState
	{
		if(order.warehouseStatus >= 200)
		{
			return OrderState.WarehousePreparationProblem;
		}
		
		if(order.carrierStatus >= 200)
		{
			return OrderState.DeliveryProblem;
		}
		
		if(order.isCancelled)
		{
			return OrderState.Canceled;
		}
		
		if(order.carrierStatus === OrderCarrierStatus.DeliveryCompleted)
		{
			return OrderState.Delivered;
		}
		
		if(order.carrier == null)
		{
			return OrderState.WarehousePreparation;
		}
		else
		{
			return OrderState.InDelivery;
		}
	}
	
	public updateOrderWarehouseStatus(orderId: string, status: OrderWarehouseStatus): Promise<Order>
	{
		if(status >= 200)
		{
			if(this.mixpanel)
			{
				this.mixpanel.track('Order Failed').catch(console.error);
			}
		}
		return this.orderRouter.updateWarehouseStatus(orderId, status);
	}
	
	public addProduct(productId: string): Promise<WarehouseProduct>
	{
		return this.warehouseProductsRouter.increaseCount(
				this.warehouseId,
				productId,
				1
		);
	}
	
	public removeProduct(productId: string): Promise<WarehouseProduct>
	{
		return this.warehouseProductsRouter.decreaseCount(
				this.warehouseId,
				productId,
				1
		);
	}
	
	public getWarehouseStatus(orderWarehouseStatusNumber: OrderWarehouseStatus): string
	{
		const basePath = 'WAREHOUSE_VIEW.ORDER_WAREHOUSE_STATUSES.';
		switch(orderWarehouseStatusNumber)
		{
			case OrderWarehouseStatus.NoStatus:
				return basePath + 'CREATED';
			case OrderWarehouseStatus.ReadyForProcessing:
				return basePath + 'CONFIRMED';
			case OrderWarehouseStatus.WarehouseStartedProcessing:
				return basePath + 'PROCESSING';
			case OrderWarehouseStatus.AllocationStarted:
				return basePath + 'ALLOCATION_STARTED';
			case OrderWarehouseStatus.AllocationFinished:
				return basePath + 'ALLOCATION_FINISHED';
			case OrderWarehouseStatus.PackagingStarted:
				return basePath + 'PACKAGING_STARTED';
			case OrderWarehouseStatus.PackagingFinished:
				return basePath + 'PACKAGED';
			case OrderWarehouseStatus.GivenToCarrier:
				return basePath + 'GIVEN_TO_CARRIER';
			case OrderWarehouseStatus.GivenToCustomer:
				return basePath + 'TAKEN';
			case OrderWarehouseStatus.AllocationFailed:
				return basePath + 'ALLOCATION_FAILED';
			case OrderWarehouseStatus.PackagingFailed:
				return basePath + 'PACKAGING_FAILED';
			default:
				return basePath + 'BAD_STATUS';
		}
	}
	
	public ionViewWillLeave(): void
	{
		if(this.warehouse$)
		{
			this.warehouse$.unsubscribe();
		}
		if(this.focusedOrder$)
		{
			this.focusedOrder$.unsubscribe();
		}
	}
	
	public presentCreateProductPopover(): void
	{
		const modalOptions = {
			component:       CreateProductTypePopupPage,
			backdropDismiss: true,
			cssClass:        'mutation-product-modal',
		};
		
		try
		{
			this.modalCtrl.create(modalOptions).then(modal => modal.present())
		} catch(e)
		{
			console.error(e)
		}
	}
	
	public async openEditProductModal(product: WarehouseProduct): Promise<void>
	{
		const modal = await this.modalCtrl
		                        .create({
			                                component:       EditProductTypePopupPage,
			                                backdropDismiss: true,
			                                componentProps:  { warehouseProduct: product },
			                                cssClass:        'mutation-product-modal',
		                                });
		
		await modal.present();
	}
	
	public async getOrderShortProcess(): Promise<boolean>
	{
		this.orderStatus = await this.warehouseService
		                             .getWarehouseOrderProcess(this.storageService.warehouseId)
		                             .toPromise();
		
		this.orderStatus = this.orderStatus['ordersShortProcess'];
		
		return this.orderStatus;
	}
	
	public async scanBarcode(): Promise<void>
	{
		try
		{
			const barcodeData = await this.barcodeScanner.scan();
			const orderId = barcodeData.text;
			if(orderId !== '')
			{
				this.focusedOrder$ = this.orderRouter
				                         .get(orderId, {
					                         populateCarrier:   true,
					                         populateWarehouse: true,
				                         })
				                         .subscribe((order) =>
				                                    {
					                                    if(
							                                    order.warehouseStatus >=
							                                    OrderWarehouseStatus.GivenToCarrier
					                                    )
					                                    {
						                                    this.switchOrders(this.showRelevant);
					                                    }
					                                    else
					                                    {
						                                    this.focusedOrder = order;
					                                    }
				                                    });
			}
		} catch(error)
		{
			console.error(error);
		}
	}
}
