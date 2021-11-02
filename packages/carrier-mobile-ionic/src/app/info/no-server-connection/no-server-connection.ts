import { Component }               from '@angular/core';
import { environment }             from '../../../environments/environment';
import { StorageService }          from '../../../services/storage.service';
import { ServerConnectionService } from '@modules/client.common.angular2/services/server-connection.service';
import { Router }                  from '@angular/router';

@Component({
	           selector:    'no-server-connection',
	           styleUrls:   [`../information.scss`],
	           templateUrl: 'no-server-connection.html',
           })
export class NoServerConnectionComponent
{
	noInternetLogo: string;
	interval;
	
	constructor(
			private storageService: StorageService,
			private router: Router,
			private serverConnectionService: ServerConnectionService
	)
	{
		this.noInternetLogo = environment.NO_INTERNET_LOGO;
		this.testConnection();
	}
	
	ionViewWillLeave()
	{
		clearInterval(this.interval);
	}
	
	private async testConnection()
	{
		this.interval = setInterval(async() =>
		                            {
			                            await this.serverConnectionService.checkServerConnection(
					                            environment.SERVICES_ENDPOINT,
					                            this.storageService
			                            );
			
			                            if(!this.storageService.showInformationPage)
			                            {
				                            clearInterval(this.interval);
				                            this.storageService.clearMaintenanceMode();
				                            this.router.navigateByUrl('');
			                            }
		                            }, 5000);
	}
}
