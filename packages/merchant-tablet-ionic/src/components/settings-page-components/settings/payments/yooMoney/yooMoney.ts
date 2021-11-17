import {
	OnInit,
	OnDestroy,
	Component,
	Input,
	Output,
	EventEmitter,
}                                  from '@angular/core';
import {
	FormGroup,
	AbstractControl,
	FormBuilder,
	Validators,
}                                  from '@angular/forms';
import { Subject }                 from 'rxjs';
import { takeUntil }               from 'rxjs/operators';
import IPaymentGatewayCreateObject from '@modules/server.common/interfaces/IPaymentGateway';
import PaymentGateways             from '@modules/server.common/enums/PaymentGateways';
import Currency                    from '@modules/server.common/entities/Currency';


/**
 * Название для пользователей: Company
 * Адрес сайта:
 * Почта для связи
 * Redirect URI
 
 * */

@Component({
	           selector:    'e-cu-yoomoney-gateway',
	           styleUrls:   ['yooMoney.scss', '../mutation/mutation.scss'],
	           templateUrl: './yooMoney.html'
           })
export class YooMoneyGatewayComponent implements OnInit, OnDestroy
{
	@Input()
	public currencies: Currency[] = [];
	@Input()
	public defaultCurrency: string;
	@Input()
	public data: {
		currency: string;
		mode: string;
		publishableKey: string;
		secretKey: string;
		description: boolean;
	};
	@Input()
	public isValid: boolean;
	
	@Output()
	public isValidChange = new EventEmitter();
	@Output()
	public configureObject = new Subject();
	
	public form: FormGroup;
	
	public currency: AbstractControl;
	public mode: AbstractControl;
	public publishableKey: AbstractControl;
	public secretKey: AbstractControl;
	public description: AbstractControl;
	
	public payPalTypes = ['sandbox', 'live'];
	
	private _ngDestroy$ = new Subject<void>();
	
	constructor(private formBuilder: FormBuilder) {}
	
	public ngOnInit()
	{
		this.buildForm(this.formBuilder);
		this.bindFormControls();
		this.onFormChanges();
	}
	
	public ngOnDestroy(): void
	{
		this.configureObject.next(this.getConfigureObject());
	}
	
	public getCurrencySign(currency: Currency)
	{
		return currency?.sign ?? currency.code;
	}
	
	private buildForm(formBuilder: FormBuilder)
	{
		this.form = formBuilder.group({
			                              currency:       [
				                              this.data ? this.data.currency : this.defaultCurrency,
				                              [Validators.required],
			                              ],
			                              mode:           [this.data ? this.data.mode : '', [Validators.required]],
			                              publishableKey: [
				                              this.data ? this.data.publishableKey : '',
				                              [Validators.required],
			                              ],
			                              secretKey:      [
				                              this.data ? this.data.secretKey : '',
				                              Validators.required,
			                              ],
			                              description:    [
				                              this.data ? this.data.description : '',
				                              Validators.required,
			                              ],
		                              });
	}
	
	private bindFormControls()
	{
		this.currency = this.form.get('currency');
		this.mode = this.form.get('mode');
		this.publishableKey = this.form.get('publishableKey');
		this.secretKey = this.form.get('secretKey');
		this.description = this.form.get('description');
	}
	
	private onFormChanges()
	{
		this.form.statusChanges
		    .pipe(takeUntil(this._ngDestroy$))
		    .subscribe(() =>
		               {
			               this.isValid = this.form.valid;
			               this.isValidChange.emit(this.isValid);
		               });
	}
	
	private getConfigureObject(): IPaymentGatewayCreateObject
	{
		return {
			paymentGateway:  PaymentGateways.PayPal,
			configureObject: this.form.getRawValue(),
		};
	}
}
