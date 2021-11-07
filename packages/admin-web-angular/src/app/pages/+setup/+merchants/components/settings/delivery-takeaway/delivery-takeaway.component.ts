import {
	Component,
	ViewChild,
	Input,
	Output,
	EventEmitter,
	OnDestroy,
}                                               from '@angular/core';
import { Subject }                              from 'rxjs';
import { CommonUtils }                          from '@modules/server.common/utilities';
import { CarrierRouter }                        from '@modules/client.common.angular2/routers/carrier-router.service';
import {
	CarriersSmartTableComponent,
	CarrierSmartTableObject,
}                                               from '@app/@shared/carrier/carriers-table/carriers-table.component';
import { SetupMerchantSharedCarriersComponent } from './shared-carriers/shared-carriers.component';
import { SetupMerchantAddNewCarrierComponent }  from './add-new-carrier/add-new-carrier.component';

@Component({
	           selector:    'ea-merchants-setup-delivery-takeaway',
	           templateUrl: './delivery-takeaway.component.html',
	           styleUrls:   ['./delivery-takeaway.component.scss'],
           })
export class SetupMerchantDeliveryAndTakeawayComponent implements OnDestroy
{
	@ViewChild('newCarrier')
	public newCarrier: SetupMerchantAddNewCarrierComponent;
	@ViewChild('sharedCarriers')
	public sharedCarriers: SetupMerchantSharedCarriersComponent;
	@ViewChild('carriersTable')
	public carriersTable: CarriersSmartTableComponent;
	
	@Output()
	public previousStep: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output()
	public nextStep: EventEmitter<boolean> = new EventEmitter<boolean>();
	
	@Input()
	public locationForm: any;
	
	public componentViews = {
		main:          'main',
		carriersTable: 'carriersTable',
		addNewCarrier: 'addNewCarrier',
		editCarrier:   'editCarrier',
	};
	public currentView = this.componentViews.main;
	public carriersPerPage = 3;
	public carrierId: string;
	
	public isCarrierRequired: boolean;
	public productsDelivery: boolean;
	public productsTakeaway: boolean;
	public commentsEnabled: boolean = true;
	
	public restrictedCarriers: CarrierSmartTableObject[] = [];
	
	private ngDestroy$ = new Subject<void>();
	
	constructor(private carrierRouter: CarrierRouter) {}
	
	public ngOnDestroy()
	{
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
	
	public get haveCarriersForAdd()
	{
		let hasSelectedCarriers = false;
		
		if(this.sharedCarriers)
		{
			hasSelectedCarriers = this.sharedCarriers.carriersTable
					.hasSelectedCarriers;
		}
		
		if(this.newCarrier)
		{
			hasSelectedCarriers =
					this.newCarrier.form.valid &&
					this.locationForm &&
					this.locationForm.form.valid;
		}
		return hasSelectedCarriers;
	}
	
	public get isBasicInfoValid()
	{
		let res = false;
		
		if(this.newCarrier)
		{
			res = this.newCarrier.basicInfoForm.form.valid;
		}
		
		return res;
	}
	
	public get restrictedCarriersIds()
	{
		let ids = [];
		if(this.restrictedCarriers)
		{
			ids = this.restrictedCarriers.map((c) => c.id);
		}
		
		return ids;
	}
	
	public async add()
	{
		if(this.currentView === this.componentViews.carriersTable)
		{
			const carriers = this.sharedCarriers.carriersTable.selectedCarriers
			                     .map((data) => data['carrier'])
			                     .map(CarriersSmartTableComponent.getCarrierSmartTableObject);
			
			this.restrictedCarriers.unshift(...carriers);
		}
		else if(this.currentView === this.componentViews.addNewCarrier)
		{
			const geoLocationInput = this.locationForm.getValue();
			geoLocationInput.loc.coordinates.reverse();
			
			const carrierCreateObj = {
				...this.newCarrier.basicInfoForm.getValue(),
				geoLocation: geoLocationInput,
			};
			
			if(!carrierCreateObj.logo)
			{
				const letter = carrierCreateObj.firstName
				                               .charAt(0)
				                               .toUpperCase();
				carrierCreateObj.logo = CommonUtils.getDummyImage(300, 300, letter);
			}
			
			let carrier = await this.carrierRouter.register({
				                                                carrier:  carrierCreateObj,
				                                                password: this.newCarrier.basicInfoForm.getPassword(),
			                                                });
			
			this.restrictedCarriers.unshift(
					CarriersSmartTableComponent.getCarrierSmartTableObject(carrier)
			);
		}
		this.currentView = this.componentViews.main;
	}
	
	public async save()
	{
		const basicInfo = this.newCarrier.basicInfoForm.getValue();
		
		const carrier = await this.carrierRouter.updateById(this.carrierId, {
			...basicInfo,
		});
		
		this.restrictedCarriers = this.restrictedCarriers.filter(
				(c) => c.id !== this.carrierId
		);
		this.restrictedCarriers.unshift(
				CarriersSmartTableComponent.getCarrierSmartTableObject(carrier)
		);
		this.carrierId = null;
		
		this.currentView = this.componentViews.main;
	}
	
	public back()
	{
		this.currentView = this.componentViews.main;
	}
	
	public productsDeliveryChange()
	{
		if(!this.productsDelivery)
		{
			this.restrictedCarriers = [];
		}
	}
	
	public removeCarrier(e)
	{
		if(this.restrictedCarriers)
		{
			this.restrictedCarriers = this.restrictedCarriers.filter(
					(c) => c.id !== e.data.id
			);
		}
		
		this.carriersTable.loadData(this.restrictedCarriers).then();
	}
	
	public editCarrier(e)
	{
		this.carrierId = e.data.id;
		this.currentView = this.componentViews.editCarrier;
	}
}
