import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription }                 from 'rxjs';
import { Storage }                      from 'services/storage.service'
import { CustomerRouter }               from '@modules/client.common.angular2/routers/customer-router.service';

@Component({
	           selector:    'page-terms-of-use',
	           templateUrl: './terms-of-use.html',
           })
export class TermsOfUsePage implements OnInit, OnDestroy
{
	public useTermsHtml: string = '<h1>Loading...</h1>';
	public selectedLanguage: string;
	private sub: Subscription;
	public deviceId: string;
	public userId: string;
	
	constructor(
			private customerRouter: CustomerRouter,
			private storage: Storage
	)
	{
		
		this.selectedLanguage = this.storage.language || 'en-US';
		this.deviceId = this.storage.deviceId;
		this.userId = this.storage.merchantId;
	}
	
	public ngOnInit(): void
	{
		this.sub = this.customerRouter
		               .getTermsOfUse(this.userId, this.deviceId, this.selectedLanguage)
		               .subscribe((html) =>
		                          {
			                          this.useTermsHtml = html;
		                          });
	}
	
	public ngOnDestroy()
	{
		this.sub.unsubscribe();
	}
}
