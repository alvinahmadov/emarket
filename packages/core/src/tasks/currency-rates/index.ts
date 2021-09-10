import { Injectable, Logger }      from '@nestjs/common';
import { Cron, CronExpression }    from '@nestjs/schedule';
import { readdirSync, unlinkSync } from 'fs';
import path                        from 'path';
import { env }                     from '../../env';
import { downloadCurrencyRates }   from '../../tools/currency-quotes-generator';

@Injectable()
export class CurrencyRatesTask
{
	protected readonly logger: Logger = new Logger(CurrencyRatesTask.name);
	protected static readonly fileDir = '../../../../cache/currency';
	
	@Cron(CronExpression.EVERY_DAY_AT_7AM, {
		name:     'currencyCaches',
		timeZone: env.TIME_ZONE ?? 'Europe/Moscow'
	})
	async getCurrencyRates()
	{
		let currencyCaches = readdirSync(
				path.resolve(__dirname, CurrencyRatesTask.fileDir)
		);
		
		if(currencyCaches.length >= 4)
		{
			currencyCaches.forEach(
					file =>
					{
						if(file !== '.keep')
						{
							unlinkSync(path.resolve(
									__dirname, `${CurrencyRatesTask.fileDir}/${file}`
							))
						}
					})
		}
		
		this.logger.log("Downloading currency rates...");
		try
		{
			await downloadCurrencyRates();
		} catch(e)
		{
			this.logger.error(e)
		}
		this.logger.log("Finished downloading currency rates");
	}
}
