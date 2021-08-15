import { Injectable } from '@angular/core';
import { Apollo }     from 'apollo-angular';
import { Observable } from 'rxjs';
import Currency       from '@modules/server.common/entities/Currency';
import { map, share } from 'rxjs/operators';
import {
	GQLQueries,
	GQLMutations
}                     from '@modules/server.common/utilities/graphql';

export type CurrencyQuery = { currencies: Currency[] };

export type CurrencyCreateInput = { currencyCode: string };

export interface CurrencyMutationRespone
{
	success: boolean;
	message?: string;
	data?: Currency;
}

@Injectable()
export class CurrenciesService
{
	private readonly currencies$: Observable<Currency[]>;
	
	constructor(private readonly apollo: Apollo)
	{
		this.currencies$ = this.apollo
		                       .watchQuery<CurrencyQuery>(
				                       {
					                       query: GQLQueries.CurrenciesAll,
					                       pollInterval: 2000,
				                       }
		                       )
		                       .valueChanges
		                       .pipe(
				                       map((result) => result.data.currencies),
				                       share()
		                       )
		
		if(this.currencies$.isEmpty)
		{
			this.create({ currencyCode: "RUB" });
			this.create({ currencyCode: "EUR" });
			this.create({ currencyCode: "USD" });
		}
	}
	
	getCurrencies(): Observable<Currency[]>
	{
		return this.currencies$;
	}
	
	create(createInput: CurrencyCreateInput): Observable<CurrencyMutationRespone>
	{
		return this.apollo
		           .mutate<{
			           createCurrency: CurrencyMutationRespone
		           }>(
				           {
					           mutation: GQLMutations.CurrencyCreate,
					           variables: {
						           createInput,
					           },
				           })
		           .pipe(
				           map((result) => result.data.createCurrency),
				           share()
		           );
	}
}
