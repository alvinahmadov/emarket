import { Injectable } from '@angular/core';
import { Apollo }     from 'apollo-angular';
import { Observable } from 'rxjs';
import Currency       from '@modules/server.common/entities/Currency';
import gql            from 'graphql-tag';
import { map, share } from 'rxjs/operators';

export interface CurrencyMutationRespone
{
	success: boolean;
	message?: string;
	data?: Currency;
}

@Injectable()
export class CurrenciesService
{
	private currencies$: Observable<Currency[]> = this.apollo
	.watchQuery<{ currencies: Currency[] }>({
                                                query: gql`
                                                    query allCurrencies {
                                                        currencies {
                                                            currencyCode
                                                        }
                                                    }
		                                        `,
		                                        pollInterval: 2000,
                                            })
	.valueChanges.pipe(
			map((result) => result.data.currencies),
			share()
	);
	
	constructor(private readonly apollo: Apollo) {}
	
	getCurrencies(): Observable<Currency[]>
	{
		return this.currencies$;
	}

    create(createInput: {
		currencyCode: string;
	}): Observable<CurrencyMutationRespone>
    {
        return this.apollo
		.mutate<{ createCurrency: CurrencyMutationRespone }>({
                                                                 mutation: gql`
                                                                     mutation CreateCurrency(
                                                                         $createInput: CurrencyCreateInput!
                                                                     ) {
                                                                         createCurrency(createInput: $createInput) {
                                                                             success
                                                                             message
                                                                             data {
                                                                                 currencyCode
                                                                             }
                                                                         }
                                                                     }
			                                                     `,
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
