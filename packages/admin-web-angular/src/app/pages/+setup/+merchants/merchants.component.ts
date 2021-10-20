import { Component, ViewChild }                      from '@angular/core';
import { NbStepperComponent }                        from '@nebular/theme';
import { ToasterService }                            from 'angular2-toaster';
import { IWarehouseCreateObject }                    from '@modules/server.common/interfaces/IWarehouse';
import GeoLocation                                   from '@modules/server.common/entities/GeoLocation';
import Warehouse                                     from '@modules/server.common/entities/Warehouse';
import { WarehouseAuthRouter }                       from '@modules/client.common.angular2/routers/warehouse-auth-router.service';
import { SetupMerchantAccountComponent }             from './components/account/account.component';
import { SetupMerchantBasicInfoComponent }           from './components/basic-info/basic-info.component';
import { SetupMerchantContactInfoComponent }         from './components/contact-info/contact-info.component';
import { SetupMerchantLocationComponent }            from './components/location/location.component';
import { SetupMerchantPaymentsComponent }            from './components/payments/payments.component';
import { SetupMerchantManufacturingComponent }       from './components/manufacturing/manufacturing.component';
import { SetupMerchantDeliveryAndTakeawayComponent } from './components/settings/delivery-takeaway/delivery-takeaway.component';
import { SetupMerchantOrdersSettingsComponent }      from './components/settings/orders/orders.component';

@Component({
	           styleUrls:   ['./merchants.component.scss'],
	           templateUrl: './merchants.component.html',
           })
export class SetupMerchantsComponent
{
	@ViewChild('nbStepper')
	public nbStepper: NbStepperComponent;
	
	@ViewChild('account', { static: true })
	public stepAccount: SetupMerchantAccountComponent;
	
	@ViewChild('basicInfo', { static: true })
	public stepBasicInfo: SetupMerchantBasicInfoComponent;
	
	@ViewChild('contactInfo', { static: true })
	public stepContactInfo: SetupMerchantContactInfoComponent;
	
	@ViewChild('location', { static: true })
	public stepLocation: SetupMerchantLocationComponent;
	
	@ViewChild('payments')
	public stepPayments: SetupMerchantPaymentsComponent;
	
	@ViewChild('manufacturing')
	public stepManufacturing: SetupMerchantManufacturingComponent;
	
	@ViewChild('deliveryAndTakeaway')
	public stepDeliveryAndTakeaway: SetupMerchantDeliveryAndTakeawayComponent;
	
	@ViewChild('ordersSettings')
	public stepOrdersSettings: SetupMerchantOrdersSettingsComponent;
	
	public currentStore: Warehouse;
	
	constructor(
			private warehouseAuthRouter: WarehouseAuthRouter,
			private readonly toasterService: ToasterService
	)
	{}
	
	public get canCreateMerchant()
	{
		return (
				this.stepAccount.formValid &&
				this.stepBasicInfo.formValid &&
				this.stepContactInfo.contactInfoForm.valid &&
				this.stepLocation.location.valid
		);
	}
	
	public async createMerchant()
	{
		try
		{
			this.currentStore = await this.warehouseAuthRouter.register(this.getMerchantCreateObj());
			
			this.toasterService.pop(
					'success',
					`Warehouse ${this.currentStore.name} was created!`
			);
			
			this.nbStepper.next();
		} catch(error)
		{
			this.toasterService.pop({
				                        type:    'error',
				                        title:   `Error in creating warehouse: "${error.message}"`,
				                        timeout: 0,
			                        });
		}
	}
	
	private getMerchantCreateObj(): {
		warehouse: IWarehouseCreateObject;
		password: string;
	}
	{
		let warehouse: IWarehouseCreateObject;
		let password: string;
		
		if(this.canCreateMerchant)
		{
			const geoLocationInput = this.stepLocation.locationForm.getValue();
			// geoLocationInput.loc.coordinates.reverse();
			
			const accountModel = this.stepAccount.accountModel;
			
			warehouse = {
				contactEmail: accountModel.email,
				username:     accountModel.username,
				...this.stepBasicInfo.basicInfoCreateObj,
				...this.stepContactInfo.contactInfoModel,
				geoLocation:           geoLocationInput as GeoLocation,
				isPaymentEnabled:      this.stepPayments.isPaymentEnabled,
				isManufacturing:       this.stepManufacturing.isManufacturing,
				isCarrierRequired:     this.stepDeliveryAndTakeaway.isCarrierRequired,
				productsDelivery:      this.stepDeliveryAndTakeaway.productsDelivery,
				productsTakeaway:      this.stepDeliveryAndTakeaway.productsTakeaway,
				hasRestrictedCarriers: this.stepDeliveryAndTakeaway.restrictedCarriersIds.length > 0,
				carriersIds:           this.stepDeliveryAndTakeaway.restrictedCarriersIds,
				orderBarcodeType:      this.stepOrdersSettings.iorderBarcodeType,
				isActive:              true,
				paymentGateways:       this.stepPayments.paymentsGateways,
				isCashPaymentEnabled:  this.stepPayments.isCashPaymentEnabled,
			};
			password = accountModel.password;
		}
		return { warehouse, password };
	}
}
