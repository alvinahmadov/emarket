import {
	Component,
	OnInit,
	Input,
	OnDestroy,
	Output,
	EventEmitter,
}                                      from '@angular/core';
import {
	FormGroup,
	AbstractControl,
	FormBuilder,
	Validators,
}                                      from '@angular/forms';
import { Subject }                     from 'rxjs';
import { takeUntil }                   from 'rxjs/operators';
import { IPaymentGatewayCreateObject } from '@modules/server.common/interfaces/IPaymentGateway';
import PaymentGateways                 from '@modules/server.common/enums/PaymentGateways';
import Currency                        from '@modules/server.common/entities/Currency';

@Component({
	           selector:    'e-cu-bitpay-gateway',
	           styleUrls:   ['bitpay.scss', '../mutation/mutation.scss'],
	           templateUrl: './bitpay.html',
           })
export class BitpayGatewayComponent implements OnInit, OnDestroy
{
	@Input()
	public currencies: Currency[] = [];
	@Input()
	public defaultCompanyBrandLogo: string;
	@Input()
	public defaultCurrency: string;
	@Input()
	public data: {
		payButtontext: string;
		currency: string;
		companyBrandLogo: string;
		publishableKey: string;
		allowRememberMe: boolean;
	};
	@Input()
	public isValid: boolean;
	
	@Output()
	public isValidChange = new EventEmitter();
	@Output()
	public configureObject = new Subject();
	
	public form: FormGroup;
	
	public payButtontext: AbstractControl;
	public currency: AbstractControl;
	public companyBrandLogo: AbstractControl;
	public publishableKey: AbstractControl;
	public allowRememberMe: AbstractControl;
	public invalidUrl: boolean;
	
	private _ngDestroy$ = new Subject<void>();
	
	constructor(private formBuilder: FormBuilder) {}
	
	public ngOnInit()
	{
		this.buildForm(this.formBuilder);
		this.bindFormControls();
		this.onFormChanges();
	}
	
	public deleteImg()
	{
		this.companyBrandLogo.setValue('');
	}
	
	public ngOnDestroy(): void
	{
		this.configureObject.next(this.getConfigureObject());
	}
	
	public onUrlChanges(isInvalid: boolean)
	{
		this.invalidUrl = isInvalid;
		this.isValid = this.form.valid && !isInvalid;
		this.isValidChange.emit(this.isValid);
	}
	
	public getCurrencySign(currency: Currency)
	{
		return currency?.sign ?? currency.code;
	}
	
	private buildForm(formBuilder: FormBuilder)
	{
		this.form = formBuilder.group({
			                              payButtontext:    [
				                              this.data
				                              ? this.data.payButtontext
				                              : '',
				                              [Validators.required],
			                              ],
			                              currency:         [
				                              this.data
				                              ? this.data.currency
				                              : this.defaultCurrency,
				                              [Validators.required],
			                              ],
			                              companyBrandLogo: [
				                              this.data
				                              ? this.data.companyBrandLogo
				                              : this.defaultCompanyBrandLogo,
				                              [Validators.required],
			                              ],
			                              publishableKey:   [
				                              this.data
				                              ? this.data.publishableKey
				                              : '',
				                              Validators.required,
			                              ],
			                              allowRememberMe:  [
				                              this.data
				                              ? this.data.allowRememberMe
				                              : ''
			                              ],
		                              });
	}
	
	private bindFormControls()
	{
		this.payButtontext = this.form.get('payButtontext');
		this.currency = this.form.get('currency');
		this.companyBrandLogo = this.form.get('companyBrandLogo');
		this.publishableKey = this.form.get('publishableKey');
		this.allowRememberMe = this.form.get('allowRememberMe');
	}
	
	private getConfigureObject(): IPaymentGatewayCreateObject
	{
		return {
			paymentGateway:  PaymentGateways.Stripe,
			configureObject: this.form.getRawValue(),
		};
	}
	
	private onFormChanges()
	{
		this.form.statusChanges
		    .pipe(takeUntil(this._ngDestroy$))
		    .subscribe(() =>
		               {
			               this.isValid = this.form.valid && !this.invalidUrl;
			               this.isValidChange.emit(this.isValid);
		               });
	}
}
