import { Component, Input, OnInit } from '@angular/core';
import { ViewCell }                 from 'ng2-smart-table';
import { Router }                   from '@angular/router';

@Component({
	           styleUrls:   ['chat-redirect.component.scss'],
	           templateUrl: './chat-redirect.component.html',
           })
export class RedirectChatComponent implements ViewCell, OnInit
{
	value: string | number;
	redirectPage: string;
	@Input()
	rowData: any;
	
	constructor(private readonly router: Router) {}
	
	ngOnInit() {}
	
	redirect()
	{
		if(this.redirectPage)
		{
			this.router.navigate([`${this.redirectPage}/${this.rowData.id}`]);
		}
	}
}
