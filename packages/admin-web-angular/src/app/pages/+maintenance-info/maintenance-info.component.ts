import { Component }          from '@angular/core';
import { Router }             from '@angular/router';
import { MaintenanceService } from '@modules/client.common.angular2/services/maintenance.service';
import { StorageService }     from '@app/@core/data/store.service';
import { environment }        from 'environments/environment';

@Component({
	           templateUrl: './maintenance-info.component.html',
           })
export class MaintenanceInfoComponent
{
	public message: string;
	public maintenanceMode: string;
	
	constructor(
			private maintenanceService: MaintenanceService,
			private router: Router,
			private storage: StorageService
	)
	{
		this.maintenanceMode = this.storage.maintenanceMode;
		this.getMessage();
		this.getStatus();
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
		const interval = setInterval(async() =>
		                             {
			                             const status = await this.maintenanceService.getStatus(
					                             environment['SETTINGS_APP_TYPE'],
					                             environment['SETTINGS_MAINTENANCE_API_URL']
			                             );
			                             console.warn(`Maintenance on '${this.maintenanceMode}': ${status}`);
			
			                             if(!status)
			                             {
				                             clearInterval(interval);
				                             this.storage.clearMaintenanceMode();
				                             this.router.navigate(['']);
			                             }
		                             }, 5000);
	}
}
