import { Component, Input, ViewChild } from '@angular/core';
import { NgForm }                      from '@angular/forms';
import PaymentGateways, {
	paymentGatewaysToString,
	paymentGatewaysLogo,
}                                      from '@modules/server.common/enums/PaymentGateways';
import Country                         from '@modules/server.common/enums/Country';
import IPaymentGatewayCreateObject     from '@modules/server.common/interfaces/IPaymentGateway';
import Currency                        from '@modules/server.common/entities/Currency';

@Component({
	           selector:    'ea-bitpay-gateway',
	           templateUrl: './bitpay-gateway.component.html',
           })
export class BitpayGatewayComponent
{
	@ViewChild('bitpayConfigForm', { static: true })
	public bitpayConfigForm: NgForm;
	
	@Input()
	public currencies: Currency[] = [];
	@Input()
	
	public warehouseCountry: Country;
	public isBitpayEnabled: boolean;
	public name = paymentGatewaysToString(PaymentGateways.Bitpay);
	
	public logo = paymentGatewaysLogo(PaymentGateways.Bitpay);
	
	// TODO: Check
	public configModel = {
		currency:       '',
		mode:           '',
		publishableKey: '',
		secretKey:      '',
		description:    '',
	};
	
	public types = ['sandbox', 'live'];
	
	public get isFormValid(): boolean
	{
		let isValid = false;
		
		if(this.bitpayConfigForm)
		{
			isValid =
					(this.bitpayConfigForm.touched ||
					 this.bitpayConfigForm.dirty) &&
					this.bitpayConfigForm.valid;
		}
		
		return isValid;
	}
	
	public get createObject(): IPaymentGatewayCreateObject | null
	{
		if(!this.isFormValid || !this.isBitpayEnabled)
		{
			return null;
		}
		
		return {
			paymentGateway:  PaymentGateways.Bitpay,
			configureObject: this.configModel,
		};
	}
	
	public setValue(data)
	{
		this.isBitpayEnabled = true;
		this.configModel.currency = data['currency'] || '';
		this.configModel.mode = data['mode'] || '';
		this.configModel.publishableKey = data['publishableKey'] || '';
		this.configModel.secretKey = data['secretKey'] || '';
		this.configModel.description = data['description'] || '';
	}
}
