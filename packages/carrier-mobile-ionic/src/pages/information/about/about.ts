import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserRouter }                   from '@modules/client.common.angular2/routers/user-router.service';
import { Subscription }                 from 'rxjs/Subscription';
import { environment }                  from 'environments/environment';

@Component({
	           selector:    'page-about',
	           templateUrl: 'about.html',
	           styleUrls:   ['about.scss'],
           })
export class AboutPage implements OnInit, OnDestroy
{
	public useAboutHtml: string = '<h1>Loading...</h1>';
	public selectedLanguage: string;
	public deviceId: string;
	public userId: string;
	public appVersion: string;
	private sub: Subscription;
	
	constructor(private userRouter: UserRouter)
	{
		this.selectedLanguage = localStorage.getItem('_language') || 'en-US';
		this.deviceId = localStorage.getItem('_deviceId');
		this.userId = localStorage.getItem('_userId');
		this.appVersion = environment.APP_VERSION;
	}
	
	ngOnInit()
	{
		this.sub = this.userRouter
		               .getAboutUs(this.userId, this.deviceId, this.selectedLanguage)
		               .subscribe((html) =>
		                          {
			                          this.useAboutHtml = html;
		                          });
	}
	
	ngOnDestroy()
	{
		this.sub.unsubscribe();
	}
}
