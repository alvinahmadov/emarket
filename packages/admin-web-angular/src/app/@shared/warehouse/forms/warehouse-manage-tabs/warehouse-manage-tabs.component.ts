import { Component, EventEmitter, Input, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup }   from '@angular/forms';
import IGeoLocation                                  from '@modules/server.common/interfaces/IGeoLocation';
import { IWarehouseCreateObject }                    from '@modules/server.common/interfaces/IWarehouse';
import ForwardOrdersMethod                           from '@modules/server.common/enums/ForwardOrdersMethod';
import Warehouse                                     from '@modules/server.common/entities/Warehouse';
import { WarehouseManageTabsAccountComponent }       from './account/warehouse-manage-tabs-account.component';
import { WarehouseManageTabsDetailsComponent }       from './details/warehouse-manage-tabs-details.component';
import { WarehouseManageTabsDeliveryAreasComponent } from './delivery-areas/warehouse-manage-tabs-delivery-areas.component';
import { ContactInfoFormComponent }                  from '../contact-info';
import { PaymentsSettingsFormComponent }             from '../payments-settings/payments-settings-form.component';
import { LocationFormComponent }                     from '../../../forms/location';

export type WarehouseManageTabs = Pick<IWarehouseCreateObject,
		| 'name'
		| 'logo'
		| 'isActive'
		| 'username'
		| 'hasRestrictedCarriers'
		| 'carriersIds'
		| 'isManufacturing'
		| 'isCarrierRequired'>;

type TabValue = {
	basicInfo: WarehouseManageTabs;
	password: {
		current: string;
		new: string;
	};
	contactInfo: {
		contactEmail: string;
		contactPhone: string;
		forwardOrdersUsing: ForwardOrdersMethod[];
		ordersEmail: string;
		ordersPhone: string;
	};
	location: IGeoLocation;
	deliveryAreas: any; // add type
	isPaymentEnabled: boolean;
	paymentsGateways: object[];
	isCashPaymentEnabled: boolean;
}

@Component({
	           selector:    'ea-warehouse-manage-tabs',
	           styleUrls:   ['./warehouse-manage-tabs.component.scss'],
	           templateUrl: './warehouse-manage-tabs.component.html',
           })
export class WarehouseManageTabsComponent
{
	@Input()
	public readonly form: FormGroup;
	
	@ViewChild('detailsComponent')
	public readonly detailsComponent: WarehouseManageTabsDetailsComponent;
	
	@ViewChild('accountComponent')
	public readonly accountComponent: WarehouseManageTabsAccountComponent;
	
	@ViewChild('contactInfoForm')
	public readonly contactInfoForm: ContactInfoFormComponent;
	
	@ViewChild('locationForm')
	public readonly locationForm: LocationFormComponent;
	
	@ViewChild('paymentsSettingsForm')
	public readonly paymentsSettingsForm: PaymentsSettingsFormComponent;
	
	@ViewChild('deliveryAreasForm')
	public readonly deliveryAreasForm: WarehouseManageTabsDeliveryAreasComponent;
	
	@ViewChild('tabSet')
	public readonly tabSet;
	
	public mapCoordEmitter = new EventEmitter<number[]>();
	public mapGeometryEmitter = new EventEmitter<any>();
	
	public get details(): AbstractControl
	{
		return this.form.get('details');
	}
	
	public get account(): AbstractControl
	{
		return this.form.get('account');
	}
	
	public get contactInfo(): AbstractControl
	{
		return this.form.get('contactInfo');
	}
	
	public get location(): AbstractControl
	{
		return this.form.get('location');
	}
	
	public get validForm(): boolean
	{
		return this.form.valid && this.paymentsSettingsForm.isPaymentValid;
	}
	
	public get deliveryAreas(): AbstractControl
	{
		return this.form.get('deliverAreas');
	}
	
	public static buildForm(formBuilder: FormBuilder): FormGroup
	{
		return formBuilder.group({
			                         details:      WarehouseManageTabsDetailsComponent.buildForm(formBuilder),
			                         account:      WarehouseManageTabsAccountComponent.buildForm(formBuilder),
			                         contactInfo:  ContactInfoFormComponent.buildForm(formBuilder),
			                         location:     LocationFormComponent.buildForm(formBuilder),
			                         deliverAreas: WarehouseManageTabsDeliveryAreasComponent.buildForm(
					                         formBuilder
			                         ),
		                         });
	}
	
	public onCoordinatesChanges(coords: number[])
	{
		this.mapCoordEmitter.emit(coords);
	}
	
	public onGeometrySend(geometry: any)
	{
		this.mapGeometryEmitter.emit(geometry);
	}
	
	public getValue(): TabValue
	{
		// GeoJSON use reversed order for coordinates from our implementation.
		// we use lat => lng but GeoJSON use lng => lat.
		const geoLocationInput = this.locationForm.getValue();
		geoLocationInput.loc.coordinates.reverse();
		
		const detailsRaw = this.detailsComponent.getValue();
		const accountRaw = this.accountComponent.getValue();
		const contactRaw = this.contactInfoForm.getValue();
		const locationRaw = geoLocationInput;
		const deliveryAreasRaw = this.deliveryAreasForm.getValue();
		
		return {
			basicInfo:            { ...detailsRaw, username: accountRaw.username },
			password:             accountRaw.password,
			contactInfo:          contactRaw,
			location:             locationRaw as IGeoLocation,
			deliveryAreas:        deliveryAreasRaw,
			paymentsGateways:     this.paymentsSettingsForm.paymentsGateways,
			isPaymentEnabled:     this.paymentsSettingsForm.isPaymentEnabled,
			isCashPaymentEnabled: this.paymentsSettingsForm.isCashPaymentEnabled,
		};
	}
	
	public setValue(warehouse: Warehouse)
	{
		// GeoJSON use reversed order of lat => lng
		const geoLocationInput = warehouse.geoLocation;
		geoLocationInput.loc.coordinates.reverse();
		
		this.detailsComponent.setValue(warehouse);
		this.accountComponent.setValue(warehouse.username);
		this.contactInfoForm.setValue(warehouse);
		this.locationForm.setValue(geoLocationInput);
		this.deliveryAreasForm.setValue(warehouse.deliveryAreas);
		this.paymentsSettingsForm.setValue(warehouse);
	}
	
	public warehouseUpdateFinish()
	{
		this.tabSet.tabs._results[0].activeValue = true;
		this.tabSet.tabs._results[1].activeValue = false;
		this.tabSet.tabs._results[2].activeValue = false;
		this.tabSet.tabs._results[3].activeValue = false;
		this.tabSet.tabs._results[4].activeValue = false;
		this.tabSet.tabs._results[5].activeValue = false;
	}
}
