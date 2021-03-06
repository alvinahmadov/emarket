// NOTE: do NOT ever put here any secure settings! (e.g. Secret Keys)
// We are using dotenv (.env) for consistency with other Platform projects
// This is Angular app and all settings will be loaded into the client browser!

import { cleanEnv, num, str, bool } from 'envalid';

export type Env = Readonly<{
	production: boolean;
	
	HTTP_SERVICES_ENDPOINT: string;
	HTTPS_SERVICES_ENDPOINT: string;
	GQL_ENDPOINT: string;
	GQL_SUBSCRIPTIONS_ENDPOINT: string;
	
	GOOGLE_MAPS_API_KEY: string;
	YANDEX_MAPS_API_KEY: string;
	
	TALKJS_APP_ID: string;
	
	JWT_EXPIRES_MAX: string;
	JWT_EXPIRES_MIN: string;
	
	DEFAULT_LATITUDE: number;
	DEFAULT_LONGITUDE: number;
	
	NO_INTERNET_LOGO: string;
	
	MAP_MERCHANT_ICON_LINK: string;
	
	MAP_USER_ICON_LINK: string;
	
	MAP_CARRIER_ICON_LINK: string;
	
	CLOUDINARY_SIGNED_UPLOAD_PRESET: string;
	CLOUDINARY_UNSIGNED_UPLOAD_PRESET: string;
	CLOUDINARY_UPLOAD_URL: string;
	
	COMPANY_NAME: string;
	COMPANY_SITE_LINK: string;
	COMPANY_GITHUB_LINK: string;
	COMPANY_FACEBOOK_LINK: string;
	COMPANY_TWITTER_LINK: string;
	COMPANY_LINKEDIN_LINK: string;
	
	GENERATE_PASSWORD_CHARSET: string;
	
	CURRENCY_SYMBOL: string;
	
	FAKE_CUSTOMERS_COUNT: number;
	
	SETTINGS_APP_TYPE?: string;
	SETTINGS_MAINTENANCE_API_URL?: string;
	
	DEFAULT_LANGUAGE: string;
	AVAILABLE_LOCALES: string;
	
	WEB_CONCURRENCY: number;
	WEB_MEMORY: number;
	HOST: string;
	PORT: number;
}>;

export const env: Env = cleanEnv(
		process.env,
		{
			production: bool({ default: true }),
			
			HTTP_SERVICES_ENDPOINT:     str({ default: 'http://localhost:5500' }),
			HTTPS_SERVICES_ENDPOINT:    str({ default: 'https://localhost:5501' }),
			GQL_ENDPOINT:               str({ default: 'http://localhost:5555/graphql' }),
			GQL_SUBSCRIPTIONS_ENDPOINT: str({
				                                default: 'ws://localhost:5050/subscriptions',
			                                }),
			
			GOOGLE_MAPS_API_KEY: str({ default: '' }),
			YANDEX_MAPS_API_KEY: str({ default: '' }),
			
			TALKJS_APP_ID: str({ default: '' }),
			
			JWT_EXPIRES_MAX: str({ default: '14d' }),
			JWT_EXPIRES_MIN: str({ default: '2d' }),
			
			DEFAULT_LATITUDE:  num({ default: 37.642036 }),
			DEFAULT_LONGITUDE: num({ default: 55.708215 }),
			
			NO_INTERNET_LOGO: str({ default: '' }),
			
			MAP_MERCHANT_ICON_LINK: str({
				                            default: 'https://maps.google.com/mapfiles/kml/pal3/icon21.png',
			                            }),
			
			MAP_USER_ICON_LINK: str({
				                        default: 'https://maps.google.com/mapfiles/kml/pal3/icon48.png',
			                        }),
			
			MAP_CARRIER_ICON_LINK: str({
				                           default: 'https://maps.google.com/mapfiles/kml/pal4/icon54.png',
			                           }),
			
			CLOUDINARY_UPLOAD_URL:             str({ default: '' }),
			CLOUDINARY_SIGNED_UPLOAD_PRESET:   str({ default: '' }),
			CLOUDINARY_UNSIGNED_UPLOAD_PRESET: str({ default: '' }),
			
			COMPANY_NAME:          str({ default: 'Company' }),
			COMPANY_SITE_LINK:     str({ default: 'https://localhost:4200/' }),
			COMPANY_GITHUB_LINK:   str({ default: 'https://github.com' }),
			COMPANY_FACEBOOK_LINK: str({
				                           default: 'https://www.facebook.com',
			                           }),
			COMPANY_TWITTER_LINK:  str({ default: 'https://twitter.com' }),
			COMPANY_LINKEDIN_LINK: str({
				                           default: 'https://www.linkedin.com.',
			                           }),
			
			GENERATE_PASSWORD_CHARSET: str({
				                               default:
						                               'abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$_',
			                               }),
			
			CURRENCY_SYMBOL: str({ default: '???' }),
			
			FAKE_CUSTOMERS_COUNT: num({ default: 1000 }),
			
			// For maintenance micro service.
			SETTINGS_APP_TYPE:            str({ default: 'admin' }),
			SETTINGS_MAINTENANCE_API_URL: str({
				                                  default: '',
			                                  }),
			
			DEFAULT_LANGUAGE:  str({ default: 'ru-RU' }),
			AVAILABLE_LOCALES: str({ default: 'en-US|ru-RU' }),
			
			WEB_CONCURRENCY: num({ default: 1 }),
			WEB_MEMORY:      num({ default: 4096 }),
			
			HOST: str({ default: 'localhost' }),
			PORT: num({ default: 4200 }),
		},
		{ strict: true, dotEnvPath: __dirname + '/../.env' }
);
