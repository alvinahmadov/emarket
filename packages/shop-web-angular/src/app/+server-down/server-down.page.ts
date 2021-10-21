import { Component, OnDestroy }    from '@angular/core';
import { HttpClient }              from '@angular/common/http';
import { Location }                from '@angular/common';
import { TranslateService }        from '@ngx-translate/core';
import { ServerConnectionService } from '@modules/client.common.angular2/services/server-connection.service';
import { StorageService }          from 'app/services/storage';
import { environment }             from 'environments/environment';

@Component({
	           styleUrls:   ['./server-down.page.scss'],
	           templateUrl: 'server-down.page.html',
           })
export class ServerDownPage implements OnDestroy
{
	public noInternetLogo: string;
	public interval;
	
	constructor(
			private storage: StorageService,
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
	
	public ngOnDestroy(): void
	{
		clearInterval(this.interval);
	}
	
	private async testConnection()
	{
		this.interval = setInterval(async() =>
		                            {
			                            await this.serverConnectionService.checkServerConnection(
					                            environment.HTTP_SERVICES_ENDPOINT,
					                            this.storage
			                            );
			
			                            if(Number(this.storage.serverConnection) !== 0)
			                            {
				                            clearInterval(this.interval);
				                            this.location.back();
			                            }
		                            }, 5000);
	}
}
