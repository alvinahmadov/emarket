import { Component, OnInit, OnDestroy } from '@angular/core';

import { UserRouter }   from '@modules/client.common.angular2/routers/user-router.service';
import { Subscription } from 'rxjs';

@Component({
	           selector:    'page-terms-of-use',
	           templateUrl: 'terms-of-use.html',
	           styleUrls:   ['terms-of-use.scss'],
           })
export class TermsOfUsePage implements OnInit, OnDestroy
{
	public useTermsHtml: string = '<h1>Loading...</h1>';
	public selectedLanguage: string;
	public deviceId: string;
	public userId: string;
	private sub: Subscription;
	
	constructor(private userRouter: UserRouter)
	{
		this.selectedLanguage = localStorage.getItem('_language') || 'en-US';
		this.deviceId = localStorage.getItem('_deviceId');
		this.userId = localStorage.getItem('_userId');
	}
	
	ngOnInit()
	{
		this.sub = this.userRouter
		               .getTermsOfUse(this.userId, this.deviceId, this.selectedLanguage)
		               .subscribe((html) =>
		                          {
			                          this.useTermsHtml = html;
		                          });
	}
	
	ngOnDestroy()
	{
		this.sub.unsubscribe();
	}
}
