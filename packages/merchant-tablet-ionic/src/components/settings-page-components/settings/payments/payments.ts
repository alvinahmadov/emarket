import { Component, Input, OnInit }               from '@angular/core';
import { ModalController }                        from '@ionic/angular';
import { first }                                  from 'rxjs/operators';
import Warehouse                                  from '@modules/server.common/entities/Warehouse';
import PaymentGateways,
{ paymentGatewaysLogo, paymentGatewaysToString, } from '@modules/server.common/enums/PaymentGateways';
import { getCurrency }                            from '@modules/server.common/data/currencies';
import Country                                    from '@modules/server.common/enums/Country';
import { ConfirmDeletePopupPage }                 from 'components/confirm-delete-popup/confirm-delete-popup';
import { PaymentMutationComponent }               from './mutation/mutation';
import PaymentGateway                             from '@ever-platform/common/src/entities/PaymentGateway';

@Component({
	           selector:    'merchant-payments-settings',
	           styleUrls:   ['./payments.scss'],
	           templateUrl: './payments.html',
           })
export class SettingsPaymentsComponent implements OnInit
{
	@Input()
	public currentWarehouse: Warehouse;
	
	public showPaymentsGateways: boolean;
	public hasChanged: boolean;
	public storePaymentsGateways = [];
	public paymentsGateways = [];
	public selectedStorePaymentsGateways: PaymentGateways[];
	public selectedPaymentsGateways: PaymentGateways[];
	
	constructor(public modalCtrl: ModalController) {}
	
	public ngOnInit(): void
	{
		const merchantPaymentsGateways = this.currentWarehouse
		                                     .paymentGateways
		                                     .map((mpg) => mpg.paymentGateway);
		const allPaymentGateways = Object.values(PaymentGateways)
		                                 .filter((paymentGateway) => !isNaN(<number>paymentGateway));
		
		if(merchantPaymentsGateways)
		{
			this.storePaymentsGateways = allPaymentGateways.filter(
					(paymentGateway) =>
							merchantPaymentsGateways
									.includes(<PaymentGateways>paymentGateway)
			);
		}
		
		this.paymentsGateways = allPaymentGateways
				.filter((paymentGateway) => !this.storePaymentsGateways.includes(paymentGateway));
		
		this.showPaymentsGateways = true;
	}
	
	public get isValid()
	{
		return this.hasChanged &&
		       (!this.currentWarehouse.isPaymentEnabled ||
		        this.storePaymentsGateways.length > 0);
	}
	
	public getPaymentName(ePaymentGateways: PaymentGateways)
	{
		return paymentGatewaysToString(ePaymentGateways);
	}
	
	public getPaymentLogo(ePaymentGateways: PaymentGateways)
	{
		return paymentGatewaysLogo(ePaymentGateways);
	}
	
	public async showMutation(ePaymentGateways: any)
	{
		const foundPaymentGateway = this.currentWarehouse.paymentGateways.find(
				(pg: PaymentGateway) => pg.paymentGateway === ePaymentGateways
		);
		const country = Country[this.currentWarehouse.geoLocation.countryId];
		const modal = await this.modalCtrl
		                        .create({
			                                component:      PaymentMutationComponent,
			                                componentProps: {
				                                configureObject:
						                                foundPaymentGateway &&
						                                foundPaymentGateway.configureObject,
				                                paymentGateway:          ePaymentGateways,
				                                defaultCompanyBrandLogo: this.currentWarehouse.logo,
				                                defaultCurrency:
						                                getCurrency(country).code,
			                                },
			                                cssClass:       'payments-mutation-wrapper',
		                                });
		
		await modal.present();
		
		const { data } = await modal.onDidDismiss();
		
		if(data)
		{
			const res = await data.pipe(first()).toPromise();
			
			this.currentWarehouse.paymentGateways = this.currentWarehouse.paymentGateways.filter(
					(pg) => pg.paymentGateway !== res.paymentGateway
			);
			this.currentWarehouse.paymentGateways.push(res);
			
			this.storePaymentsGateways = this.storePaymentsGateways.filter(
					(pg) => pg !== res.paymentGateway
			);
			this.storePaymentsGateways.push(res.paymentGateway);
			
			this.paymentsGateways = this.paymentsGateways.filter(
					(pg) => pg !== res.paymentGateway
			);
			this.hasChanged = true;
		}
		
		this.selectedStorePaymentsGateways = [];
		this.selectedPaymentsGateways = [];
	}
	
	public async confirmRemovePaymentGateway(ePaymentGateways: PaymentGateways)
	{
		const modal = await this.modalCtrl.create(
				{
					component:      ConfirmDeletePopupPage,
					componentProps: {
						data:     {
							image: this.getPaymentLogo(ePaymentGateways),
							name:  this.getPaymentName(ePaymentGateways),
						},
						isRemove: true,
					},
					cssClass:       'confirm-delete-wrapper',
				}
		);
		
		await modal.present();
		
		const res = await modal.onDidDismiss();
		
		if(res.data)
		{
			this.removePaymentGateway(ePaymentGateways);
		}
	}
	
	private removePaymentGateway(ePaymentGateways: PaymentGateways)
	{
		this.paymentsGateways = [...this.paymentsGateways, ePaymentGateways];
		
		this.storePaymentsGateways = this.storePaymentsGateways.filter(
				(existedPG: PaymentGateways) => existedPG !== ePaymentGateways
		);
		this.currentWarehouse.paymentGateways = this.currentWarehouse.paymentGateways.filter(
				(existedPG: PaymentGateway) => existedPG.paymentGateway !== ePaymentGateways
		);
		this.hasChanged = true;
	}
}
