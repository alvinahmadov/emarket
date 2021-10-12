import { Component, Input } from '@angular/core';
import { ViewCell }         from 'ng2-smart-table';
import { Router }           from '@angular/router';

@Component({
	           styleUrls:   ['chat-redirect.component.scss'],
	           templateUrl: './chat-redirect.component.html',
           })
export class RedirectChatComponent implements ViewCell
{
	public value: string | null;
	public redirectPage: string;
	@Input()
	public rowData: any;
	
	constructor(private readonly router: Router) {}
	
	public get id(): string
	{
		return this.rowData['id'];
	}
	
	public redirect()
	{
		if(this.redirectPage)
		{
			this.router.navigate([this.redirectPage], { state: { userId: this.id } });
		}
	}
}
