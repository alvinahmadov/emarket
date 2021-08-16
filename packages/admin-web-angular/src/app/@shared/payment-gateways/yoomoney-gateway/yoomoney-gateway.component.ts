import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import PaymentGateways, {
	paymentGatewaysToString,
	paymentGatewaysLogo,
}                                                 from '@modules/server.common/enums/PaymentGateways';
import { Country }                                from '@modules/server.common/entities';
import { NgForm }                                 from '@angular/forms';
import IPaymentGatewayCreateObject                from '@modules/server.common/interfaces/IPaymentGateway';
import { TranslateService }                       from '@ngx-translate/core';
import { takeUntil }                              from 'rxjs/operators';
import { Subject }                                from 'rxjs';

@Component({
	           selector: 'ea-yooMoney-gateway',
	           templateUrl: './yoomoney-gateway.component.html',
           })
export class YooMoneyGatewayComponent
{
	@ViewChild('yooConfigForm', { static: true })
	public yooConfigForm: NgForm;
	
	public isYooEnabled: boolean;
	public name: string = paymentGatewaysToString(PaymentGateways.YooMoney);
	public logo = paymentGatewaysLogo(PaymentGateways.YooMoney);
	public invalidUrl: boolean;
	public COMPANY_BRAND_LOGO =
			'FAKE_DATA.SETUP_MERCHANTS.PAYMENTS.STRIPE.COMPANY_BRAND_LOGO';
	@Input()
	public currenciesCodes: string[] = [];
	@Input()
	public warehouseCountry: Country;
	public configModel = {
		payButtontext: '',
		currency: '',
		companyBrandLogo: '',
		publishableKey: '',
		shopId: '',
		secretKey: ''
	};
	private _ngDestroy$ = new Subject<void>();
	
	constructor(private translateService: TranslateService)
	{
		// https://github.com/ngx-translate/core/issues/835
		// see how to translate words in the component(.ts) file
		
		translateService
				.stream(this.COMPANY_BRAND_LOGO)
				.pipe(takeUntil(this._ngDestroy$))
				.subscribe((text: string) =>
				           {
					           this.COMPANY_BRAND_LOGO = text;
				           });
	}
	
	@Input()
	set companyBrandLogo(logo: string)
	{
		if(!this.configModel.companyBrandLogo)
		{
			this.configModel.companyBrandLogo = logo;
		}
	}
	
	get isFormValid(): boolean
	{
		let isValid = false;
		
		if(this.yooConfigForm)
		{
			isValid =
					(this.yooConfigForm.touched ||
					 this.yooConfigForm.dirty) &&
					this.yooConfigForm.valid &&
					!this.invalidUrl &&
					this.configModel.companyBrandLogo !== '';
		}
		
		return isValid;
	}
	
	get createObject(): IPaymentGatewayCreateObject | null
	{
		if(!this.isFormValid || !this.isYooEnabled)
		{
			return null;
		}
		
		return {
			paymentGateway: PaymentGateways.YooMoney,
			configureObject: this.configModel,
		};
	}
	
	public deleteImg()
	{
		this.configModel.companyBrandLogo = '';
	}
	
	public setValue(data)
	{
		this.isYooEnabled = true;
		this.configModel.payButtontext = data['payButtontext'] || '';
		this.configModel.currency = data['currency'] || '';
		this.configModel.companyBrandLogo = data['companyBrandLogo'] || '';
		this.configModel.publishableKey = data['publishableKey'] || '';
		this.configModel.shopId = data['shopId'] || '';
		this.configModel.secretKey = data['secretKey'] || '';
	}
	
	ngOnDestroy()
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
