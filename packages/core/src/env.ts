import { cleanEnv, num, url, str, ValidatorSpec, bool } from 'envalid';

export type Environments = 'production' | 'development' | 'test';

export interface Environment
{
	// Development environment
	isDev: boolean;
	// Testing environment
	isTest: boolean;
	// Production environment
	isProd: boolean;
	
	NODE_ENV: Environments;
	
	WEB_CONCURRENCY: number;
	WEB_MEMORY: number;
	
	// Time zone
	TIME_ZONE: string;
	
	// Set origin restrictions for backend
	// disabled on development mode or maybe in
	// production mode too
	ENABLE_ORIGIN_RESTRICTION: boolean;
	// Origin which allowed to send requests to
	// backend service. In .env file separated with comma
	ALLOWED_ORIGINS: string;
	
	CONNECTION_TIMEOUT: number;
	
	// Endpoint for https connection
	// in server
	HTTPS_SERVICES_ENDPOINT: string;
	// Endpoint for http connection
	// in server
	SERVICES_ENDPOINT: string;
	// GraphQL server endpoint
	GQL_ENDPOINT: string;
	// GraphQL server subscription endpoint
	GQL_SUBSCRIPTIONS_ENDPOINT: string;
	
	// Path to the ssl certificaton on the
	// server
	HTTPS_CERT_PATH: string;
	// Path to the ssl certificaton key on
	// the server
	HTTPS_KEY_PATH: string;
	
	// Path to the logging and temporary
	// files
	LOGS_PATH: string;
	
	// Uri to the database connection
	DB_URI: string;
	DB_POOL_SIZE: number;
	DB_CONNECT_TIMEOUT: number;
	
	// Private stripe API secret key
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
	
	// Social settings for signin/signup
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
	
	// API key for currency converter
	CURRENCY_CONVERTER_API_KEY: string;
	// Url to the currency converter
	// API endpoint
	CURRENCY_CONVERTER_URL: string;
	
	// Languages that supported by the service,
	// separated by comma in .env file
	AVAILABLE_LOCALES: string;
	
	// Secret key for jwt token authentication.
	// Maybe any sequence of any characters
	JWT_SECRET: string;
	// Period of time while token is valid
	JWT_EXPIRES: string;
	
	// Admin setting for password hash generation
	ADMIN_PASSWORD_BCRYPT_SALT_ROUNDS: number;
	// Merchant setting for password hash generation
	WAREHOUSE_PASSWORD_BCRYPT_SALT_ROUNDS: number;
	// Carrier setting for password hash generation
	CARRIER_PASSWORD_BCRYPT_SALT_ROUNDS: number;
	// Customer/Shop setting for password hash generation
	USER_PASSWORD_BCRYPT_SALT_ROUNDS: number;
	
	// Maximum distance that store/warehouse may be shown
	// or found.
	STORE_MAX_TRACKING_DISTANCE: number;
	
	// Enable/disable after-registration email/device
	// validation
	SETTING_INVITES_ENABLED?: boolean;
	// App requires for every customer to be registered
	// Automatically temporarily enabled  when user
	// adds product to orders/wish list.<br>
	// <b>NOTE</b>: Not recommended to enable
	SETTINGS_REGISTRATIONS_REQUIRED_ON_START?: boolean;
	// Allow admin user to reset password
	ADMIN_PASSWORD_RESET?: boolean;
	// From admin panel allows to generate
	// various random and/or hardcoded entities.<br>
	// <b>NOTE</b>: For development only
	FAKE_DATA_GENERATOR?: boolean;
	
	// Default admin generation email
	// for service
	// <b>NOTE</b>: In any mode
	DEFAULT_ADMIN_MAIL: string;
	// Default admin generation password
	// for service
	// <b>NOTE</b>: Recommended to update
	// password after default admin
	// generation.
	// Used in any mode.
	DEFAULT_ADMIN_PASSWORD: string;
	
	// Enable default coordinates. <br>
	// <b>NOTE</b>: Can be enabled only
	// in development mode.
	DEFAULT_COORDINATES: boolean;
	// Default geolocation coordinates latitude.
	DEFAULT_LATITUDE: number;
	// Default geolocation coordinates longitude.
	DEFAULT_LONGITUDE: number;
	
	// Enable registering customer by predefined
	// code constant.
	// <b>NOTE</b>: For development only.
	FAKE_INVITE_CODE: number;
	
	// Generate default merchant
	// <b>NOTE</b>: For development only.
	FAKE_MERCHANT_NAME: string;
	// Generate default merchant
	// <b>NOTE</b>: For development only.
	FAKE_MERCHANT_PASSWORD: string;
	// Generate default merchant
	// <b>NOTE</b>: For development only.
	FAKE_MERCHANT_EMAIL: string;
	
	ARCGIS_CLIENT_ID: string;
	ARCGIS_CLIENT_SECRET: string;
	
	// API key for ipstack to detect
	// geolocation of the customer by
	// his/her IP address
	IP_STACK_API_KEY?: string;
	
	// See: https://talkjs.com/
	
	// TalkJS app id setting to
	// connect to chatting service
	TALKJS_APP_ID: string;
	// TalkJS app name setting to
	// connect to chatting service
	TALKJS_APP_NAME: string;
	// TalkJS app secret for backend-only
	// setting to connect to chatting
	// service.
	TALKJS_SECRET_KEY: string;
	
	// Level of log messages on core module
	LOG_LEVEL?: string;
	
	// Apollo
	APOLLO_KEY?: string;
	APOLLO_GRAPH_ID?: string;
	APOLLO_GRAPH_VARIANT?: string;
	APOLLO_SCHEMA_REPORTING: boolean;
	
	// Enable/disable https/http
	SSL_ON: boolean;
	MAX_SOCKETS?: number;
}

export const env: Readonly<Environment> = cleanEnv(
		process.env,
		{
			NODE_ENV: str({
				              choices: ['production', 'development', 'test'],
				              default: 'development'
			              }) as ValidatorSpec<Readonly<Environment>['NODE_ENV']>,
			
			WEB_CONCURRENCY: num({ default: 1 }),
			WEB_MEMORY:      num({ default: 2048 }),
			
			TIME_ZONE: str({ default: 'Europe/Moscow' }),
			
			ENABLE_ORIGIN_RESTRICTION: bool({ default: false }),
			ALLOWED_ORIGINS:           str({ default: '*' }),
			
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
			
			CURRENCY_CONVERTER_API_KEY: str({ default: '' }),
			CURRENCY_CONVERTER_URL:     str({ default: 'https://free.currconv.com/api/v7' }),
			
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
			
			STORE_MAX_TRACKING_DISTANCE: num({ default: Number.MAX_SAFE_INTEGER }),
			
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
			
			SSL_ON:      bool({ default: false }),
			MAX_SOCKETS: num({ default: Infinity })
		},
		{ strict: true, dotEnvPath: __dirname + '/../../.env' }
);
