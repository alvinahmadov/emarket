import { Component, OnInit } from '@angular/core';
import { TranslateService }  from '@ngx-translate/core';

@Component({
	           selector:    'es-profile',
	           templateUrl: './profile.component.html',
	           styleUrls:   ['./profile.component.scss']
           })
export class ProfileComponent implements OnInit
{
	constructor(
			public translateService: TranslateService
	)
	{ }
	
	ngOnInit(): void
	{}
	
	public updateLocation(ev: boolean)
	{
		console.debug(ev);
	}
	
}
