import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService }                        from '@ngx-translate/core';
import { Subject }                                 from 'rxjs';
import { first, takeUntil }                        from 'rxjs/operators';
import { ModalController }                         from '@ionic/angular';
import Warehouse                                   from '@modules/server.common/entities/Warehouse';
import { CarrierRouter }                           from '@modules/client.common.angular2/routers/carrier-router.service';
import { WarehouseRouter }                         from '@modules/client.common.angular2/routers/warehouse-router.service';
import { AddChoiceComponent }                      from './add-choice/add-choice';
import { AddNewCarrierComponent }                  from './add-new-carrier/add-new-carrier';
import { CarriersCatalogComponent }                from './carriers-catalog/carriers-catalog';
import { StorageService }                          from 'services/storage.service';

@Component({
	           selector:    'page-add-carriers-popup',
	           styleUrls:   ['./add-carriers-popup.scss'],
	           templateUrl: 'add-carriers-popup.html',
           })
export class AddCarriersPopupPage implements OnInit, OnDestroy
{
	@ViewChild('addNewCarrier', { static: false })
	public addNewCarrierComponent: AddNewCarrierComponent;
	
	@ViewChild('carriersCatalog', { static: false })
	public carriersCatalog: CarriersCatalogComponent;
	
	@ViewChild('addChoice', { static: true })
	public addChoiceComponent: AddChoiceComponent;
	
	@ViewChild('wizzardFrom', { static: true })
	public wizzardFrom: any;
	
	@ViewChild('wizzardFromStep1', { static: true })
	public wizzardFromStep1: any;
	
	@ViewChild('wizardFormStep2', { static: true })
	public wizardFormStep2: any;
	
	public choiced: string;
	public isDone: boolean;
	public choicedNew: boolean = false;
	
	private choice$: any;
	private form$: any;
	private _ngDestroy$ = new Subject<void>();
	
	constructor(
			public modalController: ModalController,
			public carrierRouter: CarrierRouter,
			public warehouseRouter: WarehouseRouter,
			public storageService: StorageService,
			private readonly _translateService: TranslateService
	)
	{}
	
	public ngOnInit()
	{
		this.wizzardFromStep1.showNext = false;
		
		this.choice$ = this.addChoiceComponent.choice
		                   .subscribe(
				                   async(res) =>
				                   {
					                   this.choiced = res;
					                   this.wizzardFrom.next();
				                   });
	}
	
	public ngOnDestroy()
	{
		if(this.choice$)
		{
			this.choice$.unsubscribe();
		}
		
		if(this.form$)
		{
			this.form$.unsubscribe();
		}
		
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	public buttonClickEvent(data: string)
	{
		if(data === 'previous')
		{
			this.wizzardFrom.previous();
			this.choicedNew = false;
		}
	}
	
	public completeCreateCarrier(data: string)
	{
		if(data === 'complete')
		{
			this.wizzardFrom.complete();
		}
	}
	
	public get wizardStepsTitle()
	{
		let resultTitle = '';
		
		const step1 = () =>
		{
			this._translateService
			    .get('CARRIERS_VIEW.ADD_CARRIER.SELECT_HOW_TO_ADD')
			    .pipe(takeUntil(this._ngDestroy$))
			    .subscribe((title) => (resultTitle = title));
			
			return resultTitle;
		};
		
		const step2 = () =>
		{
			this._translateService
			    .get('CARRIERS_VIEW.ADD_CARRIER.ADD')
			    .pipe(takeUntil(this._ngDestroy$))
			    .subscribe((title) => (resultTitle = title));
			return resultTitle;
		};
		
		return {
			step1: step1(),
			step2: step2(),
		};
	}
	
	public async onStep1Next(choiced)
	{
		if(choiced === 'new')
		{
			this.choicedNew = true;
			
			// const form = this.addNewCarrierComponent.form;
			// this.form$ = form.valueChanges.subscribe((res) => {
			// 	this.isDone = form.valid;
			// });
		}
		else if(choiced === 'existing')
		{
			this.choicedNew = false;
			this.form$ = this.carriersCatalog.hasChanges.subscribe((r) =>
			                                                       {
				                                                       this.isDone = this.carriersCatalog.selecteCarriers.length > 0;
			                                                       });
		}
	}
	
	public async add()
	{
		this.cancelModal();
		const warehouse: Warehouse = await this.warehouseRouter
		                                       .get(this.storageService.warehouseId)
		                                       .pipe(first())
		                                       .toPromise();
		if(this.choiced === 'new')
		{
			const carrier = await this.carrierRouter.register({
				                                                  carrier:  this.addNewCarrierComponent.getCarrierCreateObject(),
				                                                  password: this.addNewCarrierComponent.password,
			                                                  });
			
			warehouse.hasRestrictedCarriers = true;
			warehouse.usedCarriersIds.push(carrier.id);
		}
		else if(this.choiced === 'existing')
		{
			warehouse.hasRestrictedCarriers = true;
			warehouse.usedCarriersIds.push(
					...this.carriersCatalog.selecteCarriers.map((c) => c.id)
			);
		}
		
		this.warehouseRouter.save(warehouse);
	}
	
	public cancelModal()
	{
		this.modalController.dismiss();
	}
}
