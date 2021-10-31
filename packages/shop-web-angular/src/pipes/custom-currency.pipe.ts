import { Pipe, PipeTransform } from '@angular/core';
import Currency                from '@modules/server.common/entities/Currency';

@Pipe({
	      name: 'customCurrency'
      })
export class CustomCurrencyPipe implements PipeTransform
{
	public transform(value: number, currency?: Currency, digits: number = 2): string
	{
		if(!value)
			return "";
		const amount: string = value.toFixed(digits);
		
		if(currency)
		{
			const sign = currency.sign ?? currency.code;
			return currency.order === 'before' ? `${sign}${amount}` : `${amount}${sign}`;
		}
		
		return `$${amount}`;
	}
}
