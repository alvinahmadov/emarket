import {
	MiddlewareConsumer,
	Module,
	NestModule,
	OnModuleInit
}                                             from '@nestjs/common';
import { ModuleRef }                          from '@nestjs/core';
import { CommandBus, CqrsModule, EventBus }   from '@nestjs/cqrs';
import { GraphQLModule }                      from '@nestjs/graphql';
import { TypeOrmModule }                      from '@nestjs/typeorm';
import { ApolloServer, makeExecutableSchema } from 'apollo-server-express';
import Logger                                 from 'bunyan';
import { GraphQLSchema }                      from 'graphql';
import mongoose                               from 'mongoose';
import { SCALARS }                            from './graphql/scalars';
import {
	AdminsModule,
	AppsSettingsModule,
	CarriersModule,
	CarriersOrdersModule,
	CurrencyModule,
	DataModule,
	DevicesModule,
	GeoLocationsModule,
	GeoLocationMerchantsModule,
	GeoLocationOrdersModule,
	InvitesModule,
	InvitesRequestsModule,
	OrdersModule,
	ProductsModule,
	PromotionModule,
	SubscriptionsModule,
	UsersModule,
	WarehousesModule,
	WarehousesCarriersModule,
	WarehousesOrdersModule,
	WarehousesProductsModule
}                                             from './graphql/modules';
import { SubscriptionsService }               from './graphql/subscriptions/subscriptions.service';
import { AuthModule }                         from './auth/auth.module';
import { ConfigModule }                       from './config/config.module';
import { ProductModule }                      from './controllers/product/product.module';
import { TestController }                     from './controllers/test.controller';
import { GetAboutUsHandler }                  from './services/users';
import { ServicesModule }                     from './services/services.module';
import { ServicesApp }                        from './services/services.app';
import { env }                                from './env';
import { mergeTypes, loadFiles }              from './helpers/GraphQLTools';
import { createLogger }                       from './helpers/Log';

const port = env.GQLPORT;

const log: Logger = createLogger({
	                                 name: 'ApplicationModule from NestJS'
                                 });

// Add here all CQRS command handlers
export const CommandHandlers = [GetAboutUsHandler];

// Add here all CQRS event handlers
export const EventHandlers = [];

const entities = ServicesApp.getEntities();

@Module({
	        controllers: [TestController],
	        providers: [...CommandHandlers, ...EventHandlers],
	        imports: [
		        DataModule,
		        ServicesModule,
		        CqrsModule,
		        AuthModule,
		        AdminsModule,
		        AppsSettingsModule,
		        ConfigModule,
		        // configure TypeORM Connection which will be possible to use inside NestJS (e.g. resolvers)
		        TypeOrmModule.forRoot({
			                              type: 'mongodb',
			                              url: env.DB_URI,
			                              entities,
			                              synchronize: true,
			                              useNewUrlParser: true,
			                              autoReconnect: true,
			                              logging: true
		                              }),
		        // define which repositories shall be registered in the current scope (each entity will have own
		        // repository). Thanks to that we can inject the XXXXRepository to the NestJS using the
		        // @InjectRepository() decorator NOTE: this could be used inside NestJS only, not inside our services
		        TypeOrmModule.forFeature(entities),
		        SubscriptionsModule.forRoot(env.GQLPORT_SUBSCRIPTIONS),
		        GraphQLModule.forRoot({
			                              typePaths: ['./**/*.graphql'],
			                              installSubscriptionHandlers: true,
			                              debug: true,
			                              playground: true,
			                              context: ({ req, res }) => ({
				                              req
			                              })
		                              }),
		        InvitesModule,
		        DevicesModule,
		        ProductModule,
		        WarehousesModule,
		        GeoLocationsModule,
		        UsersModule,
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
				`GraphQL playground available at http://localhost:${port}/graphql`
		);
	}
	
	/*
	 Creates GraphQL Apollo Server manually
	 */
	createServer(schema: GraphQLSchema): ApolloServer
	{
		return new ApolloServer({
			                        schema,
			                        context: ({ req, res }) => ({
				                        req
			                        }),
			                        playground: {
				                        endpoint: `http://localhost:${port}/graphql`,
				                        subscriptionEndpoint: `ws://localhost:${port}/subscriptions`,
				                        settings: {
					                        'editor.theme': 'dark'
				                        }
			                        }
		                        });
	}
	
	/*
	 Creates GraphQL Schema manually.
	 See also code in https://github.com/nestjs/graphql/blob/master/lib/graphql.module.ts how it's done by Nest
	 */
	createSchema(): GraphQLSchema
	{
		const graphqlPath = './**/*.graphql';
		
		const typesArray = loadFiles(graphqlPath);
		const typeDefs = mergeTypes(typesArray);
		
		// we can save all GraphQL types into one file for later usage by other systems
		// import { writeFileSync } from 'fs';
		// writeFileSync('./all.graphql', typeDefs);
		
		return makeExecutableSchema({
			                            typeDefs,
			                            resolvers: {
				                            ...SCALARS
			                            }
		                            });
	}
}
