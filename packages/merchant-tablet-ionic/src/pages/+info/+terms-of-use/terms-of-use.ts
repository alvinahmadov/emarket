import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription }                 from 'rxjs';
import { CustomerRouter }               from '@modules/client.common.angular2/routers/customer-router.service';
import { StorageService }               from 'services/storage.service';

@Component({
	           selector:    'page-terms-of-use',
	           templateUrl: './terms-of-use.html',
           })
export class TermsOfUsePage implements OnInit, OnDestroy
{
	public useTermsHtml: string = '<h1>Loading...</h1>';
	public selectedLanguage: string;
	public deviceId: string;
	public userId: string;
	private sub: Subscription;
	
	constructor(
			private customerRouter: CustomerRouter,
			private storageService: StorageService
	)
	{
		
		this.selectedLanguage = this.storageService.locale || 'en-US';
		this.deviceId = this.storageService.deviceId;
		this.userId = this.storageService.merchantId;
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
