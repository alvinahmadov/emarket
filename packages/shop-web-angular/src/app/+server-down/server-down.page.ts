import { Component, OnDestroy }    from '@angular/core';
import { HttpClient }              from '@angular/common/http';
import { Location }                from '@angular/common';
import { TranslateService }        from '@ngx-translate/core';
import { ServerConnectionService } from '@modules/client.common.angular2/services/server-connection.service';
import { Store }                   from 'app/services/store';
import { environment }             from 'environments/environment';

@Component({
	           styleUrls: ['./server-down.page.scss'],
	           templateUrl: 'server-down.page.html',
           })
export class ServerDownPage implements OnDestroy
{
	noInternetLogo: string;
	interval;
	
	constructor(
			private store: Store,
			private readonly http: HttpClient,
			private location: Location,
			private translate: TranslateService,
			private serverConnectionService: ServerConnectionService
	)
	{
		const browserLang = translate.getBrowserLang();
		const defaultLanguage = environment.DEFAULT_LANGUAGE;
		let availableLocales = environment.AVAILABLE_LOCALES;
		
		translate.use(
				browserLang.match(availableLocales)
				? browserLang
				: defaultLanguage
		);
		
		this.noInternetLogo = environment['NO_INTERNET_LOGO'];
		this.testConnection().then().catch();
	}
	
	ngOnDestroy(): void
	{
		clearInterval(this.interval);
	}
	
	private async testConnection()
	{
		this.interval = setInterval(async() =>
		                            {
			                            await this.serverConnectionService.checkServerConnection(
					                            environment.SERVICES_ENDPOINT,
					                            this.store
			                            );
			
			                            if(Number(this.store.serverConnection) !== 0)
			                            {
				                            clearInterval(this.interval);
				                            this.location.back();
			                            }
		                            }, 5000);
	}
}
