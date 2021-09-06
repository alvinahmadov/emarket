import Currency                  from '@modules/server.common/entities/Currency';
import { injectable }            from 'inversify';
import { routerName }            from '@pyro/io';
import { DBService }             from '@pyro/db-server';
import IService                  from 'services/IService';
import { ICurrencyCreateObject } from '@modules/server.common/interfaces/ICurrency';
import { createLogger }          from '../../helpers/Log';
import Logger                    from 'bunyan';

export interface CurrencyMutationRespone
{
	success: boolean;
	message?: string;
	data?: Currency;
}

@injectable()
@routerName('currency')
export class CurrenciesService extends DBService<Currency> implements IService
{
	public readonly DBObject: any = Currency;
	
	protected readonly log: Logger = createLogger({
		                                              name: 'currenciesService'
	                                              });
	
	async createCurrency(
			currency: ICurrencyCreateObject
	): Promise<CurrencyMutationRespone>
	{
		let success;
		let message;
		let data;
		
		try
		{
			data = await this.create(currency);
			success = true;
			message = `Successfully create currency ${data.currencyCode}`;
		} catch(error)
		{
			success = false;
			message = error.message;
		}
		
		return { success, message, data };
	}
	
	async getAllCurrencies(): Promise<Currency[]>
	{
		return await this.find({
			                       isDeleted: { $eq: false }
		                       });
	}
}
