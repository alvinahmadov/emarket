// NOTE: Auto-generated file
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses 'environment.ts', but if you do
// 'ng build --env=prod' then 'environment.prod.ts' will be used instead.
// The list of which env maps to which file can be found in '.angular-cli.json'.

import { Environment } from './model';

export const environment: Environment = {
	production: false,
	SERVICES_ENDPOINT: 'http://localhost:5500',
	HTTPS_SERVICES_ENDPOINT: 'https://localhost:5501',

	GQL_ENDPOINT: 'http://localhost:5555/graphql',
	GQL_SUBSCRIPTIONS_ENDPOINT: 'ws://localhost:5050/subscriptions',

	APP_VERSION: '0.2.0',

	GOOGLE_MAPS_API_KEY: '',
	GOOGLE_ANALYTICS_API_KEY: '',
	FAKE_UUID: 'c2360292-3b42-456d-ac37-1cbd9429d4d1',
	// Not secret MixPanel Token
	MIXPANEL_API_KEY: '',

	DEFAULT_CUSTOMER_LOGO:
		'http://res.cloudinary.com/evereq/image/upload/v1536843011/everbie-products-images/btzn3o8pimhercepno2d.png',

	LOGIN_LOGO: 'assets/imgs/ever-logo.svg',
	NO_INTERNET_LOGO: 'assets/imgs/ever-logo.svg',

	COMPANY_NAME: 'Company',
	APP_NAME: 'Carrier',

	DEFAULT_LOGIN_USERNAME: 'ever',
	DEFAULT_LOGIN_PASSWORD: 'changeme',

	DEFAULT_LATITUDE: 42.6459136,
	DEFAULT_LONGITUDE: 23.3932736,

	DEFAULT_LANGUAGE: 'ru',

	// For maintenance micro service
	SETTINGS_APP_TYPE: 'carrier-mobile',
	SETTINGS_MAINTENANCE_API_URL: '',
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * 'zone.run', 'zoneDelegate.invokeTask' for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
