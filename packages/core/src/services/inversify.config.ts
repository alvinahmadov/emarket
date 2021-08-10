import 'reflect-metadata';
import { Container, interfaces, ContainerModule }                 from 'inversify';
import _                                                          from 'lodash';
import { getConnection, Repository }                              from 'typeorm';
import { IRoutersManager, RoutersManager, RouterSymbol }          from '@pyro/io';
import Admin                                                      from '@modules/server.common/entities/Admin';
import Device                                                     from '@modules/server.common/entities/Device';
import { AdminsService }                                          from './admins';
import { AppsSettingsService }                                    from './apps-settings';
import { AuthenticationService, AuthService, authServiceFactory } from './auth';
import { DevicesService }                                         from './devices';
import { FakeOrdersService }                                      from './fake-data/FakeOrdersService';
import { CarriersOrdersService, CarriersService }                 from './carriers';
import { CurrenciesService }                                      from './currency/CurrencyService';
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
	SocialRegisterService,
	SocialStrategiesService,
	UsersOrdersService,
	UsersProductsService,
	UsersService,
	UserCommandService
}                                                                 from './users';
import { UsersAuthService }                                       from './users/UsersAuthService';
import {
	WarehousesAuthService,
	WarehousesCarriersService,
	WarehousesOrdersService,
	WarehousesProductsService,
	WarehousesService,
	WarehousesUsersService
}                                                                 from './warehouses';
import { ServiceSymbol }                                          from './IService';
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
				                                     UsersOrdersService,
				                                     UsersService,
				                                     UsersAuthService,
				                                     SocialStrategiesService,
				                                     SocialRegisterService,
				                                     WarehousesOrdersService,
				                                     WarehousesProductsService,
				                                     WarehousesUsersService,
				                                     WarehousesCarriersService,
				                                     WarehousesAuthService,
				                                     WarehousesService,
				                                     UsersProductsService,
				                                     AuthenticationService,
				                                     FakeOrdersService,
				                                     CurrenciesService,
				                                     PromotionService,
				                                     AppsSettingsService
			                                     ],
			                                     (Service: any) =>
			                                     {
				                                     bind(Service).to(Service).inSingletonScope();
				
				                                     bind<any>(ServiceSymbol).toFactory<any>((context) =>
				                                                                             {
					                                                                             return context.container.get<any>(Service);
				                                                                             });
				
				                                     bind<any>(RouterSymbol).toFactory<any>((context) =>
				                                                                            {
					                                                                            return context.container.get<any>(Service);
				                                                                            });
			                                     }
	                                     );
	
	                                     bind(AuthService).toSelf();
	
	                                     bind('Factory<AuthService>').toFactory(authServiceFactory);
	
	                                     bind<IRoutersManager>('RoutersManager')
			                                     .to(RoutersManager)
			                                     .inSingletonScope();
	
	                                     bind<ServicesApp>(ServicesApp).toSelf().inSingletonScope();
                                     });

const container = new Container();

container.load(bindings);

export const servicesContainer = container;
