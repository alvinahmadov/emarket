import { LoggerService } from '@nestjs/common/services/logger.service';
import { createLogger }  from './Log';

const log = createLogger({ name: 'nestjs' });

export class NestJSLogger implements LoggerService
{
	log(message: string)
	{
		log.info(message);
	}
	
	error(message: string, trace: string)
	{
		log.error(`Message: ${message}. Trace: ${trace}`);
	}
	
	warn(message: string)
	{
		log.warn(message);
	}
}
