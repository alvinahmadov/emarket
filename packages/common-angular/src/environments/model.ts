import { NgModuleRef } from '@angular/core';

export interface Environment
{
	production: boolean,
	
	TIME_ZONE: string,
	
	DEFAULT_LANGUAGE: string;
	AVAILABLE_LOCALES: string;
	
	DEFAULT_COORDINATES?: boolean;
	DEFAULT_LATITUDE: number;
	DEFAULT_LONGITUDE: number;
	
	AUTH_LOGO: string;
	NO_INTERNET_LOGO: string;
	
	COMPANY_NAME: string;
	COMPANY_SITE_LINK: string
	COMPANY_FACEBOOK_LINK: string;
	COMPANY_VKONTAKTE_LINK: string;
	COMPANY_TWITTER_LINK: string;
	COMPANY_LINKEDIN_LINK: string;
	
	CURRENCY_SYMBOL: string;
	
	TALKJS_APP_ID: string;
	
	LOG_LEVEL: string;
	
	decorateModuleRef(modRef: NgModuleRef<any>): NgModuleRef<any>;
}
