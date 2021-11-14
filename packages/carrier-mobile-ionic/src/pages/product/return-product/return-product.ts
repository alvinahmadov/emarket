import { Component, OnDestroy }  from '@angular/core';
import { Subject }               from 'rxjs';
import { first, takeUntil }      from 'rxjs/operators';
import ICarrier                  from '@modules/server.common/interfaces/ICarrier';
import { ILocaleMember }         from '@modules/server.common/interfaces/ILocale';
import IOrder                    from '@modules/server.common/interfaces/IOrder';
import IOrderProduct             from "@modules/server.common/interfaces/IOrderProduct";
import OrderCarrierStatus        from '@modules/server.common/enums/OrderCarrierStatus';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { CarrierRouter }         from '@modules/client.common.angular2/routers/carrier-router.service';
import { OrderRouter }           from '@modules/client.common.angular2/routers/order-router.service';
import { NavController }         from '@ionic/angular';
import { StorageService }        from 'services/storage.service';

@Component({
	           selector:    'page-return-product',
	           templateUrl: 'return-product.html',
           })
export class ReturnProductPage implements OnDestroy
{
	public carrier: ICarrier;
	public selectedOrder: IOrder;
	
	private destroy$ = new Subject<void>();
	
	constructor(
			private translateProductLocales: ProductLocalesService,
			private carrierRouter: CarrierRouter,
			private orderRouter: OrderRouter,
			private storageService: StorageService,
			private navCtrl: NavController
	)
	{}
	
	public get allowCancel()
	{
		switch(this.storageService.returnProductFrom)
		{
			case 'driveToWarehouse':
				return false;
			case 'startingDelivery':
				return this.selectedOrder && !this.selectedOrder.isCancelled;
			default:
				return false;
		}
	}
	
	public ionViewWillEnter()
	{
		this.loadData();
	}
	
	public localeTranslate(member: ILocaleMember[]): string
	{
		return this.translateProductLocales.getTranslate(member);
	}
	
	public get products(): IOrderProduct[]
	{
		return this.selectedOrder?.products ?? [];
	}
	
	public cancelReturn()
	{
		if(!this.allowCancel) throw new Error('Cancel not allowed!');
		
		this.navCtrl.navigateRoot('/main/starting-delivery');
	}
	
	public async returnProduct()
	{
		if(!this.selectedOrder.isCancelled)
		{
			await this.orderRouter.updateCarrierStatus(
					this.storageService.orderId,
					OrderCarrierStatus.IssuesDuringDelivery
			);
			
			this.unselectOrder();
			
			this.navCtrl.navigateRoot('/main/home');
		}
		else
		{
			this.unselectOrder();
			this.navCtrl.navigateRoot('/main/home');
		}
	}
	
	public ionViewWillLeave()
	{
		this.storageService.returnProductFrom = null;
	}
	
	public ngOnDestroy(): void
	{
		this.destroy$.next();
		this.destroy$.complete();
	}
	
	private async loadData()
	{
		this.carrier = await this.carrierRouter
		                         .get(this.storageService.carrierId)
		                         .pipe(first())
		                         .toPromise();
		
		this.orderRouter
		    .get(this.storageService.orderId, {
			    populateWarehouse: true,
		    })
		    .pipe(takeUntil(this.destroy$))
		    .subscribe((o) =>
		               {
			               this.selectedOrder = o;
			               this.storageService.selectedOrder = o;
		               });
	}
	
	private unselectOrder()
	{
		this.storageService.orderId = null;
		this.storageService.selectedOrder = null;
	}
}
