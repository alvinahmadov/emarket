import passport, { Profile }             from 'passport';
import { Strategy as GoogleStrategy }    from 'passport-google-oauth20';
import { Strategy as FacebookStrategy }  from 'passport-facebook';
import { Strategy as VkontakteStrategy } from 'passport-vkontakte';
import { Strategy as YandexStrategy }    from 'passport-yandex';
import { inject, injectable }            from 'inversify';
import { routerName }                    from '@pyro/io';
import OAuthStrategy                     from '@modules/server.common/enums/OAuthStrategy';
import { SocialRegisterService }         from './SocialRegisterService';
import IService                          from '../IService';
import { env }                           from '../../env';

@injectable()
@routerName('social-strategies-service')
export class SocialStrategiesService implements IService
{
	constructor(
			@inject(SocialRegisterService)
			protected socialRegister: SocialRegisterService
	)
	{}
	
	public getStrategy(oauthType: OAuthStrategy): passport.Strategy | null
	{
		switch(oauthType)
		{
			case OAuthStrategy.YANDEX:
				return this.getYandex();
			case OAuthStrategy.GOOGLE:
				return this.getGoogle();
			case OAuthStrategy.FACEBOOK:
				return this.getFacebook();
				// @ts-ignore
			case OAuthStrategy.VKONTAKTE:
				return this.getVkontakte();
		}
		return null;
	}
	
	private getYandex(): YandexStrategy<any> | null
	{
		if(!this._check(OAuthStrategy.YANDEX))
		{
			return null;
		}
		
		return new YandexStrategy(
				{
					clientID:     env.YANDEX_APP_ID,
					clientSecret: env.YANDEX_APP_SECRET,
					callbackURL:  env.SERVICES_ENDPOINT + env.YANDEX_APP_CALLBACK
				},
				async(accessToken, refreshToken, profile, done) =>
				{
					let displayName = profile.displayName ?? profile.username
					
					if(!displayName)
					{
						displayName = profile.emails[0].value.split('@')[0];
					}
					
					let newProfile: Profile = {
						...profile,
						displayName: displayName
					}
					
					const { redirectUrl } =
							      await this.socialRegister
							                .register(
									                newProfile
							                );
					
					return done(null, { redirectUrl });
				}
		);
	}
	
	private getGoogle(): GoogleStrategy | null
	{
		if(!this._check(OAuthStrategy.GOOGLE))
		{
			return null;
		}
		
		return new GoogleStrategy(
				{
					clientID:     env.GOOGLE_APP_ID,
					clientSecret: env.GOOGLE_APP_SECRET,
					callbackURL:  env.GOOGLE_APP_CALLBACK
				},
				async(accessToken, refreshToken, profile, done) =>
				{
					const { redirectUrl } = await this.socialRegister.register(
							profile
					);
					
					done(null, { redirectUrl });
				}
		);
	}
	
	private getFacebook(): FacebookStrategy | null
	{
		if(!this._check(OAuthStrategy.FACEBOOK))
		{
			return null;
		}
		
		return new FacebookStrategy(
				{
					clientID:      env.FACEBOOK_APP_ID,
					clientSecret:  env.FACEBOOK_APP_SECRET,
					callbackURL:   env.SERVICES_ENDPOINT + env.FACEBOOK_APP_CALLBACK,
					profileFields: [
						'id',
						'displayName',
						'picture',
						'email',
						'gender'
					],
				},
				async(accessToken, refreshToken, profile, done) =>
				{
					const { redirectUrl } = await this.socialRegister.register(
							profile
					);
					done(null, { redirectUrl });
				}
		);
	}
	
	private getVkontakte(): VkontakteStrategy | null
	{
		// @ts-ignore
		if(!this._check(OAuthStrategy.VKONTAKTE))
		{
			return null;
		}
		
		return new VkontakteStrategy(
				{
					clientID:      env.FACEBOOK_APP_ID,
					clientSecret:  env.FACEBOOK_APP_SECRET,
					callbackURL:   env.SERVICES_ENDPOINT + env.FACEBOOK_APP_CALLBACK,
					profileFields: [
						'id',
						'nickname',
						'photo',
						'email'
					],
					lang:          'ru-RU'
				},
				async(accessToken, refreshToken, profile, done) =>
				{
					const { redirectUrl } = await this.socialRegister.register(
							profile
					);
					done(null, { redirectUrl });
				}
		);
	}
	
	private _check = (oauthType: OAuthStrategy): boolean =>
	{
		let id, secret;
		
		switch(oauthType)
		{
			case OAuthStrategy.YANDEX:
				id = env.YANDEX_APP_ID;
				secret = env.YANDEX_APP_SECRET;
				break;
			case OAuthStrategy.GOOGLE:
				id = env.GOOGLE_APP_ID;
				secret = env.GOOGLE_APP_SECRET;
				break;
			case OAuthStrategy.FACEBOOK:
				id = env.FACEBOOK_APP_ID;
				secret = env.FACEBOOK_APP_SECRET;
				break;
				// @ts-ignore
			case OAuthStrategy.VKONTAKTE:
				id = env.VKONTAKTE_APP_ID;
				secret = env.VKONTAKTE_APP_SECRET;
				break;
			default:
				return false;
		}
		
		if(id.length > 0 && secret.length > 0)
		{
			return true
		}
		else
		{
			if(!env.isProd)
			{
				console.warn(
						`Warning: ${oauthType} OAuth disabled because no details provided in the settings/environment`
				);
			}
			return false;
		}
	};
}
