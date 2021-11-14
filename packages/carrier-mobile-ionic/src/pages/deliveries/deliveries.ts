import { Component, OnDestroy }  from '@angular/core';
import Order                     from '@modules/server.common/entities/Order';
import { Subject }               from 'rxjs';
import { CarriersOrdersService } from 'services/carriers-orders.service';
import { StorageService }        from 'services/storage.service';
import { Platform }              from '@ionic/angular';

@Component({
	           selector:    'page-deliveries',
	           templateUrl: './deliveries.html',
	           styleUrls:   ['deliveries.scss'],
           })
export class DeliveriesPage implements OnDestroy
{
	public currentCompletedOrders: Order[];
	
	private _ngDestroy$ = new Subject<void>();
	
	constructor(
			private readonly _carriersOrdersService: CarriersOrdersService,
			private readonly storageService: StorageService,
			public platform: Platform
	)
	{
		this._getAllCompletedOrders();
	}
	
	private get _carrierId()
	{
		return this.storageService.carrierId;
	}
	
	public ionViewCanEnter()
	{
		return this.storageService.carrierId !== null && !this.storageService.showInformationPage;
	}
	
	public ngOnDestroy()
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	private async _getAllCompletedOrders()
	{
		this.currentCompletedOrders = await this._carriersOrdersService.getCarrierOrders(
				this._carrierId,
				{
					populateWarehouse: true,
					completion:        'all',
				}
		);
	}
}
