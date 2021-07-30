// NOTE: Auto-generated file
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses 'environment.ts', but if you do
// 'ng build --env=prod' then 'environment.prod.ts' will be used instead.
// The list of which env maps to which file can be found in '.angular-cli.json'.

import { enableProdMode, NgModuleRef } from '@angular/core';
import { disableDebugTools } from '@angular/platform-browser';
import { Environment } from './model';

enableProdMode();

export const environment: Environment = {
	production: false,

	DEFAULT_LATITUDE: 42.6459136,
	DEFAULT_LONGITUDE: 23.3332736,

	DEFAULT_LANGUAGE: 'en-US',

	SERVICES_ENDPOINT: 'http://localhost:5500',
	HTTPS_SERVICES_ENDPOINT: 'https://localhost:5501',
	GQL_ENDPOINT: 'http://localhost:5555/graphql',
	GQL_SUBSCRIPTIONS_ENDPOINT: 'ws://localhost:5050/subscriptions',
	AUTH_LOGO: 'assets/img/ever-logo.svg',
	NO_INTERNET_LOGO: 'assets/img/ever-logo.svg',
	GOOGLE_MAPS_API_KEY: 'AIzaSyCu9rBjnlRE2RO4d8qCSl7P5TweLwm49AU',

	DELIVERY_TIME_MIN: 30,
	DELIVERY_TIME_MAX: 60,

	SETTINGS_APP_TYPE: 'shop-web',
	SETTINGS_MAINTENANCE_API_URL: '',

	ENV_PROVIDERS: [],

	/**
	 * Angular debug tools in the dev console
	 * https://github.com/angular/angular/blob/86405345b781a9dc2438c0fbe3e9409245647019/TOOLS_JS.md
	 * @param modRef
	 * @return {any}
	 */
	decorateModuleRef(modRef: NgModuleRef<any>) {
		disableDebugTools();
		return modRef;
	},
};
