// NOTE: Auto-generated file
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses 'environment.ts', but if you do
// 'ng build --env=prod' then 'environment.prod.ts' will be used instead.
// The list of which env maps to which file can be found in '.angular-cli.json'.

import { Environment } from './model';

export const environment: Environment = {
	production: false,

	VERSION: '1.0.0',

	// 'slides' | 'list'
	PRODUCTS_VIEW_TYPE: 'list',

	// 'popup' or 'page'
	ORDER_INFO_TYPE: 'page',

	API_FILE_UPLOAD_URL: 'https://api.cloudinary.com/v1_1/alvindre/upload',

	INVITE_BY_CODE_LOGO: 'assets/imgs/ever-logo.svg',
	NO_INTERNET_LOGO: 'assets/imgs/logo.png',

	COMPANY_NAME: 'Company',

	GOOGLE_MAPS_API_KEY: '',

	GOOGLE_ANALYTICS_API_KEY: '',

	FAKE_UUID: '',

	// Not secret MixPanel Token
	MIXPANEL_API_KEY: '',

	DEFAULT_LANGUAGE: 'ru-RU',
	DEFAULT_LOCALE: 'ru-RU',

	DELIVERY_TIME_MIN: 30,
	DELIVERY_TIME_MAX: 60,

	SUPPORT_NUMBER: '0888888888',

	STRIPE_PUBLISHABLE_KEY: '',

	STRIPE_POP_UP_LOGO:
		'https://bitbucket-assetroot.s3.amazonaws.com/c/photos/2016/Jan/30/1263967991-1-everbie-avatar.png',

	MAP_MERCHANT_ICON_LINK:
		'http://maps.google.com/mapfiles/kml/pal3/icon21.png',

	MAP_USER_ICON_LINK: 'http://maps.google.com/mapfiles/kml/pal3/icon48.png',

	MAP_CARRIER_ICON_LINK:
		'http://maps.google.com/mapfiles/kml/pal4/icon54.png',

	DEFAULT_LATITUDE: 42.6459136,
	DEFAULT_LONGITUDE: 23.3332736,

	GQL_ENDPOINT: 'http://localhost:5555/graphql',
	GQL_SUBSCRIPTIONS_ENDPOINT: 'ws://localhost:5050/subscriptions',
	SERVICES_ENDPOINT: 'http://localhost:5500',
	HTTPS_SERVICES_ENDPOINT: 'https://localhost:5501',

	FAKE_INVITE: {
		ID: '1ae9d04f9010d834f8906881',
		CITY: 'Moscow',
		POSTCODE: '1000',
		ADDRESS: 'Leo Tolstoy 16',
		HOUSE: '12',
		CREATED_AT: '2021-06-02T14:50:55.658Z',
		UPDATED_AT: '2021-06-02T14:50:55.658Z',
		APARTMENT: '3',
		CODE: 8321,
		COUNTRY_ID: 102,
	},

	// For maintenance micro service
	SETTINGS_APP_TYPE: 'shop-mobile',
	SETTINGS_MAINTENANCE_API_URL: '',

	// For "single" merchant (multiple branches)
	MERCHANT_IDS: [],

	SHOPPING_CART: false,
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * 'zone.run', 'zoneDelegate.invokeTask' for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
