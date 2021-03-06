import 'reflect-metadata';
import { Container, interfaces, ContainerModule }                 from 'inversify';
import _                                                          from 'lodash';
import { IRoutersManager, RoutersManager, RouterSymbol }          from '@pyro/io';
import { getConnection, Repository }                              from 'typeorm';
import Admin                                                      from '@modules/server.common/entities/Admin';
import Device                                                     from '@modules/server.common/entities/Device';
import {
	CarriersOrdersService,
	CarriersAuthService,
	CarriersService
}                                                                 from './carriers';
import { CommentsService }                                        from './comments';
import {
	SocialRegisterService,
	SocialStrategiesService,
	CustomersOrdersService,
	CustomersProductsService,
	CustomersService,
	UserCommandService
}                                                                 from './customers';
import { ProductsCategoriesService, ProductsService }             from './products';
import {
	WarehousesCarriersService,
	WarehousesOrdersService,
	WarehousesProductsService,
	WarehousesService,
	WarehousesAuthService,
	WarehousesCustomersService
}                                                                 from './warehouses';
import { OrdersService }                                          from './orders';
import { InvitesRequestsService, InvitesService }                 from './invites';
import {
	GeoLocationsOrdersService,
	GeoLocationsProductsService,
	GeoLocationsWarehousesService,
	GeoLocationsService
}                                                                 from './geo-locations';
import { DevicesService }                                         from './devices';
import { ServiceSymbol }                                          from './IService';
import { ConfigService }                                          from '../config/config.service';
import { ServicesApp }                                            from './services.app';
import { AuthenticationService, AuthService, authServiceFactory } from './auth';
import { CustomersAuthService }                                   from './customers/CustomersAuthService';
import { AdminsService }                                          from './admins';
import { FakeOrdersService }                                      from './fake-data/FakeOrdersService';
import { CurrenciesService }                                      from './currency/CurrencyService';
import { PromotionService }                                       from './products/PromotionService';
import { AppsSettingsService }                                    from './apps-settings';

function getRepository(t: any): any
{
	const conn = getConnection('typeorm');
	return conn.getRepository(t);
}

const bindings = new ContainerModule((bind: interfaces.Bind) =>
                                     {
	                                     bind<Repository<Admin>>('AdminRepository')
			                                     .toDynamicValue(() =>
			                                                     {
				                                                     return getRepository(Admin);
			                                                     })
			                                     .inRequestScope();
	
	                                     bind<Repository<Device>>('DeviceRepository')
			                                     .toDynamicValue(() =>
			                                                     {
				                                                     return getRepository(Device);
			                                                     })
			                                     .inRequestScope();
	
	                                     _.each(
			                                     [
				                                     ConfigService,
				                                     UserCommandService,
				                                     AdminsService,
				                                     CarriersOrdersService,
				                                     CarriersAuthService,
				                                     CarriersService,
				                                     CommentsService,
				                                     DevicesService,
				                                     GeoLocationsProductsService,
				                                     GeoLocationsWarehousesService,
				                                     GeoLocationsService,
				                                     InvitesRequestsService,
				                                     InvitesService,
				                                     OrdersService,
				                                     ProductsService,
				                                     ProductsCategoriesService,
				                                     CustomersOrdersService,
				                                     CustomersService,
				                                     CustomersAuthService,
				                                     SocialStrategiesService,
				                                     SocialRegisterService,
				                                     // TODO: Implement payment services
				                                     //StripeService,
				                                     //YooKassaService,
				                                     //PayPalService,
				                                     WarehousesOrdersService,
				                                     WarehousesProductsService,
				                                     WarehousesCustomersService,
				                                     WarehousesCarriersService,
				                                     WarehousesAuthService,
				                                     WarehousesService,
				                                     GeoLocationsOrdersService,
				                                     CustomersProductsService,
				                                     AuthenticationService,
				                                     FakeOrdersService,
				                                     CurrenciesService,
				                                     PromotionService,
				                                     AppsSettingsService
			                                     ],
			                                     (serviceIdentifier) =>
			                                     {
				                                     bind<any>(serviceIdentifier)
						                                     .to(serviceIdentifier)
						                                     .inSingletonScope();
				
				                                     bind<any>(ServiceSymbol)
						                                     .toFactory<any>((context) =>
						                                                     {
							                                                     return context.container.get<any>(serviceIdentifier);
						                                                     });
				
				                                     bind<any>(RouterSymbol)
						                                     .toFactory<any>((context) =>
						                                                     {
							                                                     return context.container.get<any>(serviceIdentifier);
						                                                     });
			                                     }
	                                     );
	
	                                     bind(AuthService).toSelf();
	
	                                     bind('Factory<AuthService>')
			                                     .toFactory(authServiceFactory);
	
	                                     bind<IRoutersManager>('RoutersManager')
			                                     .to(RoutersManager)
			                                     .inSingletonScope();
	
	                                     bind<ServicesApp>(ServicesApp)
			                                     .toSelf()
			                                     .inSingletonScope();
                                     });

const container = new Container();

container.load(bindings);

export const servicesContainer = container;
