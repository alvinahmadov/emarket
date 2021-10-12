import { inject, injectable } from 'inversify';
import { Profile }            from 'passport';
import { routerName }         from '@pyro/io';
import { CustomersService }   from './CustomersService';
import IService               from '../IService';

@injectable()
@routerName('social-register-service')
export class SocialRegisterService implements IService
{
	constructor(
			@inject(CustomersService)
			protected usersService: CustomersService
	)
	{}
	
	async register(profileInfo: Profile): Promise<{ redirectUrl: string }>
	{
		const socialId = profileInfo.id;
		
		const currentUser = await this.usersService.getSocial(socialId);
		
		let redirectUrl: string;
		
		// User exists, so login
		if(currentUser)
		{
			currentUser.isRegistrationCompleted
			? (redirectUrl = 'login/socie/' + currentUser['_id'])
			: (redirectUrl = 'login/byLocation/' + currentUser['_id']);
		}
		else // create new user by social authentication
		{
			const [firstname, lastname] = profileInfo.displayName.split(' ');
			
			const username = profileInfo.username ?? firstname;
			const email = profileInfo.emails[0].value;
			
			const newUser = await this.usersService
			                          .initCustomer({
				                                        username:                username,
				                                        email:                   email,
				                                        firstName:               firstname,
				                                        lastName:                lastname,
				                                        socialIds:               [socialId],
				                                        isRegistrationCompleted: false
			                                        });
			
			redirectUrl = 'login/byLocation/' + newUser['_id'];
		}
		
		return { redirectUrl };
	}
}
