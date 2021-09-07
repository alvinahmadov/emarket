import { Module }           from '@nestjs/common';
import { CustomerResolver } from './customers.resolver';

@Module({
	        providers: [CustomerResolver]
        })
export class CustomersModule {}
