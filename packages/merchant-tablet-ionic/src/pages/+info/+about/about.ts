import { Component, OnDestroy } from '@angular/core';
import { Subscription }         from 'rxjs';
import { CustomerRouter }       from '@modules/client.common.angular2/routers/customer-router.service';
import { environment }          from 'environment';
import { AppSettingsService }   from 'services/app-settings.service';
import { StorageService }       from 'services/storage.service';

@Component({
	           selector:    'page-about',
	           templateUrl: 'about.html',
           })
export class AboutPage implements OnDestroy
{
	public useAboutHtml: string = '<h1>Loading...</h1>';
	public selectedLanguage: string;
	public deviceId: string;
	public userId: string;
	public appVersion: string;
	private sub: Subscription;
	
	constructor(
			private userRouter: CustomerRouter,
			private appSettingsService: AppSettingsService,
			private storageService: StorageService
	)
	{
		this.selectedLanguage = this.storageService.locale || 'en-US';
		this.deviceId = this.storageService.deviceId;
		this.userId = this.storageService.merchantId;
		this.appVersion = environment.APP_VERSION;
	}
	
	public ngOnInit()
	{
		this.sub = this.userRouter
		               .getAboutUs(this.userId, this.deviceId, this.selectedLanguage)
		               .subscribe((html) => this.useAboutHtml = html);
	}
	
	public ngOnDestroy()
	{
		this.sub.unsubscribe();
	}
}
