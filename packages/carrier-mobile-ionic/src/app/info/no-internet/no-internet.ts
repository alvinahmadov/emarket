import { Component }      from '@angular/core';
import { Router }         from '@angular/router';
import { Network }        from '@ionic-native/network/ngx';
import { environment }    from 'environments/environment';
import { first }          from 'rxjs/operators';
import { StorageService } from 'services/storage.service';

@Component({
	           selector:  'no-internet',
	           styleUrls: [`../information.scss`],
	           template:  `
		                      <div class="info-page" scroll="false">
			                      <div class="view-content">
				                      <div class="logo app-hide-on-keyboard-open">
					                      <img src="{{ noInternetLogo }}"/>
				                      </div>
				
				                      <div class="info-massage">
					                      <h3>
						                      {{
						                      'NO_INTERNET_VIEW.NETWORK_WAS_DISCONNECTED'
								                      | translate
						                      }}
					                      </h3>
				                      </div>
			                      </div>
		                      </div>
	                      `,
           })
export class NoInternetPage
{
	public noInternetLogo: string;
	
	constructor(
			private network: Network,
			private router: Router,
			private storageService: StorageService
	)
	{
		this.noInternetLogo = environment.NO_INTERNET_LOGO;
		
		this.networkWatch();
	}
	
	public async networkWatch()
	{
		await this.network.onConnect().pipe(first()).toPromise();
		this.storageService.clearNoInternet();
		this.router.navigateByUrl('');
	}
}
