import { cleanEnv, num, url, str, ValidatorSpec, bool } from 'envalid';

export type Environments = 'production' | 'development' | 'test';

export type Env = Readonly<{
	isDev: boolean;
	isTest: boolean;
	isProd: boolean;
	
	NODE_ENV: Environments;
	
	WEB_CONCURRENCY: number;
	WEB_MEMORY: number;
	
	TIME_ZONE: string;
	ALLOWED_ORIGINS: string;
	
	CONNECTION_TIMEOUT: number;
	
	HTTPS_SERVICES_ENDPOINT: string;
	SERVICES_ENDPOINT: string;
	GQL_ENDPOINT: string;
	GQL_SUBSCRIPTIONS_ENDPOINT: string;
	
	HTTPS_CERT_PATH: string;
	HTTPS_KEY_PATH: string;
	
	LOGS_PATH: string;
	
	DB_URI: string;
	DB_POOL_SIZE: number;
	DB_CONNECT_TIMEOUT: number;
	
	STRIPE_SECRET_KEY: string;
	
	YOOMONEY_SHOP_ID: string;
	YOOMONEY_SECRET_KEY: string;
	
	BITPAY_SHOP_NAME: string;
	BITPAY_WALLET_ID: string;
	BITPAY_PUBLIC_KEY: string;
	BITPAY_SECRET_KEY: string;
	
	URBAN_AIRSHIP_KEY: string;
	URBAN_AIRSHIP_SECRET: string;
	
	AWS_ACCESS_KEY_ID: string;
	AWS_SECRET_ACCESS_KEY: string;
	
	KEYMETRICS_MACHINE_NAME: string;
	KEYMETRICS_SECRET_KEY: string;
	KEYMETRICS_PUBLIC_KEY: string;
	
	GOOGLE_APP_ID: string;
	GOOGLE_APP_SECRET: string;
	GOOGLE_APP_CALLBACK: string;
	
	YANDEX_APP_ID: string;
	YANDEX_APP_SECRET: string;
	YANDEX_APP_CALLBACK: string;
	
	FACEBOOK_APP_ID: string;
	FACEBOOK_APP_SECRET: string;
	FACEBOOK_APP_CALLBACK: string;
	
	VKONTAKTE_APP_ID: string;
	VKONTAKTE_APP_SECRET: string;
	VKONTAKTE_APP_CALLBACK: string;
	
	AVAILABLE_LOCALES: string;
	
	JWT_SECRET: string;
	JWT_EXPIRES: string;
	
	ADMIN_PASSWORD_BCRYPT_SALT_ROUNDS: number;
	WAREHOUSE_PASSWORD_BCRYPT_SALT_ROUNDS: number;
	CARRIER_PASSWORD_BCRYPT_SALT_ROUNDS: number;
	USER_PASSWORD_BCRYPT_SALT_ROUNDS: number;
	
	SETTING_INVITES_ENABLED?: boolean;
	SETTINGS_REGISTRATIONS_REQUIRED_ON_START?: boolean;
	ADMIN_PASSWORD_RESET?: boolean;
	FAKE_DATA_GENERATOR?: boolean;
	
	DEFAULT_ADMIN_MAIL: string;
	DEFAULT_ADMIN_PASSWORD: string;
	
	DEFAULT_COORDINATES: boolean;
	DEFAULT_LATITUDE: number;
	DEFAULT_LONGITUDE: number;
	
	FAKE_INVITE_CODE: number;
	
	FAKE_MERCHANT_NAME: string;
	FAKE_MERCHANT_PASSWORD: string;
	FAKE_MERCHANT_EMAIL: string;
	
	ARCGIS_CLIENT_ID: string;
	ARCGIS_CLIENT_SECRET: string;
	IP_STACK_API_KEY?: string;
	
	TALKJS_APP_ID: string;
	TALKJS_APP_NAME: string;
	TALKJS_SECRET_KEY: string;
	
	LOG_LEVEL?: string;
	
	APOLLO_KEY?: string;
	APOLLO_GRAPH_ID?: string;
	APOLLO_GRAPH_VARIANT?: string;
	APOLLO_SCHEMA_REPORTING: boolean;
	
	MAX_SOCKETS?: number;
}>;

export const env: Env = cleanEnv(
		process.env,
		{
			NODE_ENV: str({
				              choices: ['production', 'development', 'test'],
				              default: 'development'
			              }) as ValidatorSpec<Env['NODE_ENV']>,
			
			WEB_CONCURRENCY: num({ default: 1 }),
			WEB_MEMORY:      num({ default: 2048 }),
			
			TIME_ZONE:       str({ default: 'Europe/Moscow' }),
			ALLOWED_ORIGINS: str({ default: '*' }),
			
			CONNECTION_TIMEOUT: num({ default: 30 }),
			
			HTTPS_SERVICES_ENDPOINT:    url({ default: 'https://localhost:5501' }),
			SERVICES_ENDPOINT:          url({ default: 'http://localhost:5500' }),
			GQL_ENDPOINT:               url({ default: 'http://localhost:5555/graphql' }),
			GQL_SUBSCRIPTIONS_ENDPOINT: url({ default: 'ws://localhost:5050/subscriptions' }),
			
			HTTPS_CERT_PATH: str({ default: 'certificates/https/cert.pem' }),
			HTTPS_KEY_PATH:  str({ default: 'certificates/https/key.pem' }),
			
			LOGS_PATH: str({ default: './tmp/logs' }),
			
			DB_URI:             str({ default: 'http://localhost/emarketdb' }),
			DB_POOL_SIZE:       num({ default: 50 }),
			DB_CONNECT_TIMEOUT: num({ default: 40000 }),
			
			STRIPE_SECRET_KEY: str({ default: '' }),
			
			YOOMONEY_SHOP_ID:    str({ default: '' }),
			YOOMONEY_SECRET_KEY: str({ default: '' }),
			
			BITPAY_SHOP_NAME:  str({ default: '' }),
			BITPAY_WALLET_ID:  str({ default: '' }),
			BITPAY_PUBLIC_KEY: str({ default: '' }),
			BITPAY_SECRET_KEY: str({ default: '' }),
			
			URBAN_AIRSHIP_KEY:    str({ default: '' }),
			URBAN_AIRSHIP_SECRET: str({ default: '' }),
			
			AWS_ACCESS_KEY_ID:     str({ default: '' }),
			AWS_SECRET_ACCESS_KEY: str({ default: '' }),
			
			KEYMETRICS_MACHINE_NAME: str({ default: '' }),
			KEYMETRICS_SECRET_KEY:   str({ default: '' }),
			KEYMETRICS_PUBLIC_KEY:   str({ default: '' }),
			
			GOOGLE_APP_ID:       str({ default: '' }),
			GOOGLE_APP_SECRET:   str({ default: '' }),
			GOOGLE_APP_CALLBACK: str({ default: '/auth/google/callback' }),
			
			YANDEX_APP_ID:       str({ default: '' }),
			YANDEX_APP_SECRET:   str({ default: '' }),
			YANDEX_APP_CALLBACK: str({ default: '/auth/yandex/callback' }),
			
			FACEBOOK_APP_ID:       str({ default: '' }),
			FACEBOOK_APP_SECRET:   str({ default: '' }),
			FACEBOOK_APP_CALLBACK: str({ default: '/auth/facebook' }),
			
			VKONTAKTE_APP_ID:       str({ default: '' }),
			VKONTAKTE_APP_SECRET:   str({ default: '' }),
			VKONTAKTE_APP_CALLBACK: str({ default: '/auth/facebook' }),
			
			AVAILABLE_LOCALES: str({ default: '' }),
			
			JWT_SECRET:  str({ default: 'default' }),
			JWT_EXPIRES: str({ default: '2 days' }),
			
			ADMIN_PASSWORD_BCRYPT_SALT_ROUNDS: num({
				                                       desc:    'Used for passwords encryption, recommended value: 12',
				                                       docs:
				                                                'https://security.stackexchange.com/questions/17207/recommended-of-rounds-for-bcrypt',
				                                       default: 12
			                                       }),
			
			WAREHOUSE_PASSWORD_BCRYPT_SALT_ROUNDS: num({
				                                           desc:    'Used for passwords encryption, recommended value: 12',
				                                           docs:
				                                                    'https://security.stackexchange.com/questions/17207/recommended-of-rounds-for-bcrypt',
				                                           default: 12
			                                           }),
			
			CARRIER_PASSWORD_BCRYPT_SALT_ROUNDS: num({
				                                         desc:    'Used for passwords encryption, recommended value: 12',
				                                         docs:
				                                                  'https://security.stackexchange.com/questions/17207/recommended-of-rounds-for-bcrypt',
				                                         default: 12
			                                         }),
			
			USER_PASSWORD_BCRYPT_SALT_ROUNDS: num({
				                                      desc:    'Used for passwords encryption, recommended value: 10',
				                                      docs:
				                                               'https://security.stackexchange.com/questions/17207/recommended-of-rounds-for-bcrypt',
				                                      default: 10
			                                      }),
			
			SETTING_INVITES_ENABLED:                  bool({ default: false }),
			SETTINGS_REGISTRATIONS_REQUIRED_ON_START: bool({ default: false }),
			ADMIN_PASSWORD_RESET:                     bool({ default: false }),
			FAKE_DATA_GENERATOR:                      bool({ default: false }),
			
			DEFAULT_ADMIN_MAIL:     str({ default: 'admin@mail.com' }),
			DEFAULT_ADMIN_PASSWORD: str({ default: 'admin' }),
			
			DEFAULT_COORDINATES: bool({ default: false }),
			DEFAULT_LATITUDE:    num({ default: 37.6156 }),
			DEFAULT_LONGITUDE:   num({ default: 55.7522 }),
			
			FAKE_MERCHANT_NAME:     str({ default: 'merchant' }),
			FAKE_MERCHANT_PASSWORD: str({ default: '12345' }),
			FAKE_MERCHANT_EMAIL:    str({ default: 'merchant@mail.com' }),
			
			FAKE_INVITE_CODE: num({ default: 0 }),
			
			ARCGIS_CLIENT_ID:     str({ default: '' }),
			ARCGIS_CLIENT_SECRET: str({ default: '' }),
			IP_STACK_API_KEY:     str({ default: '' }),
			
			TALKJS_APP_ID:     str({ default: '' }),
			TALKJS_APP_NAME:   str({ default: 'emarket' }),
			TALKJS_SECRET_KEY: str({ default: '' }),
			
			LOG_LEVEL:  str({
				                choices: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
				                default: 'error'
			                }),
			APOLLO_KEY: str({
				                desc:
						                'Apollo Engine Key (optional, see https://www.apollographql.com/docs/platform/schema-registry)',
				                default: ''
			                }),
			
			APOLLO_GRAPH_ID:      str({
				                          desc:    'Apollo graph id',
				                          default: ''
			                          }),
			APOLLO_GRAPH_VARIANT: str(
					{ default: 'current' }
			),
			
			APOLLO_SCHEMA_REPORTING: bool({ default: false }),
			
			MAX_SOCKETS: num({ default: Infinity })
		},
		{ strict: true, dotEnvPath: __dirname + '/../../.env' }
);
