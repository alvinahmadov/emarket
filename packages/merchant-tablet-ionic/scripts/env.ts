// NOTE: do NOT ever put here any secure settings! (e.g. Secret Keys)
// We are using dotenv (.env) for consistency with other Platform projects
// This is Angular app and all settings will be loaded into the client browser!

import { cleanEnv, num, str, bool } from 'envalid';
import { v4 as uuid }               from 'uuid';

export type Environment = Readonly<{
	production: boolean;
	
	SERVICES_ENDPOINT: string;
	HTTPS_SERVICES_ENDPOINT: string;
	
	// Graphql endpoints for apollo services
	GQL_ENDPOINT: string;
	GQL_SUBSCRIPTIONS_ENDPOINT: string;
	
	APP_VERSION: string;
	
	CLOUDINARY_SIGNED_UPLOAD_PRESET: string;
	CLOUDINARY_UNSIGNED_UPLOAD_PRESET: string;
	CLOUDINARY_UPLOAD_URL: string;
	API_FILE_UPLOAD_URL: string;
	
	FAKE_MERCHANT_NAME: string;
	FAKE_MERCHANT_PASSWORD: string;
	FAKE_MERCHANT_EMAIL: string;
	
	DEFAULT_COORDINATES: boolean;
	DEFAULT_LATITUDE: number;
	DEFAULT_LONGITUDE: number;
	
	LOGIN_LOGO: string;
	NO_INTERNET_LOGO: string;
	
	COMPANY_NAME: string;
	APP_NAME: string;
	
	GOOGLE_MAPS_API_KEY: string;
	
	TALKJS_APP_ID: string;
	
	GOOGLE_ANALYTICS_API_KEY: string;
	FAKE_UUID: string;
	MIXPANEL_API_KEY: string;
	
	WAREHOUSE_PASSWORD_BCRYPT_SALT_ROUNDS: number;
	
	MAP_MERCHANT_ICON_LINK: string;
	
	MAP_USER_ICON_LINK: string;
	
	MAP_CARRIER_ICON_LINK: string;
	
	DEFAULT_LANGUAGE: string;
	AVAILABLE_LOCALES: string;
	
	// For maintenance micro service
	SETTINGS_APP_TYPE?: string;
	SETTINGS_MAINTENANCE_API_URL?: string;
	WEB_CONCURRENCY: number;
	WEB_MEMORY: number;
	HOST: string;
	PORT: number;
}>;

export const env: Environment = cleanEnv(
		process.env,
		{
			production: bool({ default: false }),
			
			SERVICES_ENDPOINT: str({ default: 'http://localhost:5500' }),
			HTTPS_SERVICES_ENDPOINT: str({ default: 'https://localhost:5501' }),
			
			// Graphql endpoints for apollo services
			GQL_ENDPOINT: str({ default: 'http://localhost:5555/graphql' }),
			GQL_SUBSCRIPTIONS_ENDPOINT: str({
				                                default: 'ws://localhost:5050/subscriptions',
			                                }),
			
			APP_VERSION: str({ default: '0.2.0' }),
			
			CLOUDINARY_SIGNED_UPLOAD_PRESET: str({ default: '' }),
			CLOUDINARY_UNSIGNED_UPLOAD_PRESET: str({ default: '' }),
			CLOUDINARY_UPLOAD_URL: str({ default: '' }),
			API_FILE_UPLOAD_URL: str({
				                         default: '',
			                         }),
			
			FAKE_MERCHANT_NAME: str({ default: 'merchant' }),
			FAKE_MERCHANT_PASSWORD: str({ default: '12345' }),
			FAKE_MERCHANT_EMAIL: str({ default: 'merchant@emarket.com' }),
			
			DEFAULT_COORDINATES: bool({ default: false }),
			DEFAULT_LATITUDE: num({ default: 37.6156 }),
			DEFAULT_LONGITUDE: num({ default: 55.7522 }),
			
			LOGIN_LOGO: str({ default: '' }),
			NO_INTERNET_LOGO: str({ default: '' }),
			
			COMPANY_NAME: str({ default: 'Company' }),
			APP_NAME: str({ default: 'Merchant' }),
			GOOGLE_MAPS_API_KEY: str({ default: '' }),
			GOOGLE_ANALYTICS_API_KEY: str({ default: '' }),
			TALKJS_APP_ID: str({ default: '' }),
			
			FAKE_UUID: str({ default: uuid() }),
			MIXPANEL_API_KEY: str({ default: '' }),
			
			WAREHOUSE_PASSWORD_BCRYPT_SALT_ROUNDS: num({ default: 12 }),
			
			MAP_MERCHANT_ICON_LINK: str({
				                            default: 'https://maps.google.com/mapfiles/kml/pal3/icon21.png',
			                            }),
			MAP_USER_ICON_LINK: str({
				                        default: 'https://maps.google.com/mapfiles/kml/pal3/icon48.png',
			                        }),
			MAP_CARRIER_ICON_LINK: str({
				                           default: 'https://maps.google.com/mapfiles/kml/pal4/icon54.png',
			                           }),
			
			// For maintenance micro service
			SETTINGS_APP_TYPE: str({ default: 'merchant-tablet' }),
			SETTINGS_MAINTENANCE_API_URL: str({
				                                  default: '',
			                                  }),
			DEFAULT_LANGUAGE: str({ default: 'ru-RU' }),
			AVAILABLE_LOCALES: str({ default: 'en-US|ru-RU' }),
			WEB_CONCURRENCY: num({ default: 1 }),
			WEB_MEMORY: num({ default: 4096 }),
			HOST: str({ default: 'localhost' }),
			PORT: num({ default: 4202 }),
		},
		{ strict: true, dotEnvPath: __dirname + '/../.env' }
);
