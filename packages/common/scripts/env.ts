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
	
	DEFAULT_COORDINATES: boolean;
	DEFAULT_LATITUDE: number;
	DEFAULT_LONGITUDE: number;
	
	DEFAULT_LANGUAGE: string;
	AVAILABLE_LOCALES: string;
	
	AUTH_LOGO: string;
	NO_INTERNET_LOGO: string;
	
	DELIVERY_TIME_MIN: number;
	DELIVERY_TIME_MAX: number;
	
	GOOGLE_MAPS_API_KEY: string;
	YANDEX_MAPS_API_KEY: string;
	
	SETTINGS_APP_TYPE?: string;
	SETTINGS_MAINTENANCE_API_URL?: string;
	
	WEB_CONCURRENCY: number;
	WEB_MEMORY: number;
	
	HOST: string;
	PORT: number;
}>;

export const env: Env = cleanEnv(
		process.env,
		{
			production: bool({ default: false }),
			
			HTTP_SERVICES_ENDPOINT: str({ default: 'http://localhost:5500' }),
			HTTPS_SERVICES_ENDPOINT: str({ default: 'https://localhost:5501' }),
			GQL_ENDPOINT: str({ default: 'http://localhost:5555/graphql' }),
			GQL_SUBSCRIPTIONS_ENDPOINT: str({
				                                default: 'ws://localhost:5050/subscriptions',
			                                }),
			
			DEFAULT_COORDINATES: bool({ default: false }),
			DEFAULT_LATITUDE: num({ default: 37.6156 }),
			DEFAULT_LONGITUDE: num({ default: 55.7522 }),
			
			DEFAULT_LANGUAGE: str({ default: 'ru-RU' }),
			AVAILABLE_LOCALES: str({ default: 'en-US|ru-RU' }),
			
			AUTH_LOGO: str({ default: 'assets/img/logo.svg' }),
			NO_INTERNET_LOGO: str({ default: 'assets/img/logo.svg' }),
			
			DELIVERY_TIME_MIN: num({ default: 30 }),
			DELIVERY_TIME_MAX: num({ default: 60 }),
			
			GOOGLE_MAPS_API_KEY: str({ default: '' }),
			YANDEX_MAPS_API_KEY: str({ default: '' }),
			
			// For maintenance micro service.
			SETTINGS_APP_TYPE: str({ default: 'shop-web' }),
			SETTINGS_MAINTENANCE_API_URL: str({
				                                  default: '',
			                                  }),
			
			WEB_CONCURRENCY: num({ default: 1 }),
			WEB_MEMORY: num({ default: 4096 }),
			
			HOST: str({ default: 'localhost' }),
			PORT: num({ default: 3000 })
		},
		{ strict: true, dotEnvPath: __dirname + '/../.env' }
);
