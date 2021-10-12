import { Component, OnDestroy }    from '@angular/core';
import { Storage }                 from 'services/storage.service';
import { Location }                from '@angular/common';
import { ServerConnectionService } from '@modules/client.common.angular2/services/server-connection.service';
import { environment }             from '../../environments/environment';

@Component({
	           styleUrls:   ['./server-down.page.scss'],
	           templateUrl: 'server-down.page.html',
           })
export class ServerDownPage implements OnDestroy
{
	public noInternetLogo: string;
	public interval: any;
	
	constructor(
			private store: Storage,
			private location: Location,
			private serverConnectionService: ServerConnectionService
	)
	{
		this.noInternetLogo = environment.NO_INTERNET_LOGO;
		this.testConnection();
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
		                            }, 10000);
	}
	
	public ngOnDestroy(): void
	{
		clearInterval(this.interval);
	}
}
