import { injectable }                     from "inversify";
import { env }                            from "../../env";
import faker                              from "faker";
import User                               from '@modules/server.common/entities/User';
import Warehouse                          from '@modules/server.common/entities/Warehouse';
import GeoLocation, { Country }           from "@modules/server.common/entities/GeoLocation";
import {
	IGeoLocationCreateObject,
	IGeolocationUpdateObject
}                                         from "@modules/server.common/interfaces/IGeoLocation";
import { IUserRegistrationInput }         from '@modules/server.common/routers/IUserAuthRouter';
import { getDummyImage }                  from "@modules/server.common/utils";
import { IWarehouseCreateObject }         from "@modules/server.common/interfaces/IWarehouse";
import ForwardOrdersMethod                from "@modules/server.common/enums/ForwardOrdersMethod";
import { UsersService, UsersAuthService } from "../users";
import { WarehousesService }              from "../warehouses";
import bcrypt                             from 'bcryptjs';

@injectable()
export class FakeRegisterService
{
	static async getPredefinedUser(
			usersService: UsersService,
			usersAuthService: UsersAuthService
	): Promise<User>
	{
		return FakeRegisterService._getUser(usersService, usersAuthService, false);
	}
	
	static async getRandomUser(
			usersService: UsersService,
			usersAuthService: UsersAuthService
	): Promise<User>
	{
		return FakeRegisterService._getUser(usersService, usersAuthService, true);
	}
	
	static async getWarehouse(
			usersService: UsersService,
			warehousesService: WarehousesService
	): Promise<Warehouse>
	{
		const username = env.FAKE_USERNAME;
		const password = env.FAKE_USERPASSWORD;
		const mail = env.FAKE_USER_MAIL;
		const warehouseName = faker.company.companyName();
		
		const existingUser = await usersService
				.Model
				.findOne({ email: mail });
		
		const defaultLng = 55.7522;
		const defaultLat = 37.6156;
		const geoLocation: IGeoLocationCreateObject = {
			countryId: Country.RU,
			city: faker.address.city(Country.RU),
			house: `0`,
			loc: {
				type: 'Point',
				coordinates: [defaultLng, defaultLat]
			},
			postcode: faker.address.zipCode("####"),
			streetAddress: faker.address.streetAddress()
		};
		
		const existingWarehouse = await warehousesService
				.Model
				.findOne({ username: username });
		
		const salt = await bcrypt.genSalt(
				env.WAREHOUSE_PASSWORD_BCRYPT_SALT_ROUNDS
		);
		
		const hash = await bcrypt.hash(password, salt)
		
		if(!existingWarehouse)
		{
			let warehouseCreateObj: IWarehouseCreateObject = {
				username: username,
				name: warehouseName,
				isActive: true,
				hash: hash,
				inStoreMode: true,
				contactEmail: existingUser.email,
				contactPhone: existingUser.phone,
				geoLocation: geoLocation,
				logo: "https://raw.githubusercontent.com/igorbezsmertnyi/angular-2-rails-starterkit/master/src/logo.png",
				ordersEmail: null,
				ordersPhone: null,
				forwardOrdersUsing: [
					ForwardOrdersMethod.Email,
					ForwardOrdersMethod.Phone
				]
			}
			
			// init
			let warehouse = await warehousesService.create(warehouseCreateObj);
			
			// register
			return warehousesService.register({
				                                  warehouse: warehouse,
				                                  password: password
			                                  })
			
		}
	}
	
	private static async _getUser(
			usersService: UsersService,
			usersAuthService: UsersAuthService,
			random: boolean
	)
	{
		const firstName = faker.name.firstName();
		const lastName = faker.name.lastName();
		const email = random
		              ? faker.internet.email(firstName, lastName)
		              : env.FAKE_USER_MAIL;
		
		const password = env.FAKE_USERPASSWORD;
		const phone = faker.phone.phoneNumber("+7##########");
		const defaultLng = random
		                   ? parseFloat(faker.address.longitude())
		                   : 55.7522;
		
		const defaultLat = random
		                   ? parseFloat(faker.address.latitude())
		                   : 37.6156;
		
		const geoLocation: IGeolocationUpdateObject = {
			countryId: Country.RU,
			city: faker.address.city(),
			house: `0`,
			loc: {
				type: 'Point',
				coordinates: [defaultLng, defaultLat]
			},
			postcode: faker.address.zipCode("####"),
			streetAddress: faker.address.streetAddress()
		};
		
		const existingUser = await usersService
				.Model
				.findOne({ email: email });
		
		if(!existingUser)
		{
			let user = await usersService.initUser({
				                                       firstName: firstName,
				                                       lastName: lastName,
				                                       email: email,
				                                       phone: phone,
				                                       image: getDummyImage(300, 300, firstName.slice(0, 2)),
				                                       isRegistrationCompleted: true,
				                                       isBanned: false
			                                       });
			await usersService.updateGeoLocation(user.id, geoLocation as GeoLocation);
			
			if(!user)
			{
				alert("Test user cannot be created");
			}
			
			let input: IUserRegistrationInput = {
				user: user,
				password: password
			}
			
			return usersAuthService.register(input);
		}
	}
}
