import faker                          from 'faker';
import { Injectable }                 from '@angular/core';
import Country                        from '@modules/server.common/enums/Country';
import IEnterByCode                   from '@modules/server.common/interfaces/IEnterByCode';
import Invite                         from '@modules/server.common/entities/Invite';
import { ICustomerRegistrationInput } from '@modules/server.common/routers/ICustomerAuthRouter';
import { environment }                from 'environments/environment';

@Injectable()
export default class FakeDataUsers
{
	getUserRegistrationInput(): ICustomerRegistrationInput
	{
		const firstName = faker.name.firstName();
		const lastName = faker.name.lastName();
		
		return {
			user:     {
				username:    faker.internet.userName(firstName, lastName),
				email:       faker.internet.email(),
				firstName:   firstName,
				lastName:    lastName,
				phone:       faker.phone.phoneNumber(),
				avatar:      faker.image.avatar(),
				apartment:   faker.random.number(199).toString(),
				geoLocation: {
					countryId:     faker.random.number(200) as Country,
					city:          faker.address.city(),
					postcode:      faker.address.zipCode(),
					notes:         faker.lorem.text(1),
					streetAddress: faker.address.streetAddress(),
					house:         faker.random.number(199).toString(),
					loc:           {
						type:        'Point',
						coordinates: [
							environment.DEFAULT_LONGITUDE,
							environment.DEFAULT_LATITUDE,
						],
					},
				},
				isBanned:    Math.random() < 0.01,
			},
			password: '123456',
		};
	}
	
	getEnterByCodeToken1(invite: Invite): IEnterByCode
	{
		return {
			location:   invite.geoLocation.loc,
			inviteCode: invite.code,
			firstName:  faker.name.firstName(),
			lastName:   faker.name.lastName(),
		};
	}
}
