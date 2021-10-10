import Logger                                 from 'bunyan';
import { ModuleRef }                          from '@nestjs/core';
import {
	MiddlewareConsumer,
	Module,
	NestModule,
	OnModuleInit
}                                             from '@nestjs/common';
import { CommandBus, EventBus, CqrsModule }   from '@nestjs/cqrs';
import { TypeOrmModule }                      from '@nestjs/typeorm';
import { GraphQLModule }                      from '@nestjs/graphql';
import { ScheduleModule }                     from '@nestjs/schedule';
import { GraphQLSchema }                      from 'graphql';
import { ApolloServer, makeExecutableSchema } from 'apollo-server-express';
import { fileLoader, mergeTypes }             from 'merge-graphql-schemas';
import mongoose                               from 'mongoose';
import * as jwt                               from 'jsonwebtoken';
import { CommonUtils as Common }              from '@modules/server.common/utilities'
import { ConfigModule }                       from './config/config.module';
import { TestController }                     from './controllers/test.controller';
import { ProductModule }                      from './controllers/product/product.module';
import { SubscriptionsModule }                from './graphql/subscriptions/subscriptions.module';
import { SubscriptionsService }               from './graphql/subscriptions/subscriptions.service';
import { InvitesModule }                      from './graphql/invites/invites.module';
import { DevicesModule }                      from './graphql/devices/devices.module';
import { CustomersModule }                    from './graphql/customers/customers.module';
import { WarehousesModule }                   from './graphql/warehouses/warehouses.module';
import { OrdersModule }                       from './graphql/orders/orders.module';
import { CarriersModule }                     from './graphql/carriers/carriers.module';
import { ProductsModule }                     from './graphql/products/products.module';
import { GeoLocationsModule }                 from './graphql/geo-locations/geo-locations.module';
import { SCALARS }                            from './graphql/scalars';
import { WarehousesProductsModule }           from './graphql/warehouses-products/warehouses-products.modules';
import { WarehousesCarriersModule }           from './graphql/warehouses-carriers/warehouses-carriers.module';
import { WarehousesOrdersModule }             from './graphql/warehouses-orders/warehouses-orders.module';
import { InvitesRequestsModule }              from './graphql/invites-requests/invites-requests.module';
import { AdminsModule }                       from './graphql/admin/admins.module';
import { DataModule }                         from './graphql/data/data.module';
import { CarriersOrdersModule }               from './graphql/carriers-orders/carriers-orders.module';
import { GeoLocationOrdersModule }            from './graphql/geo-locations/orders/geo-location-orders.module';
import { GeoLocationMerchantsModule }         from './graphql/geo-locations/merchants/geo-location-merchants.module';
import { CurrencyModule }                     from './graphql/currency/currency.module';
import { PromotionModule }                    from './graphql/products/promotions/promotion.module';
import { AppsSettingsModule }                 from './graphql/apps-settings/apps-settings.module';
import { AuthModule }                         from './auth/auth.module';
import { createLogger }                       from './helpers/Log';
import { GetAboutUsHandler }                  from './services/customers';
import { ServicesModule }                     from './services/services.module';
import { ServicesApp }                        from './services/services.app';
import { TasksModule }                        from './tasks/tasks.module';
import { env }                                from './env';
import { IncomingMessage, ServerResponse }    from 'http';

const gqlEndpoint = env.GQL_ENDPOINT;
const subscriptionsEndpoint = env.GQL_SUBSCRIPTIONS_ENDPOINT;
const graphqlPath = './**/*.graphql';

const log: Logger = createLogger({
	                                 name: 'ApplicationModule from NestJS'
                                 });

type GraphQLContext = { req: IncomingMessage, res: ServerResponse }

export async function apolloContextFactory(context: GraphQLContext)
{
	if(!context.req.connection)
	{
		// check connection for metadata
		return context;
	}
	else
	{
		// check from req
		if(!context.req?.headers)
			throw new Error("No headers in request");
		const authorization: string = context.req.headers.authorization;
		const token = authorization ? authorization.split(' ')[1] : null;
		
		if(token)
		{
			try
			{
				//validate user in client.
				const currentUser = await jwt.verify(token, env.JWT_SECRET);
				
				//add user to request
				context.req['user'] = currentUser;
				
				return currentUser
			} catch(e)
			{
			
			}
		}
		return context.req;
	}
}

export function apolloDefaultContextFactory({ req })
{
	return { req };
}

// Add here all CQRS command handlers
export const CommandHandlers = [GetAboutUsHandler];

// Add here all CQRS event handlers
export const EventHandlers = [];

const entities = ServicesApp.getEntities();

const gqlSubscriptionsEndpoint = env.GQL_SUBSCRIPTIONS_ENDPOINT

@Module({
	        controllers: [TestController],
	        providers:   [...CommandHandlers, ...EventHandlers],
	        imports:     [
		        DataModule,
		        ServicesModule,
		        CqrsModule,
		        AuthModule,
		        AdminsModule,
		        AppsSettingsModule,
		        ConfigModule,
		        // configure TypeORM Connection which will be possible to use inside NestJS (e.g. resolvers)
		        TypeOrmModule.forRoot({
			                              type:            'mongodb',
			                              url:             env.DB_URI,
			                              entities,
			                              synchronize:     true,
			                              useNewUrlParser: true,
			                              autoReconnect:   true,
			                              logging:         true
		                              }),
		        // define which repositories shall be registered in the current scope (each entity will have own
		        // repository). Thanks to that we can inject the XXXXRepository to the NestJS using the
		        // @InjectRepository() decorator NOTE: this could be used inside NestJS only, not inside our services
		        TypeOrmModule.forFeature(entities),
		        SubscriptionsModule.forRoot(
				        Common.getPort(gqlSubscriptionsEndpoint),
				        Common.getHost(gqlSubscriptionsEndpoint)
		        ),
		        GraphQLModule.forRoot({
			                              typePaths:                   ['./**/*.graphql'],
			                              installSubscriptionHandlers: true,
			                              debug:                       !env.isProd,
			                              playground:                  !env.isProd,
			                              context:                     (ctx) => (apolloContextFactory(ctx))
		                              }),
		        ScheduleModule.forRoot(),
		        TasksModule,
		        InvitesModule,
		        DevicesModule,
		        ProductModule,
		        CustomersModule,
		        WarehousesModule,
		        GeoLocationsModule,
		        OrdersModule,
		        CarriersModule,
		        CarriersOrdersModule,
		        ProductsModule,
		        WarehousesProductsModule,
		        WarehousesOrdersModule,
		        WarehousesCarriersModule,
		        InvitesRequestsModule,
		        GeoLocationOrdersModule,
		        GeoLocationMerchantsModule,
		        CurrencyModule,
		        PromotionModule
	        ]
        })
export class ApplicationModule implements NestModule, OnModuleInit
{
	constructor(
			// @Inject(HTTP_SERVER_REF)
			// private readonly httpServerRef: HttpServer,
			private readonly subscriptionsService: SubscriptionsService,
			// Next required for NestJS CQRS (see https://docs.nestjs.com/recipes/cqrs)
			private readonly moduleRef: ModuleRef,
			private readonly command$: CommandBus,
			private readonly event$: EventBus
	)
	{}
	
	onModuleInit()
	{
		// initialize CQRS
		this.event$.register(EventHandlers);
		this.command$.register(CommandHandlers);
	}
	
	configure(consumer: MiddlewareConsumer)
	{
		// trick for GraphQL vs MongoDB ObjectId type.
		// See https://github.com/apollographql/apollo-server/issues/1633 and
		// https://github.com/apollographql/apollo-server/issues/1649#issuecomment-420840287
		const { ObjectId } = mongoose.Types;
		
		ObjectId.prototype.valueOf = function()
		{
			return this.toString();
		};
		
		/* Next is code which could be used to manually create GraphQL Server instead of using GraphQLModule.forRoot(...)
		 
		 const schema: GraphQLSchema = this.createSchema();
		 const server: ApolloServer = this.createServer(schema);
		 
		 // this creates manually GraphQL subscriptions server (over ws connection)
		 this.subscriptionsService.createSubscriptionServer(server);
		 
		 const app: any = this.httpServerRef;
		 
		 const graphqlPath = '/graphql';
		 
		 server.applyMiddleware({app, path: graphqlPath});
		 
		 */
		
		log.info(
				`GraphQL playground available at ${gqlEndpoint}`
		);
	}
	
	/*
	 Creates GraphQL Apollo Server manually
	 */
	createServer(schema: GraphQLSchema): ApolloServer
	{
		return new ApolloServer({
			                        schema,
			                        context:    (ctx) => apolloContextFactory(ctx),
			                        playground: {
				                        endpoint:             gqlEndpoint,
				                        subscriptionEndpoint: subscriptionsEndpoint,
				                        settings:             {
					                        'editor.theme': 'dark'
				                        }
			                        }
		                        });
	}
	
	/*
	 Creates GraphQL Schema manually.
	 See also code in https://github.com/nestjs/graphql/blob/master/lib/graphql.module.ts how it's done by Nest
	 */
	createSchema(): GraphQLSchema | null
	{
		try
		{
			console.log(`Searching for *.graphql files`);
			
			const typesArray = fileLoader(graphqlPath);
			
			const typeDefs = mergeTypes(typesArray, { all: true });
			
			// we can save all GraphQL types into one file for later usage by other systems
			// import { writeFileSync } from 'fs';
			// writeFileSync('./all.graphql', typeDefs);
			
			return makeExecutableSchema({
				                            typeDefs,
				                            resolvers: {
					                            ...SCALARS
				                            }
			                            });
		} catch(e)
		{
			console.error(e);
		}
		
		return null;
	}
}
