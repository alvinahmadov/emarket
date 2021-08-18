import Logger                             from 'bunyan';
import { NestFactory }                    from '@nestjs/core';
import { INestApplication }               from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApplicationModule }              from './app.module';
import { env }                            from './env';
import { createLogger }                   from './helpers/Log';
import { NestJSLogger }                   from './helpers/NestJSLogger';

const log: Logger = createLogger({ name: 'bootstrapNest' });

declare const module: any;

export async function bootstrapNest(): Promise<void>
{
	const port: number = env.GQLPORT;
	const mode = env.isProd
	             ? 'production'
	             : 'development';
	
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
	
	log.info("Starting server in '%s' mode", mode);
	log.info(`Swagger UI available at http://localhost:${port}/api`);
	log.info(`GraphQL Playground available at http://localhost:${port}/graphql`);
	log.info(`GraphQL Subscriptions available at ws://localhost:${port}/subscriptions`);
}
