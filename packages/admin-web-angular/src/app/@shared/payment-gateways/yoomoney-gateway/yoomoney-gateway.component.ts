import { Component, Input, ViewChild, OnDestroy } from '@angular/core';
import { NgForm }                                 from '@angular/forms';
import { Subject }                                from 'rxjs';
import Country                                    from '@modules/server.common/enums/Country';
import PaymentGateways, {
	paymentGatewaysToString,
	paymentGatewaysLogo,
}                                                 from '@modules/server.common/enums/PaymentGateways';
import IPaymentGatewayCreateObject                from '@modules/server.common/interfaces/IPaymentGateway';
import Currency                                   from '@modules/server.common/entities/Currency';

@Component({
	           selector:    'ea-yooMoney-gateway',
	           templateUrl: './yoomoney-gateway.component.html',
           })
export class YooMoneyGatewayComponent implements OnDestroy
{
	@ViewChild('yooConfigForm', { static: true })
	public yooConfigForm: NgForm;
	
	public isYooEnabled: boolean;
	public name: string = paymentGatewaysToString(PaymentGateways.YooMoney);
	public logo = paymentGatewaysLogo(PaymentGateways.YooMoney);
	public invalidUrl: boolean;
	
	@Input()
	public currencies: Currency[] = [];
	@Input()
	public warehouseCountry: Country;
	public configModel = {
		payButtontext:  '',
		currency:       '',
		publishableKey: '',
		shopId:         '',
		secretKey:      '',
	};
	private _ngDestroy$ = new Subject<void>();
	
	public ngOnDestroy()
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	public get isFormValid(): boolean
	{
		let isValid = false;
		
		if(this.yooConfigForm)
		{
			isValid =
					(this.yooConfigForm.touched ||
					 this.yooConfigForm.dirty) &&
					this.yooConfigForm.valid &&
					!this.invalidUrl;
		}
		
		return isValid;
	}
	
	public get createObject(): IPaymentGatewayCreateObject | null
	{
		if(!this.isFormValid || !this.isYooEnabled)
		{
			return null;
		}
		
		return {
			paymentGateway:  PaymentGateways.YooMoney,
			configureObject: this.configModel,
		};
	}
	
	public setValue(data)
	{
		this.isYooEnabled = true;
		this.configModel.payButtontext = data['payButtontext'] || '';
		this.configModel.currency = data['currency'] || '';
		this.configModel.publishableKey = data['publishableKey'] || '';
		this.configModel.shopId = data['shopId'] || '';
		this.configModel.secretKey = data['secretKey'] || '';
	}
}
