import { Subject }                 from 'rxjs';
import { first }                   from 'rxjs/operators';
import { Component }               from '@angular/core';
import { ModalController }         from '@ionic/angular';
import IPaymentGatewayCreateObject from '@modules/server.common/interfaces/IPaymentGateway';
import Currency                    from '@modules/server.common/entities/Currency';
import PaymentGateways, {
	paymentGatewaysToString,
}                                  from '@modules/server.common/enums/PaymentGateways';
import { CurrenciesService }       from 'services/currencies.service';

@Component({
	           selector:    'merchant-payments-mutation',
	           templateUrl: 'mutation.html',
	           styleUrls:   ['mutation.scss'],
           })
export class PaymentMutationComponent
{
	public defaultCompanyBrandLogo: string;
	public defaultCurrency: string;
	public configureObject: any;
	public paymentGateway: PaymentGateways;
	public currencies: Currency[] = [];
	public paymentGateways = PaymentGateways;
	public newConfigureObject = new Subject<IPaymentGatewayCreateObject>();
	public isValid: boolean;
	
	constructor(
			public modalController: ModalController,
			private currenciesService: CurrenciesService
	)
	{
		this.loadCurrencies();
	}
	
	public get titleText()
	{
		return `${
				this.configureObject ? 'Update' : 'Add'
		}  ${paymentGatewaysToString(this.paymentGateway)} gateway`;
	}
	
	public cancelModal(newConfigureObject?: Subject<IPaymentGatewayCreateObject>)
	{
		this.modalController.dismiss(newConfigureObject);
	}
	
	public updateConfigureObject(e)
	{
		this.newConfigureObject.next(e);
	}
	
	private async loadCurrencies()
	{
		const res = await this.currenciesService
		                      .getCurrencies()
		                      .pipe(first())
		                      .toPromise();
		
		if(res)
		{
			this.currencies = res.map((r) => r);
		}
	}
}
