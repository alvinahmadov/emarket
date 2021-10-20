import { Injectable } from '@angular/core';

@Injectable()
export class SmartTableService
{
	public data = [];
	
	public getData()
	{
		return this.data;
	}
}
