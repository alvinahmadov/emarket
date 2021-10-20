import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';
import { StorageService }    from '@app/@core/data/store.service';

@Component({
	           styleUrls:   ['./setup.component.scss'],
	           templateUrl: './setup.component.html',
           })
export class SetupComponent implements OnInit
{
	public loading: boolean;
	public fakeDataGenerator: boolean;
	
	constructor(
			private readonly _router: Router,
			private readonly _storageService: StorageService
	)
	{}
	
	public ngOnInit(): void
	{
		this.fakeDataGenerator = !!+this._storageService.fakeDataGenerator;
	}
	
	public navigateToFakeDataPage()
	{
		this.loading = true;
		this._router.navigate(['/generate-initial-data']);
		this.loading = false;
	}
	
	public navigateToSetupMerchantsPage()
	{
		this.loading = true;
		this._router.navigate(['/setup/merchants']);
		this.loading = false;
	}
	
	public navigateToSetupMarketPage()
	{
		this.loading = true;
		this._router.navigate(['/setup/market']);
		this.loading = false;
	}
}
