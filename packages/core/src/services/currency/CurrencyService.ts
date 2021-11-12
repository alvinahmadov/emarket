import { injectable }            from 'inversify';
import Logger                    from 'bunyan';
import { routerName }            from '@pyro/io';
import { DBService }             from '@pyro/db-server';
import { ICurrencyCreateObject } from '@modules/server.common/interfaces/ICurrency';
import ICurrencyRouter,
{ ICurrencyMutationRespone }     from '@modules/server.common/routers/ICurrencyRouter';
import Currency                  from '@modules/server.common/entities/Currency';
import IService                  from 'services/IService';
import { createLogger }          from '../../helpers/Log';

@injectable()
@routerName('currency')
export class CurrenciesService extends DBService<Currency>
		implements ICurrencyRouter, IService
{
	public readonly DBObject: any = Currency;
	
	protected readonly log: Logger = createLogger({
		                                              name: 'currenciesService'
	                                              });
	
	public async createCurrency(currency: ICurrencyCreateObject): Promise<ICurrencyMutationRespone>
	{
		let success;
		let message;
		let data;
		
		try
		{
			data = await this.create(currency);
			success = true;
			message = `Successfully create currency ${data.code}`;
		} catch(error)
		{
			success = false;
			message = error.message;
		}
		
		return { success, message, data };
	}
	
	public async getAllCurrencies(): Promise<Currency[]>
	{
		return this.find({ isDeleted: { $eq: false } });
	}
}
