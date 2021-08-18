// NOTE: Auto-generated file
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses 'environment.ts', but if you do
// 'ng build --env=prod' then 'environment.prod.ts' will be used instead.
// The list of which env maps to which file can be found in '.angular-cli.json'.

import { Environment } from './model';

export const environment: Environment = {
  production: false,
  
  GQL_ENDPOINT: 'http://localhost:5555/graphql',
  GQL_SUBSCRIPTIONS_ENDPOINT: 'ws://localhost:5050/subscriptions',
  SERVICES_ENDPOINT: 'http://localhost:5500',
  HTTPS_SERVICES_ENDPOINT: 'https://localhost:5501',
  
  APP_VERSION: '0.2.0',
  
  CLOUDINARY_SIGNED_UPLOAD_PRESET: 'emarket-products-images',
  CLOUDINARY_UNSIGNED_UPLOAD_PRESET: 'emarket-products-images',
  CLOUDINARY_UPLOAD_URL: 'https://api.cloudinary.com/v1_1/alvindre/upload',
  API_FILE_UPLOAD_URL: 'https://api.cloudinary.com/v1_1/alvindre/upload',
  
  DEFAULT_LOGIN_USERNAME: 'user',
  DEFAULT_LOGIN_PASSWORD: '12345',
  
  LOGIN_LOGO: 'assets/imgs/ever-logo.svg',
  NO_INTERNET_LOGO: 'assets/imgs/logo.png',
  
  COMPANY_NAME: 'Company',
  APP_NAME: 'Merchant',
  
  GOOGLE_MAPS_API_KEY: '',
  
  GOOGLE_ANALYTICS_API_KEY: '',
  FAKE_UUID: 'c2360292-3b42-456d-ac37-1cbd9429d4d1',
  MIXPANEL_API_KEY: '',
  
  WAREHOUSE_PASSWORD_BCRYPT_SALT_ROUNDS: 12,
  
  MAP_MERCHANT_ICON_LINK: 'https://maps.google.com/mapfiles/kml/pal3/icon21.png',
  
  MAP_USER_ICON_LINK: 'https://maps.google.com/mapfiles/kml/pal3/icon48.png',
  
  MAP_CARRIER_ICON_LINK: 'https://maps.google.com/mapfiles/kml/pal4/icon54.png',
  
  DEFAULT_LANGUAGE: 'ru-RU',
  AVAILABLE_LOCALES: 'en-US|ru-RU',
  
  // For maintenance micro service.
  SETTINGS_APP_TYPE: 'merchant-tablet',
  SETTINGS_MAINTENANCE_API_URL: ''
  
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * 'zone.run', 'zoneDelegate.invokeTask' for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

