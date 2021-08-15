import _                          from "lodash";
import { injectable }             from "inversify";
import faker                      from "faker";
import { IUserCreateObject }      from "@modules/server.common/interfaces/IUser";
import {
	IGeoLocationCreateObject,
	IGeolocationUpdateObject
}                                 from "@modules/server.common/interfaces/IGeoLocation";
import User                       from '@modules/server.common/entities/User';
import GeoLocation, { Country }   from "@modules/server.common/entities/GeoLocation";
import { IUserRegistrationInput } from '@modules/server.common/routers/IUserAuthRouter';
import CommonUtils                from "@modules/server.common/utilities/common";
import { env }                    from "../../env";
import {
	UsersAuthService,
	UsersService
}                                 from "../users";

type UserGenerationInput = {
	email?: string;
	password?: string;
	coordinates?: [number, number];
	firstName?: string;
	lastName?: string;
}

@injectable()
export class FakeUsersService
{
	constructor(
			private readonly _usersService: UsersService,
			private readonly _usersAuthService: UsersAuthService
	)
	{}
	
	/**
	 * Generates user record, predefined in config
	 *
	 * @returns {Promise<User>}
	 * @memberof FakeUsersService
	 */
	async generatePredefinedUser(): Promise<User>
	{
		return this._generateUser({
			                          email: env.FAKE_EMAIL,
			                          password: env.FAKE_PASSWORD,
			                          coordinates: [55.7522, 37.6156]
		                          });
	}
	
	/**
	 * Generates random user record
	 *
	 * @returns {Promise<User>}
	 * @memberof FakeUsersService
	 */
	async generateRandomUser(): Promise<User>
	{
		return this._generateUser({ password: env.FAKE_PASSWORD });
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
	): Promise<IUserCreateObject[]>
	{
		const existingEmails = _.map(
				await this._usersService
				          .Model
				          .find({})
				          .select({ email: 1 })
				          .lean()
				          .exec(),
				u => u.email
		);
		
		const customersToCreate: IUserCreateObject[] = [];
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
				countryId: faker.random.number(Country.ZW) as Country,
				city: faker.address.city(),
				house: `${customerCount}`,
				loc: {
					type: 'Point',
					coordinates: [defaultLng, defaultLat]
				},
				streetAddress: faker.address.streetAddress()
			};
			
			if(!existingEmails.includes(email))
			{
				existingEmails.push(email);
				
				customersToCreate.push({
					                       firstName: faker.name.firstName(),
					                       lastName: faker.name.lastName(),
					                       geoLocation,
					                       apartment: `${customerCount}`,
					                       email,
					                       isBanned,
					                       image: faker.image.avatar(),
					                       phone: faker.phone.phoneNumber(),
					                       _createdAt: faker.date.between(
							                       customerCreatedFrom,
							                       customerCreatedTo
					                       )
				                       } as any);
				
				customerCount += 1;
			}
		}
		
		return this._usersService
		           .Model
		           .insertMany(customersToCreate);
	}
	
	private async _generateUser(input: UserGenerationInput)
	{
		const firstName = input.firstName ?? faker.name.firstName();
		const lastName = input.firstName ?? faker.name.lastName();
		const password = input.password ?? faker.internet.password(8);
		const coordinates = input.coordinates ?? [
			parseFloat(faker.address.longitude()),
			parseFloat(faker.address.latitude())
		];
		const email = input.email ?? faker.internet.email(firstName, lastName);
		const phone = faker.phone.phoneNumber("+7##########");
		const geoLocation: IGeolocationUpdateObject = {
			countryId: Country.RU,
			city: faker.address.city(),
			house: `0`,
			loc: {
				type: 'Point',
				coordinates: coordinates
			},
			postcode: faker.address.zipCode(),
			streetAddress: faker.address.streetAddress()
		};
		
		const existingUser = await this._usersService
		                               .Model
		                               .findOne({ email: email });
		
		if(!existingUser)
		{
			let user = await this._usersService
			                     .initUser({
				                               firstName: firstName,
				                               lastName: lastName,
				                               email: email,
				                               phone: phone,
				                               image: CommonUtils.getDummyImage(
						                               300, 300,
						                               firstName.slice(0, 2)
				                               ),
				                               isRegistrationCompleted: true,
				                               isBanned: false
			                               });
			
			await this._usersService
			          .updateGeoLocation(
					          user.id,
					          geoLocation as GeoLocation
			          );
			
			if(!user)
			{
				console.warn("Test user cannot be created");
			}
			
			let input: IUserRegistrationInput = {
				user: user,
				password: password
			}
			
			return this._usersAuthService.register(input);
		}
	}
}
