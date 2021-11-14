import { Component, OnDestroy }  from '@angular/core';
import ICarrier                  from '@modules/server.common/interfaces/ICarrier';
import IOrder                    from '@modules/server.common/interfaces/IOrder';
import { ILocaleMember }         from '@modules/server.common/interfaces/ILocale';
import OrderCarrierStatus        from '@modules/server.common/enums/OrderCarrierStatus';
import { CarrierRouter }         from '@modules/client.common.angular2/routers/carrier-router.service';
import { CarrierOrdersRouter }   from '@modules/client.common.angular2/routers/carrier-orders-router.service';
import { OrderRouter }           from '@modules/client.common.angular2/routers/order-router.service';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { first, takeUntil }      from 'rxjs/operators';
import { Subject }               from 'rxjs';
import { NavController }         from '@ionic/angular';
import { StorageService }        from 'services/storage.service';
import { environment }           from 'environments/environment';

@Component({
	           selector:    'page-get-product',
	           styleUrls:   ['./get-product.scss'],
	           templateUrl: 'get-product.html',
           })
export class GetProductPage implements OnDestroy
{
	public carrier: ICarrier;
	public selectedOrder: IOrder;
	public disabledButtons: boolean = true;
	public selectedProductImages: string[];
	public selectedProductTitles: string[];
	public orderCarrierCompetition: boolean;
	public isTakenFromAnotherCarrier: boolean = false;
	public productsLocale: string;
	private destroy$ = new Subject<void>();
	
	constructor(
			private orderRouter: OrderRouter,
			private carrierRouter: CarrierRouter,
			private carrierOrdersRouter: CarrierOrdersRouter,
			private _translateProductLocales: ProductLocalesService,
			private storageService: StorageService,
			private navCtrl: NavController
	)
	{
		this.productsLocale =
				this.storageService.language || environment.DEFAULT_LANGUAGE;
	}
	
	public ngOnDestroy(): void
	{
		this.destroy$.next();
		this.destroy$.complete();
	}
	
	public ionViewWillEnter()
	{
		this.loadData();
	}
	
	public get carrierId(): string
	{
		return this.carrier ? this.carrier._id.toString() : '';
	}
	
	public async gotProduct()
	{
		this.disabledButtons = true;
		if(this.carrier && this.selectedOrder)
		{
			await this.carrierOrdersRouter.updateStatus(
					this.carrier['id'],
					OrderCarrierStatus.CarrierPickedUpOrder
			);
			
			await this.navCtrl.navigateRoot('/main/starting-delivery');
		}
		else
		{
			// TODO: replace with popup
			alert('Try again!');
		}
		this.disabledButtons = false;
	}
	
	public async gotProductWithCarrierCompetition()
	{
		this.disabledButtons = true;
		if(this.carrier && this.selectedOrder)
		{
			await this.carrierOrdersRouter.selectedForDelivery(
					this.carrier['id'],
					[this.selectedOrder['id']],
					this.orderCarrierCompetition
			);
			
			await this.navCtrl.navigateRoot('/main/starting-delivery');
		}
		else
		{
			// TODO: replace with popup
			alert('Try again!');
		}
		this.disabledButtons = false;
	}
	
	public async cancelWork()
	{
		this.disabledButtons = true;
		if(this.carrier && this.selectedOrder)
		{
			await this.carrierOrdersRouter.cancelDelivery(this.carrier['id'], [
				this.selectedOrder['id'],
			]);
			
			this.unselectOrder();
		}
		else
		{
			// 	// TODO: replace with popup
			alert('Try again!');
		}
		this.disabledButtons = false;
	}
	
	public localeTranslate(member: ILocaleMember[]): string
	{
		return this._translateProductLocales.getTranslate(member);
	}
	
	public unselectOrder()
	{
		this.storageService.selectedOrder = null;
		this.storageService.orderId = null;
		
		this.navCtrl.navigateRoot('/main/home');
	}
	
	private async loadData()
	{
		this.carrier = await this.carrierRouter
		                         .get(this.storageService.carrierId)
		                         .pipe(first())
		                         .toPromise();
		await this.orderRouter
		          .get(this.storageService.orderId, {
			          populateWarehouse: true,
		          })
		          .pipe(takeUntil(this.destroy$))
		          .subscribe((o) =>
		                     {
			                     this.orderCarrierCompetition =
					                     o.warehouse['carrierCompetition'];
			
			                     this.isTakenFromAnotherCarrier =
					                     !!o.carrierId &&
					                     o.carrierId !== this.carrier._id &&
					                     o.carrierStatus >
					                     (this.orderCarrierCompetition
					                      ? OrderCarrierStatus.CarrierSelectedOrder
					                      : OrderCarrierStatus.NoCarrier);
			
			                     this.selectedOrder = o;
			                     this.storageService.selectedOrder = o;
			                     this.disabledButtons = false;
			                     const imageUrls: string[] = [];
			                     const titles: string[] = [];
			                     this.selectedOrder.products.forEach(
					                     (x) =>
					                     {
						                     x.product.images.forEach(
								                     (x) =>
								                     {
									                     if(x.locale.match(this.productsLocale))
									                     {
										                     imageUrls.push(x.url);
									                     }
								                     }
						                     );
					                     }
			                     );
			                     this.selectedOrder.products.forEach(
					                     (x) =>
					                     {
						                     x.product.title.forEach(
								                     (x) =>
								                     {
									                     if(x.locale.match(this.productsLocale))
									                     {
										                     titles.push(x.value);
									                     }
								                     }
						                     );
					                     }
			                     );
			
			                     this.selectedProductImages = imageUrls;
			                     this.selectedProductTitles = titles;
		                     });
	}
}
