import { Injectable } from '@angular/core';
import { Apollo }     from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import Currency       from '@modules/server.common/entities/Currency';
import { GQLQueries } from '@modules/server.common/utilities/graphql';

export interface ICurrencyMutationRespone
{
	success: boolean;
	message?: string;
	data?: Currency;
}

@Injectable()
export class CurrenciesService
{
	private readonly currencies$: Observable<Currency[]>;
	private static pollInterval: number = 10000;
	
	constructor(private readonly apollo: Apollo)
	{
		this.currencies$ = this.apollo
		                       .watchQuery<{
			                       currencies: Currency[]
		                       }>(
				                       {
					                       query:        GQLQueries.CurrenciesAll,
					                       pollInterval: CurrenciesService.pollInterval,
				                       }
		                       ).valueChanges
		                       .pipe(
				                       map((result) => result.data.currencies),
				                       share()
		                       );
	}
	
	public getCurrencies(): Observable<Currency[]>
	{
		return this.currencies$;
	}
}
