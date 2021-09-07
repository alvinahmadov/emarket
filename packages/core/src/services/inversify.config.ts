import 'reflect-metadata';
import { Container, interfaces, ContainerModule }                 from 'inversify';
import _                                                          from 'lodash';
import { getConnection, Repository }                              from 'typeorm';
import { IRoutersManager, RoutersManager, RouterSymbol }          from '@pyro/io';
import Admin                                                      from '@modules/server.common/entities/Admin';
import Device                                                     from '@modules/server.common/entities/Device';
import IService, { ServiceSymbol }                                from './IService';
import { AuthenticationService, AuthService, authServiceFactory } from './auth';
import { AdminsService }                                          from './admins';
import { AppsSettingsService }                                    from './apps-settings';
import { CarriersOrdersService, CarriersService }                 from './carriers';
import { CurrenciesService }                                      from './currency/CurrencyService';
import {
	SocialRegisterService,
	SocialStrategiesService,
	CustomersOrdersService,
	CustomersProductsService,
	CustomersAuthService,
	CustomersService,
	UserCommandService
}                                                                 from './customers';
import { DevicesService }                                         from './devices';
import { FakeOrdersService }                                      from './fake-data/FakeOrdersService';
import {
	GeoLocationsOrdersService,
	GeoLocationsProductsService,
	GeoLocationsWarehousesService,
	GeoLocationsService
}                                                                 from './geo-locations';
import { InvitesRequestsService, InvitesService }                 from './invites';
import { OrdersService }                                          from './orders';
import { ProductsCategoriesService, ProductsService }             from './products';
import { PromotionService }                                       from './products/PromotionService';
import { ServicesApp }                                            from './services.app';
import {
	WarehousesService,
	WarehousesAuthService,
	WarehousesCarriersService,
	WarehousesOrdersService,
	WarehousesProductsService,
	WarehousesCustomersService
}                                                                 from './warehouses';
import { ConfigService }                                          from '../config/config.service';

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
				                                     CarriersService,
				                                     DevicesService,
				                                     GeoLocationsOrdersService,
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
				                                     WarehousesOrdersService,
				                                     WarehousesProductsService,
				                                     WarehousesCustomersService,
				                                     WarehousesCarriersService,
				                                     WarehousesAuthService,
				                                     WarehousesService,
				                                     CustomersProductsService,
				                                     AuthenticationService,
				                                     FakeOrdersService,
				                                     CurrenciesService,
				                                     PromotionService,
				                                     AppsSettingsService
			                                     ],
			                                     (serviceIdentifier) =>
			                                     {
				                                     bind<IService>(serviceIdentifier)
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
