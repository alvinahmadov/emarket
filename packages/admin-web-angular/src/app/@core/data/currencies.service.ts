import { Injectable }            from '@angular/core';
import { Apollo }                from 'apollo-angular';
import { Observable }            from 'rxjs';
import { map, share }            from 'rxjs/operators';
import { ICurrencyCreateObject } from '@modules/server.common/interfaces/ICurrency';
import Currency                  from '@modules/server.common/entities/Currency';
import ApolloService             from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery, GQLMutation } from 'graphql/definitions';

export interface ICurrencyMutationRespone
{
	success: boolean;
	message?: string;
	data?: Currency;
}

@Injectable()
export class CurrenciesService extends ApolloService
{
	private readonly currencies$: Observable<Currency[]>;
	
	constructor(apollo: Apollo)
	{
		super(apollo,
		      {
			      serviceName:  "Admin::CurrenciesService",
			      pollInterval: 8000
		      });
		
		this.currencies$ = this.apollo
		                       .watchQuery<{
			                       currencies: Currency[]
		                       }>({
			                          query:        GQLQuery.Currency.GetAll,
			                          pollInterval: this.pollInterval,
		                          })
		                       .valueChanges
		                       .pipe(
				                       map((result) => this.get(result)),
				                       share()
		                       );
	}
	
	public getCurrencies(): Observable<Currency[]>
	{
		return this.currencies$;
	}
	
	public create(createInput: ICurrencyCreateObject): Observable<ICurrencyMutationRespone>
	{
		return this.apollo
		           .mutate<{
			           createCurrency: ICurrencyMutationRespone
		           }>({
			              mutation:  GQLMutation.Currency.Create,
			              variables: { createInput },
		              })
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
}
