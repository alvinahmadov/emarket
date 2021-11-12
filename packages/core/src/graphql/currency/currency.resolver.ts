import { Resolver, Query, Mutation } from '@nestjs/graphql';
import { ICurrencyCreateObject }     from '@modules/server.common/interfaces/ICurrency';
import { ICurrencyMutationRespone }  from '@modules/server.common/routers/ICurrencyRouter';
import Currency                      from '@modules/server.common/entities/Currency';
import { CurrenciesService }         from '../../services/currency/CurrencyService';

@Resolver('Currency')
export class CurrencyResolver
{
	constructor(private readonly _currenciesService: CurrenciesService) {}
	
	@Query('currencies')
	public async getCurrencies(_): Promise<Currency[]>
	{
		return this._currenciesService.getAllCurrencies();
	}
	
	@Mutation()
	public async createCurrency(
			_,
			{ createInput }: { createInput: ICurrencyCreateObject }
	): Promise<ICurrencyMutationRespone>
	{
		return this._currenciesService.createCurrency(createInput);
	}
}
