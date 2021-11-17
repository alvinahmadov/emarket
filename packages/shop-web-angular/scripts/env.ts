// NOTE: do NOT ever put here any secure settings! (e.g. Secret Keys)
// We are using dotenv (.env) for consistency with other Platform projects
// This is Angular app and all settings will be loaded into the client browser!

import { cleanEnv, num, str, bool } from 'envalid';

export interface Environment
{
	production: boolean;
	
	TIME_ZONE: string;
	DATETIME_FORMAT: string;
	
	HTTP_SERVICES_ENDPOINT: string;
	HTTPS_SERVICES_ENDPOINT: string;
	GQL_ENDPOINT: string;
	GQL_SUBSCRIPTIONS_ENDPOINT: string;
	
	JWT_EXPIRES_MAX: string;
	JWT_EXPIRES_MIN: string;
	
	DEFAULT_COORDINATES: boolean;
	DEFAULT_LATITUDE: number;
	DEFAULT_LONGITUDE: number;
	
	DEFAULT_LANGUAGE: string;
	AVAILABLE_LOCALES: string;
	
	AUTH_LOGO: string;
	NO_INTERNET_LOGO: string;
	
	CARRIER_ICON: string;
	CUSTOMER_ICON: string;
	STORE_ICON: string;
	
	DELIVERY_TIME_MIN: number;
	DELIVERY_TIME_MAX: number;
	
	GOOGLE_APP_URL: string;
	YANDEX_APP_URL: string;
	FACEBOOK_APP_URL: string;
	VKONTAKTE_APP_URL: string;
	
	GOOGLE_MAPS_API_KEY: string;
	YANDEX_MAPS_API_KEY: string;
	
	TALKJS_APP_ID: string;
	
	SETTINGS_APP_TYPE?: string;
	SETTINGS_MAINTENANCE_API_URL?: string;
	
	WEB_CONCURRENCY?: number;
	WEB_MEMORY?: number;
	
	HOST: string;
	PORT: number;
}

export type Env = Readonly<Environment>;

export const env: Env = cleanEnv(
		process.env,
		{
			production: bool({ default: false }),
			
			TIME_ZONE:       str({ default: 'Europe/Moscow' }),
			DATETIME_FORMAT: str({ default: 'dd/MM/yyyy HH:mm' }),
			
			HTTP_SERVICES_ENDPOINT:     str({ default: 'http://localhost:5500' }),
			HTTPS_SERVICES_ENDPOINT:    str({ default: 'https://localhost:5501' }),
			GQL_ENDPOINT:               str({ default: 'http://localhost:5555/graphql' }),
			GQL_SUBSCRIPTIONS_ENDPOINT: str({
				                                default: 'ws://localhost:5050/subscriptions',
			                                }),
			
			JWT_EXPIRES_MAX: str({ default: '14d' }),
			JWT_EXPIRES_MIN: str({ default: '2d' }),
			
			DEFAULT_COORDINATES: bool({ default: false }),
			DEFAULT_LATITUDE:    num({ default: 37.6156 }),
			DEFAULT_LONGITUDE:   num({ default: 55.7522 }),
			
			DEFAULT_LANGUAGE:  str({ default: 'ru-RU' }),
			AVAILABLE_LOCALES: str({ default: 'en-US|ru-RU' }),
			
			AUTH_LOGO:        str({ default: 'assets/img/logo.svg' }),
			NO_INTERNET_LOGO: str({ default: 'assets/img/logo.svg' }),
			
			CARRIER_ICON:  str({ default: 'http://maps.google.com/mapfiles/kml/pal4/icon54.png' }),
			CUSTOMER_ICON: str({ default: 'http://maps.google.com/mapfiles/kml/pal3/icon48.png' }),
			STORE_ICON:    str({ default: 'http://maps.google.com/mapfiles/kml/pal3/icon21.png' }),
			
			DELIVERY_TIME_MIN: num({ default: 30 }),
			DELIVERY_TIME_MAX: num({ default: 60 }),
			
			GOOGLE_APP_URL:    str({ default: '/auth/google' }),
			YANDEX_APP_URL:    str({ default: '/auth/yandex' }),
			FACEBOOK_APP_URL:  str({ default: '/auth/facebook' }),
			VKONTAKTE_APP_URL: str({ default: '/auth/vkontakte' }),
			
			GOOGLE_MAPS_API_KEY: str({ default: '' }),
			YANDEX_MAPS_API_KEY: str({ default: '' }),
			
			TALKJS_APP_ID: str({ default: '' }),
			
			// For maintenance micro service.
			SETTINGS_APP_TYPE:            str({ default: 'shop-web' }),
			SETTINGS_MAINTENANCE_API_URL: str({
				                                  default: '',
			                                  }),
			
			WEB_CONCURRENCY: num({ default: 1 }),
			WEB_MEMORY:      num({ default: 4096 }),
			
			HOST: str({ default: 'localhost' }),
			PORT: num({ default: 3000 })
		},
		{ strict: true, dotEnvPath: __dirname + '/../.env' }
);
