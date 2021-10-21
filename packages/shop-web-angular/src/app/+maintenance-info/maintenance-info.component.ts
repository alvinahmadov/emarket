import { Component }          from '@angular/core';
import { MaintenanceService } from '@modules/client.common.angular2/services/maintenance.service';
import { environment }        from 'environments/environment';
import { ToolbarController }  from 'app/app.component';
import { StorageService }     from 'app/services/storage';
import { Router }             from '@angular/router';

@Component({
	           template: `
		           <div
				           *ngIf="message"
				           class="maintenance-message-container"
				           [innerHTML]="message | safe: 'html'"
		           ></div>
	           `,
           })
export class MaintenanceInfoComponent implements ToolbarController
{
	public toolbarDisabled: boolean = true;
	public message;
	
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
	
	private async getStatus()
	{
		const interval = setInterval(async() =>
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
				                             clearInterval(interval);
				                             this.storageService.clearMaintenanceMode();
				                             this.router.navigate(['']);
			                             }
		                             }, 5000);
	}
}
