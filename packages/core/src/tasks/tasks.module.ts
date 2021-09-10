import { Module }            from '@nestjs/common';
import { CurrencyRatesTask } from './currency-rates';

@Module({
	        providers: [CurrencyRatesTask],
        })
export class TasksModule {}
