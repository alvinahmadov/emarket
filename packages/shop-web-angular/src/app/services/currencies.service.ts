import { Injectable } from '@angular/core';
import { Apollo }     from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import Currency       from '@modules/server.common/entities/Currency';
import ApolloService  from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery }   from 'graphql/definitions';

export interface ICurrencyMutationRespone
{
	success: boolean;
	message?: string;
	data?: Currency;
}

export interface ICurrencyFindObject
{
	code?: string;
	name?: string;
}

@Injectable()
export class CurrenciesService extends ApolloService
{
	private readonly currencies$: Observable<Currency[]>;
	
	constructor(apollo: Apollo)
	{
		super(apollo,
		      {
			      serviceName:  "Shop::CurrenciesService",
		      });
		
		this.currencies$ = this.apollo
		                       .query<{
			                       currencies: Currency[]
		                       }>({
			                          query: GQLQuery.Currency.GetAll,
		                          })
		                       .pipe(
				                       map((result) => this.get(result)),
				                       share()
		                       );
	}
	
	public getCurrencies(): Observable<Currency[]>
	{
		return this.currencies$;
	}
	
	public getCurrency(findInput: ICurrencyFindObject)
	{
		const code = findInput?.code;
		const name = findInput?.name;
		
		return this.getCurrencies()
		           .pipe(
				           map((currencies: Currency[]) =>
				               {
					               if(currencies.length == 0)
						               return null;
					               let currency: Currency;
					
					               if(code)
					               {
						               currency = currencies.filter(currency => currency.code === code)[0];
					               }
					               else
					               {
						               currency = currencies.filter(currency => currency.name === name)[0];
					               }
					               if(!currency.order)
						               currency.order = "after";
					
					               return currency;
				               })
		           );
	}
}
