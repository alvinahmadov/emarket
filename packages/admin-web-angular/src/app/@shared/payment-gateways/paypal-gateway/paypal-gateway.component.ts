import { Component, Input, ViewChild } from '@angular/core';
import { NgForm }                      from '@angular/forms';
import IPaymentGatewayCreateObject     from '@modules/server.common/interfaces/IPaymentGateway';
import Country                         from '@modules/server.common/enums/Country';
import PaymentGateways, {
	paymentGatewaysToString,
	paymentGatewaysLogo,
}                                      from '@modules/server.common/enums/PaymentGateways';
import Currency                        from '@modules/server.common/entities/Currency';

@Component({
	           selector:    'ea-payPal-gateway',
	           templateUrl: './paypal-gateway.component.html',
           })
export class PayPalGatewayComponent
{
	@ViewChild('payPalConfigForm', { static: true })
	public payPalConfigForm: NgForm;
	
	public isPayPalEnabled: boolean;
	public name = paymentGatewaysToString(PaymentGateways.PayPal);
	public logo = paymentGatewaysLogo(PaymentGateways.PayPal);
	
	@Input()
	public currencies: Currency[] = [];
	
	@Input()
	public warehouseCountry: Country;
	
	public configModel = {
		currency:       '',
		mode:           '',
		publishableKey: '',
		secretKey:      '',
		description:    '',
	};
	
	public payPalTypes = ['sandbox', 'live'];
	
	public get isFormValid(): boolean
	{
		let isValid = false;
		
		if(this.payPalConfigForm)
		{
			isValid =
					(this.payPalConfigForm.touched ||
					 this.payPalConfigForm.dirty) &&
					this.payPalConfigForm.valid;
		}
		
		return isValid;
	}
	
	public get createObject(): IPaymentGatewayCreateObject | null
	{
		if(!this.isFormValid || !this.isPayPalEnabled)
		{
			return null;
		}
		
		return {
			paymentGateway:  PaymentGateways.PayPal,
			configureObject: this.configModel,
		};
	}
	
	public setValue(data)
	{
		this.isPayPalEnabled = true;
		this.configModel.currency = data['currency'] || '';
		this.configModel.mode = data['mode'] || '';
		this.configModel.publishableKey = data['publishableKey'] || '';
		this.configModel.secretKey = data['secretKey'] || '';
		this.configModel.description = data['description'] || '';
	}
}
