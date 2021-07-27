import { NestFactory }                    from '@nestjs/core';
import { ApplicationModule }              from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { env }                            from './env';
import Logger                             from 'bunyan';
import { createLogger }                   from './helpers/Log';
import { NestJSLogger }                   from './helpers/NestJSLogger';
import { INestApplication }               from '@nestjs/common';

const log: Logger = createLogger({ name: 'bootstrapNest' });

declare const module: any;

export async function bootstrapNest(): Promise<void>
{
	const port: number = env.GQLPORT;
	
	const app: INestApplication = await NestFactory.create(ApplicationModule, {
		logger: new NestJSLogger()
	});
	
	app.enableCors();
	const options = new DocumentBuilder()
			.setTitle('REST API')
			.setVersion('1.0')
			.addBearerAuth()
			.build();
	
	const document = SwaggerModule.createDocument(app, options);
	
	SwaggerModule.setup('api', app, document);
	
	await app.listen(port + '');
	
	if(module.hot)
	{
		module.hot.accept();
		module.hot.dispose((_) => app.close());
	}
	
	log.info(`Swagger UI available at http://localhost:${port}/api`);
	console.log(`Swagger UI available at http://localhost:${port}/api`);
}
