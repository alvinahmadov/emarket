import { Component, Input, ViewChild, OnChanges } from '@angular/core';
import { first }                                  from 'rxjs/operators';
import { CurrenciesService }                      from '@app/@core/data/currencies.service';
import { getCurrency }                            from '@modules/server.common/data/currencies';
import IPaymentGatewayCreateObject                from '@modules/server.common/interfaces/IPaymentGateway';
import Country                                    from '@modules/server.common/enums/Country';
import PaymentGateways                            from '@modules/server.common/enums/PaymentGateways';
import Currency                                   from '@modules/server.common/entities/Currency';
import Warehouse                                  from '@modules/server.common/entities/Warehouse';
import { StripeGatewayComponent }                 from './stripe-gateway/stripe-gateway.component';
import { PayPalGatewayComponent }                 from './paypal-gateway/paypal-gateway.component';
import { YooMoneyGatewayComponent }               from './yoomoney-gateway/yoomoney-gateway.component';
import { BitpayGatewayComponent }                 from './bitpay-gateway/bitpay-gateway.component';

@Component({
	           selector:    'ea-payment-gateways',
	           templateUrl: './payment-gateways.component.html',
           })
export class PaymentGatewaysComponent implements OnChanges
{
	@ViewChild('stripeGateway')
	public stripeGateway: StripeGatewayComponent;
	
	@ViewChild('payPalGateway')
	public payPalGateway: PayPalGatewayComponent;
	
	@ViewChild('yooMoneyGateway')
	public yooMoneyGateway: YooMoneyGatewayComponent;
	
	@ViewChild('bitpayGateway')
	public bitpayGateway: BitpayGatewayComponent;
	
	@Input()
	public warehouseLogo: string;
	
	@Input()
	public warehouseCountry: Country;
	
	@Input()
	public isEdit: boolean;
	
	public currencies: Currency[] = [];
	public locale: string = 'ru-RU';
	
	public constructor(private currenciesService: CurrenciesService)
	{
		this.loadCurrenciesCodes();
	}
	
	public get isValid(): boolean
	{
		let valid = false;
		if(
				this.stripeGateway.isStripeEnabled ||
				this.payPalGateway.isPayPalEnabled ||
				this.yooMoneyGateway.isYooEnabled ||
				this.bitpayGateway.isBitpayEnabled
		)
		{
			if(this.stripeGateway.isStripeEnabled)
			{
				valid = this.stripeGateway.isFormValid;
				
				if(!valid)
				{
					return;
				}
			}
			
			if(this.payPalGateway.isPayPalEnabled)
			{
				valid = this.payPalGateway.isFormValid;
				
				if(!valid)
				{
					return;
				}
			}
			
			if(this.yooMoneyGateway.isYooEnabled)
			{
				valid = this.yooMoneyGateway.isFormValid;
				
				if(!valid)
				{
					return;
				}
			}
			
			if(this.bitpayGateway.isBitpayEnabled)
			{
				valid = this.bitpayGateway.isFormValid;
				
				if(!valid)
				{
					return;
				}
			}
		}
		
		return valid;
	}
	
	public get paymentsGateways(): IPaymentGatewayCreateObject[]
	{
		const paymentsGateways = [];
		
		const stripeGatewayCreateObject = this.stripeGateway.createObject;
		const payPalGatewayCreateObject = this.payPalGateway.createObject;
		const yooMoneyGatewayCreateObject = this.yooMoneyGateway.createObject;
		const bitpayGatewayCreateObject = this.bitpayGateway.createObject;
		
		if(stripeGatewayCreateObject)
		{
			paymentsGateways.push(stripeGatewayCreateObject);
		}
		
		if(payPalGatewayCreateObject)
		{
			paymentsGateways.push(payPalGatewayCreateObject);
		}
		
		if(yooMoneyGatewayCreateObject)
		{
			paymentsGateways.push(yooMoneyGatewayCreateObject);
		}
		
		if(bitpayGatewayCreateObject)
		{
			paymentsGateways.push(bitpayGatewayCreateObject);
		}
		
		return paymentsGateways;
	}
	
	public ngOnChanges(): void
	{
		const merchantCountry = Country[this.warehouseCountry];
		
		if(merchantCountry)
		{
			const defaultCurrency = getCurrency(merchantCountry.toString()).code || 'RUB';
			
			if(
					this.stripeGateway &&
					(!this.isEdit || !this.stripeGateway.configModel.currency)
			)
			{
				this.stripeGateway.configModel.currency = defaultCurrency;
			}
			
			if(
					this.payPalGateway &&
					(!this.isEdit || !this.payPalGateway.configModel.currency)
			)
			{
				this.payPalGateway.configModel.currency = defaultCurrency;
			}
			
			if(
					this.yooMoneyGateway &&
					(!this.isEdit || !this.yooMoneyGateway.configModel.currency)
			)
			{
				this.yooMoneyGateway.configModel.currency = defaultCurrency;
			}
			
			if(
					this.bitpayGateway &&
					(!this.isEdit || !this.bitpayGateway.configModel.currency)
			)
			{
				this.bitpayGateway.configModel.currency = defaultCurrency;
			}
		}
	}
	
	public setValue(merchant: Warehouse)
	{
		if(merchant.paymentGateways)
		{
			const stripeConfigObj = merchant.paymentGateways.find(
					(g) => g.paymentGateway === PaymentGateways.Stripe
			);
			
			if(stripeConfigObj)
			{
				this.stripeGateway.setValue(stripeConfigObj.configureObject);
			}
			
			const payPalConfigObj = merchant.paymentGateways.find(
					(g) => g.paymentGateway === PaymentGateways.PayPal
			);
			
			if(payPalConfigObj)
			{
				this.payPalGateway.setValue(payPalConfigObj.configureObject);
			}
			
			const yooConfigObj = merchant.paymentGateways.find(
					(g) => g.paymentGateway === PaymentGateways.YooMoney
			);
			
			if(yooConfigObj)
			{
				this.yooMoneyGateway.setValue(yooConfigObj.configureObject);
			}
			
			const bitpayConfigObj = merchant.paymentGateways.find(
					(g) => g.paymentGateway === PaymentGateways.Bitpay
			);
			
			if(bitpayConfigObj)
			{
				this.bitpayGateway.setValue(bitpayConfigObj.configureObject);
			}
		}
	}
	
	private async loadCurrenciesCodes()
	{
		const currencies: Currency[] = await this.currenciesService
		                                         .getCurrencies()
		                                         .pipe(first())
		                                         .toPromise();
		
		if(currencies)
		{
			this.currencies = currencies;
		}
	}
}
