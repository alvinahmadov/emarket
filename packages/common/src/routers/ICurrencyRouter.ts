import { ICurrencyCreateObject } from '../interfaces/ICurrency';
import Currency                  from '../entities/Currency';

export interface ICurrencyMutationRespone
{
	success: boolean;
	message?: string;
	data?: Currency;
}

interface ICurrencyRouter
{
	createCurrency(currency: ICurrencyCreateObject): Promise<ICurrencyMutationRespone>;
	
	getAllCurrencies(): Promise<Currency[]>
}

export default ICurrencyRouter;
