import _                         from 'lodash';
import { injectable }            from 'inversify';
import faker                     from 'faker';
import { ICustomerCreateObject } from '@modules/server.common/interfaces/ICustomer';
import {
	IGeoLocationCreateObject
}                                from '@modules/server.common/interfaces/IGeoLocation';
import Role                      from '@modules/server.common/enums/Role';
import Country                   from '@modules/server.common/enums/Country';
import Customer                  from '@modules/server.common/entities/Customer';
import GeoLocation               from '@modules/server.common/entities/GeoLocation';
import CommonUtils               from '@modules/server.common/utilities/common';
import { CustomersService }      from '../customers';
import { CustomersAuthService }  from '../customers/CustomersAuthService';

export type TUserGenerationInput = {
	username: string;
	email: string;
	coordinates?: [number, number];
	role?: Role;
	firstName?: string;
	lastName?: string;
}

@injectable()
export class FakeUsersService
{
	constructor(
			private readonly _customersService: CustomersService,
			private readonly _usersAuthService: CustomersAuthService
	)
	{}
	
	/**
	 * Generates user record, predefined in config
	 *
	 * @returns {Promise<Customer>}
	 * @memberof FakeUsersService
	 */
	async generateMerchant(input: TUserGenerationInput, password: string): Promise<Customer>
	{
		const existingUser = await this._customersService.findOne({ email: input.email });
		
		if(existingUser && existingUser.role === 'merchant')
		{
			return existingUser;
		}
		
		return this._generateUser({
			                          username:    input.username,
			                          email:       input.email,
			                          coordinates: input.coordinates,
			                          role:        'merchant',
		                          },
		                          password);
	}
	
	/**
	 * Generates random user record
	 *
	 * @returns {Promise<User>}
	 * @memberof FakeUsersService
	 */
	async generateRandomUser(): Promise<Customer>
	{
		const firstName = faker.name.firstName();
		const lastName = faker.name.lastName();
		const username = faker.internet.userName(firstName, lastName);
		const password = '123456';
		const coordinates: [number, number] = [
			parseFloat(faker.address.longitude()),
			parseFloat(faker.address.latitude())
		];
		const email = faker.internet.email(firstName, lastName);
		
		const input: TUserGenerationInput = {
			username:    username,
			email:       email,
			role:        'customer',
			coordinates: coordinates,
			firstName:   firstName,
			lastName:    lastName,
		}
		
		return this._generateUser(input, password);
	}
	
	/**
	 * Generates Fake Customer records
	 *
	 * @param {number} qty Quantity of customers to generate
	 * @param {number} defaultLng Default longitude
	 * @param {number} defaultLat Default latitude
	 * @returns {Promise<IUserCreateObject[]>}
	 * @memberof FakeUsersService
	 */
	async generateCustomers(
			qty: number,
			defaultLng: number,
			defaultLat: number
	): Promise<ICustomerCreateObject[]>
	{
		const existingEmails = _.map(
				await this._customersService
				          .Model
				          .find({})
				          .select({ email: 1 })
				          .lean()
				          .exec(),
				u => u.email
		);
		
		const customersToCreate: ICustomerCreateObject[] = [];
		const customerCreatedFrom = new Date(2015, 1);
		const customerCreatedTo = new Date();
		
		let customerCount = 1;
		
		while(customerCount <= qty)
		{
			const firstName = faker.name.firstName();
			const lastName = faker.name.lastName();
			const email = faker.internet.email(firstName, lastName);
			const isBanned = Math.random() < 0.02;
			
			const geoLocation: IGeoLocationCreateObject = {
				countryId:     faker.random.number(Country.ZW) as Country,
				city:          faker.address.city(),
				house:         `${customerCount}`,
				loc:           {
					type:        'Point',
					coordinates: [defaultLng, defaultLat]
				},
				streetAddress: faker.address.streetAddress()
			};
			
			if(!existingEmails.includes(email))
			{
				existingEmails.push(email);
				
				customersToCreate.push({
					                       firstName:  faker.name.firstName(),
					                       lastName:   faker.name.lastName(),
					                       geoLocation,
					                       apartment:  `${customerCount}`,
					                       email,
					                       isBanned,
					                       image:      faker.image.avatar(),
					                       phone:      faker.phone.phoneNumber(),
					                       _createdAt: faker.date.between(
							                       customerCreatedFrom,
							                       customerCreatedTo
					                       )
				                       } as any);
				
				customerCount += 1;
			}
		}
		
		return this._customersService
		           .Model
		           .insertMany(customersToCreate);
	}
	
	private async _generateUser(input: TUserGenerationInput, password: string): Promise<Customer | null>
	{
		let role: Role = input.role !== "merchant"
		                 ? "customer"
		                 : input.role;
		
		const coordinates = input.coordinates
		                    ?? [
					parseFloat(faker.address.longitude()),
					parseFloat(faker.address.latitude())
				];
		const firstName = input.firstName ?? faker.name.firstName(1);
		const lastName = input.lastName ?? faker.name.lastName(1);
		
		const phone = faker.phone.phoneNumber("+7##########");
		const geoLocation: IGeoLocationCreateObject = {
			countryId:     Country.RU,
			city:          faker.address.city(),
			house:         "0",
			loc:           {
				type:        'Point',
				coordinates: coordinates
			},
			postcode:      faker.address.zipCode(),
			streetAddress: faker.address.streetAddress()
		};
		
		const avatar = CommonUtils.getDummyImage(300, 300, `${firstName[0]}${lastName[0]}`);
		
		const customer = await this._customersService
		                           .initCustomer(
				                           {
					                           username:                input.username,
					                           email:                   input.email,
					                           firstName:               firstName,
					                           lastName:                lastName,
					                           phone:                   phone,
					                           avatar:                  avatar,
					                           role:                    role,
					                           isRegistrationCompleted: true,
					                           isBanned:                false
				                           }
		                           );
		
		if(!customer)
		{
			return null;
		}
		
		await this._customersService
		          .updateGeoLocation(customer.id, geoLocation as GeoLocation);
		
		return this._usersAuthService.register({
			                                       user:     customer,
			                                       password: password
		                                       });
	}
}
