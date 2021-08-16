// NOTE: Auto-generated file
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses 'environment.ts', but if you do
// 'ng build --env=prod' then 'environment.prod.ts' will be used instead.
// The list of which env maps to which file can be found in '.angular-cli.json'.

import { ApplicationRef, NgModuleRef } from '@angular/core';
import { enableDebugTools } from '@angular/platform-browser';
import { Environment } from './model';

Error.stackTraceLimit = Infinity;

// tslint:disable-next-line:no-var-requires
require('zone.js/dist/long-stack-trace-zone');

export const environment: Environment = {
	production: false,
	
	SERVICES_ENDPOINT: 'http://localhost:5500',
	HTTPS_SERVICES_ENDPOINT: 'https://localhost:5501',
	GQL_ENDPOINT: 'http://localhost:5555/graphql',
	GQL_SUBSCRIPTIONS_ENDPOINT: 'ws://localhost:5050/subscriptions',
	
	DEFAULT_LANGUAGE: 'ru-RU',
	AVAILABLE_LOCALES: 'en-US|ru-RU|es-ES',
	
	DEFAULT_COORDINATES: false,
	DEFAULT_LATITUDE: 37.6156,
	DEFAULT_LONGITUDE: 55.7522,
	
	AUTH_LOGO: 'assets/img/ever-logo.svg',
	NO_INTERNET_LOGO: 'assets/img/ever-logo.svg',
	
	DELIVERY_TIME_MIN: 30,
	DELIVERY_TIME_MAX: 60,
	
	GOOGLE_MAPS_API_KEY: 'AIzaSyCu9rBjnlRE2RO4d8qCSl7P5TweLwm49AU',
	
	SETTINGS_APP_TYPE: 'shop-web',
	SETTINGS_MAINTENANCE_API_URL: '',
	
	ENV_PROVIDERS: [],
	
	/**
	 * Angular debug tools in the dev console
	 * https://github.com/angular/angular/blob/86405345b781a9dc2438c0fbe3e9409245647019/TOOLS_JS.md
	 * @param modRef
	 * @return {any}
	 */
	decorateModuleRef(modRef: NgModuleRef<any>)
	{
		const appRef = modRef.injector.get(ApplicationRef);
		const cmpRef = appRef.components[0];
		
		const _ng = (window as any).ng;
		enableDebugTools(cmpRef);
		(window as any).ng.probe = _ng.probe;
		(window as any).ng.coreTokens = _ng.coreTokens;
		return modRef;
	},
};
