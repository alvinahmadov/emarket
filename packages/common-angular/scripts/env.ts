import { cleanEnv, num, str, bool } from 'envalid';

export type Env = Readonly<{
	production: boolean;
	
	DEFAULT_LANGUAGE: string;
	AVAILABLE_LOCALES: string;
	
	DEFAULT_COORDINATES?: boolean;
	DEFAULT_LATITUDE: number;
	DEFAULT_LONGITUDE: number;
	
	AUTH_LOGO: string;
	NO_INTERNET_LOGO: string;
	
	COMPANY_NAME: string;
	COMPANY_SITE_LINK: string
	COMPANY_FACEBOOK_LINK: string;
	COMPANY_VKONTAKTE_LINK: string;
	COMPANY_TWITTER_LINK: string;
	COMPANY_LINKEDIN_LINK: string;
	
	CURRENCY_SYMBOL: string;
	
	LOG_LEVEL: string;
}>;

export const env: Env = cleanEnv(
		process.env,
		{
			production: bool({ default: false }),
			
			LOG_LEVEL: str({
				               choices: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
				               default: 'error'
			               }),
			
			DEFAULT_LANGUAGE:  str({ default: 'ru-RU' }),
			AVAILABLE_LOCALES: str({ default: 'en-US|ru-RU' }),
			
			DEFAULT_COORDINATES: bool({ default: false }),
			DEFAULT_LATITUDE:    num({ default: 37.6156 }),
			DEFAULT_LONGITUDE:   num({ default: 55.7522 }),
			
			COMPANY_NAME:           str({ default: 'Market' }),
			COMPANY_SITE_LINK:      str({ default: 'http://localhost' }),
			COMPANY_VKONTAKTE_LINK: str({ default: 'https://www.vk.com' }),
			COMPANY_FACEBOOK_LINK:  str({ default: 'https://www.facebook.com' }),
			COMPANY_TWITTER_LINK:   str({ default: 'https://twitter.com' }),
			COMPANY_LINKEDIN_LINK:  str({ default: 'https://www.linkedin.com' }),
			
			CURRENCY_SYMBOL: str({ default: '₽' }),
			
			AUTH_LOGO:        str({ default: 'assets/img/logo.svg' }),
			NO_INTERNET_LOGO: str({ default: 'assets/img/ni-logo.svg' }),
		},
		{ strict: true, dotEnvPath: '/../../.env' }
);
