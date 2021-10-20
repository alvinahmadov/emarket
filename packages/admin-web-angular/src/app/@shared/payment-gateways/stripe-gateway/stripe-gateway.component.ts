import { Component, Input, ViewChild } from '@angular/core';
import { Subject }                     from 'rxjs';
import { takeUntil }                   from 'rxjs/operators';
import { NgForm }                      from '@angular/forms';
import { TranslateService }            from '@ngx-translate/core';
import IPaymentGatewayCreateObject     from '@modules/server.common/interfaces/IPaymentGateway';
import Country                         from '@modules/server.common/enums/Country';
import PaymentGateways, {
	paymentGatewaysToString,
	paymentGatewaysLogo,
}                                      from '@modules/server.common/enums/PaymentGateways';
import Currency                        from '@modules/server.common/entities/Currency';

@Component({
	           selector:    'ea-stripe-gateway',
	           templateUrl: './stripe-gateway.component.html',
           })
export class StripeGatewayComponent
{
	@ViewChild('stripeConfigForm', { static: true })
	public stripeConfigForm: NgForm;
	
	public isStripeEnabled: boolean;
	public name = paymentGatewaysToString(PaymentGateways.Stripe);
	public logo = paymentGatewaysLogo(PaymentGateways.Stripe);
	public invalidUrl: boolean;
	public COMPANY_BRAND_LOGO =
			       'FAKE_DATA.SETUP_MERCHANTS.PAYMENTS.STRIPE.COMPANY_BRAND_LOGO';
	@Input()
	public currencies: Currency[] = [];
	
	@Input()
	public warehouseCountry: Country;
	
	public configModel = {
		payButtontext:    '',
		currency:         '',
		companyBrandLogo: '',
		publishableKey:   '',
		allowRememberMe:  true,
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
	public set companyBrandLogo(logo: string)
	{
		if(!this.configModel.companyBrandLogo)
		{
			this.configModel.companyBrandLogo = logo;
		}
	}
	
	public get isFormValid(): boolean
	{
		let isValid = false;
		
		if(this.stripeConfigForm)
		{
			isValid =
					(this.stripeConfigForm.touched ||
					 this.stripeConfigForm.dirty) &&
					this.stripeConfigForm.valid &&
					!this.invalidUrl &&
					this.configModel.companyBrandLogo !== '';
		}
		
		return isValid;
	}
	
	public get createObject(): IPaymentGatewayCreateObject | null
	{
		if(!this.isFormValid || !this.isStripeEnabled)
		{
			return null;
		}
		
		return {
			paymentGateway:  PaymentGateways.Stripe,
			configureObject: this.configModel,
		};
	}
	
	public deleteImg()
	{
		this.configModel.companyBrandLogo = '';
	}
	
	public setValue(data)
	{
		this.isStripeEnabled = true;
		this.configModel.payButtontext = data['payButtontext'] || '';
		this.configModel.currency = data['currency'] || '';
		this.configModel.companyBrandLogo = data['companyBrandLogo'] || '';
		this.configModel.publishableKey = data['stripePublishableKey'] || '';
		this.configModel.allowRememberMe = data['allowRememberMe'];
	}
	
	public ngOnDestroy()
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
