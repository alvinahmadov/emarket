import { Component }          from '@angular/core';
import { MaintenanceService } from '@modules/client.common.angular2/services/maintenance.service';
import { Router }             from '@angular/router';
import { StorageService }     from 'services/storage.service';
import { environment }        from 'environments/environment';

@Component({
	           selector:    'page-maintenance-info',
	           templateUrl: 'maintenance-info.html',
           })
export class MaintenanceInfoPage
{
	public message: string;
	public interval: any;
	
	constructor(
			private maintenanceService: MaintenanceService,
			private storage: StorageService,
			private router: Router
	)
	{
		this.getMessage();
		this.getStatus();
	}
	
	public get maintenanceMode(): string
	{
		return this.storage.maintenanceMode;
	}
	
	public async getMessage()
	{
		this.message = await this.maintenanceService.getMessage(
				this.maintenanceMode,
				environment['SETTINGS_MAINTENANCE_API_URL']
		);
	}
	
	private async getStatus()
	{
		this.interval = setInterval(async() =>
		                            {
			                            const status = await this.maintenanceService.getStatus(
					                            environment['SETTINGS_APP_TYPE'],
					                            environment['SETTINGS_MAINTENANCE_API_URL']
			                            );
			                            console.warn(
					                            `Maintenance on '${this.storage.maintenanceMode}': ${status}`
			                            );
			
			                            if(!status)
			                            {
				                            clearInterval(this.interval);
				                            this.storage.clearMaintenanceMode();
				                            this.router.navigateByUrl('');
			                            }
		                            }, 10000);
	}
}
