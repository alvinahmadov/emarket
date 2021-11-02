import { Component }          from '@angular/core';
import { Router }             from '@angular/router';
import { MaintenanceService } from '@modules/client.common.angular2/services/maintenance.service';
import { environment }        from 'environments/environment';
import { StorageService }     from 'services/storage.service';

@Component({
	           selector:    'page-maintenance-info',
	           templateUrl: 'maintenance-info.html',
           })
export class MaintenanceInfoPage
{
	public message: string;
	public interval;
	
	constructor(
			private maintenanceService: MaintenanceService,
			private storageService: StorageService,
			private router: Router
	)
	{
		this.getMessage();
		this.getStatus();
	}
	
	async getMessage()
	{
		this.message = await this.maintenanceService.getMessage(
				this.storageService.maintenanceMode,
				environment['SETTINGS_MAINTENANCE_API_URL']
		);
	}
	
	ionViewWillLeave()
	{
		clearInterval(this.interval);
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
					                            `Maintenance on '${this.storageService.maintenanceMode}': ${status}`
			                            );
			
			                            if(!status)
			                            {
				                            clearInterval(this.interval);
				                            this.storageService.clearMaintenanceMode();
				                            this.router.navigateByUrl('');
			                            }
		                            }, 5000);
	}
}
