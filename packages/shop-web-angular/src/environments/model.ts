import { NgModuleRef } from '@angular/core';

export interface Environment
{
	production: boolean;
	ENV_PROVIDERS: any;
	HOST: string;
	PORT: number;
	TIME_ZONE: string;
	DATETIME_FORMAT: string;
	HTTP_SERVICES_ENDPOINT: string;
	HTTPS_SERVICES_ENDPOINT: string;
	GQL_ENDPOINT: string;
	GQL_SUBSCRIPTIONS_ENDPOINT: string;
	AUTH_LOGO: string;
	CARRIER_ICON: string;
	CUSTOMER_ICON: string;
	STORE_ICON: string;
	JWT_EXPIRES_MAX: string;
	JWT_EXPIRES_MIN: string;
	SETTINGS_APP_TYPE?: string;
	SETTINGS_MAINTENANCE_API_URL?: string;
	GOOGLE_APP_URL: string;
	YANDEX_APP_URL: string;
	FACEBOOK_APP_URL: string;
	VKONTAKTE_APP_URL: string;
	GOOGLE_MAPS_API_KEY: string;
	YANDEX_MAPS_API_KEY: string;
	TALKJS_APP_ID: string;
	DEFAULT_COORDINATES?: boolean;
	DEFAULT_LATITUDE?: number;
	DEFAULT_LONGITUDE?: number;
	DEFAULT_LANGUAGE: string;
	AVAILABLE_LOCALES: string;
	DELIVERY_TIME_MIN?: number;
	DELIVERY_TIME_MAX?: number;
	NO_INTERNET_LOGO: string;
	
	decorateModuleRef(modRef: NgModuleRef<any>): NgModuleRef<any>;
}

