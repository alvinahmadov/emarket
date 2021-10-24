import { Component, OnDestroy, OnInit }  from '@angular/core';
import { Router }                        from '@angular/router';
import { LocalDataSource }               from 'ng2-smart-table';
import { ModalController }               from '@ionic/angular';
import { TranslateService }              from '@ngx-translate/core';
import { Observable, Subject, forkJoin } from 'rxjs';
import { takeUntil, first }              from 'rxjs/operators';
import Carrier                           from '@modules/server.common/entities/Carrier';
import { WarehouseCarriersRouter }       from '@modules/client.common.angular2/routers/warehouse-carriers-router.service';
import { WarehouseRouter }               from '@modules/client.common.angular2/routers/warehouse-router.service';
import { AddressesComponent }            from 'components/carriers-table/addresses';
import { DeliveriesComponent }           from 'components/carriers-table/deliveries';
import { ImageComponent }                from 'components/carriers-table/image';
import { PhoneComponent }                from 'components/carriers-table/phone';
import { StatusComponent }               from 'components/carriers-table/status';
import { ConfirmDeletePopupPage }        from 'components/confirm-delete-popup/confirm-delete-popup';
import { AddCarriersPopupPage }          from './add-carriers-popup/add-carriers-popup';
import { CarrierEditPopupPage }          from './carrier-edit-popup/carrier-edit-popup';
import { CarrierTrackPopup }             from './carrier-track-popup/carrier-track-popup';
import { StorageService }                from 'services/storage.service';

@Component({
	           selector:    'page-carriers',
	           templateUrl: 'carriers.html',
	           styleUrls:   ['./carriers.scss'],
           })
export class CarriersPage implements OnInit, OnDestroy
{
	public settingsSmartTable: object;
	public sourceSmartTable = new LocalDataSource();
	public carriers: Carrier[];
	public showNoDeliveryIcon: boolean;
	
	private _ngDestroy$ = new Subject<void>();
	
	constructor(
			private readonly router: Router,
			public modalCtrl: ModalController,
			private readonly warehouseCarriersRouter: WarehouseCarriersRouter,
			private readonly _translateService: TranslateService,
			private readonly storageService: StorageService,
			private warehouseRouter: WarehouseRouter
	)
	{}
	
	public ngOnInit(): void
	{
		this._loadCarriers();
		this._loadSettingsSmartTable();
	}
	
	public ngOnDestroy()
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	public get deviceId(): string
	{
		return this.storageService.deviceId;
	}
	
	public get warehouseId(): string
	{
		return this.storageService.warehouseId;
	}
	
	public goToTrackPage()
	{
		this.router.navigateByUrl('/track');
	}
	
	public async openAddCarriers()
	{
		const addCarriersPopupModal = await this.modalCtrl.create({
			                                                          component: AddCarriersPopupPage,
			                                                          cssClass:  'add-carriers-popup',
		                                                          });
		await addCarriersPopupModal.present();
	}
	
	public async trackCarrier(e)
	{
		const modal = await this.modalCtrl.create({
			                                          component:      CarrierTrackPopup,
			                                          componentProps: { carrier: e.data.carrier },
			                                          cssClass:       'carrier-track-wrapper',
		                                          });
		
		await modal.present();
	}
	
	public async deleteCarrier(e)
	{
		const modal = await this.modalCtrl.create({
			                                          component:      ConfirmDeletePopupPage,
			                                          componentProps: { data: e.data },
			                                          cssClass:       'confirm-delete-wrapper',
		                                          });
		
		await modal.present();
		
		const res = await modal.onDidDismiss();
		if(res.data)
		{
			const carrierId = e.data.carrier.id;
			const id = this.warehouseId;
			const merchant = await this.warehouseRouter
			                           .get(id)
			                           .pipe(first())
			                           .toPromise();
			
			merchant.usedCarriersIds = merchant.usedCarriersIds.filter(
					(x) => x !== carrierId
			);
			
			await this.warehouseRouter.save(merchant);
		}
	}
	
	public async editCarrier(e)
	{
		const modal = await this.modalCtrl.create({
			                                          component:      CarrierEditPopupPage,
			                                          componentProps: { carrier: e.data.carrier },
		                                          });
		
		await modal.present();
	}
	
	private async _loadCarriers()
	{
		const loadData = (carriers) =>
		{
			const carriersVM = carriers.map((c: Carrier) =>
			                                {
				                                return {
					                                image:     c.logo,
					                                name:      c.firstName + ' ' + c.lastName,
					                                phone:     c.phone,
					                                addresses: c.geoLocation.city,
					                                status:    c.status === 0 ? 'working' : 'not working',
					                                carrier:   c,
				                                };
			                                });
			
			this.sourceSmartTable.load(carriersVM);
		};
		
		this.warehouseCarriersRouter
		    .get(this.warehouseId)
		    .pipe(takeUntil(this._ngDestroy$))
		    .subscribe((carriers) =>
		               {
			               this.carriers = carriers;
			
			               loadData(this.carriers);
			
			               this.carriers.length === 0
			               ? (this.showNoDeliveryIcon = true)
			               : (this.showNoDeliveryIcon = false);
		               });
	}
	
	private _loadSettingsSmartTable()
	{
		const columnTitlePrefix = 'CARRIERS_VIEW.';
		const getTranslate = (name: string): Observable<string> =>
				this._translateService.get(columnTitlePrefix + name);
		
		forkJoin(
				getTranslate('IMAGE'),
				getTranslate('NAME'),
				getTranslate('PHONE_NUMBER'),
				getTranslate('ADDRESSES'),
				getTranslate('STATUS'),
				getTranslate('DELIVERIES')
		)
				.pipe(takeUntil(this._ngDestroy$))
				.subscribe(
						([image, name, phone, addresses, status, deliveries]) =>
						{
							this.settingsSmartTable = {
								mode:    'external',
								edit:    {
									editButtonContent: '<i class="fa fa-edit"></i>',
									confirmEdit:       true,
								},
								delete:  {
									deleteButtonContent: '<i class="fa fa-trash"></i>',
									confirmDelete:       true,
								},
								actions: {
									custom: [
										{
											name:  'track',
											title: '<i class="fa fa-map-marker"></i>',
										},
									],
								},
								columns: {
									image:      {
										title:           image,
										type:            'custom',
										renderComponent: ImageComponent,
										filter:          false,
									},
									name:       { title: name },
									phone:      {
										title:           phone,
										type:            'custom',
										renderComponent: PhoneComponent,
									},
									addresses:  {
										title:           addresses,
										type:            'custom',
										renderComponent: AddressesComponent,
									},
									status:     {
										title:           status,
										class:           'text-center',
										type:            'custom',
										renderComponent: StatusComponent,
									},
									deliveries: {
										title:           deliveries,
										class:           'text-center',
										filter:          false,
										type:            'custom',
										renderComponent: DeliveriesComponent,
									},
								},
								pager:   {
									display: true,
									perPage: 14,
								},
							};
						}
				);
	}
}
