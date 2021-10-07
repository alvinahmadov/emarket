import { Component, Input, OnInit } from '@angular/core';
import { ViewCell }                 from 'ng2-smart-table';
import { Router }                   from '@angular/router';

@Component({
	           styleUrls:   ['name-redirect.component.scss'],
	           templateUrl: './name-redirect.component.html',
           })
export class RedirectNameComponent implements ViewCell, OnInit
{
	public value: string | number;
	public redirectPage: string;
	
	@Input()
	public rowData: any;
	
	constructor(private readonly router: Router) {}
	
	public ngOnInit() {}
	
	public get name(): string
	{
		return this.rowData['name'];
	}
	
	public get isBanned(): boolean
	{
		return this.rowData['isBanned'];
	}
	
	public redirect()
	{
		if(this.redirectPage)
		{
			this.router.navigate([`${this.redirectPage}/${this.rowData.id}`]);
		}
	}
}
