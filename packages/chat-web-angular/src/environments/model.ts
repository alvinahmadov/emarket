import { NgModuleRef } from '@angular/core';

export interface Environment
{
	production: boolean;
	
	HTTPS_SERVICES_ENDPOINT: string;
	HTTP_SERVICES_ENDPOINT: string;
	GQL_ENDPOINT: string;
	GQL_SUBSCRIPTIONS_ENDPOINT: string;
	
	HOST: string;
	PORT: number;
	
	ENV_PROVIDERS: any;
	
	decorateModuleRef(modRef: NgModuleRef<any>): NgModuleRef<any>;
}
