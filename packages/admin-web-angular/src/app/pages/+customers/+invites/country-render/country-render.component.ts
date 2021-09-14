import { Component, AfterViewInit, Input } from '@angular/core';
import { DefaultEditor, Cell }             from 'ng2-smart-table';
import {
	TCountryName,
	countriesIdsToNamesArray,
}                                          from '@modules/server.common/data/countries';
import Country                             from '@modules/server.common/enums/Country';

@Component({
	           templateUrl: './country-render.component.html',
           })
export class CountryRenderComponent extends DefaultEditor
		implements AfterViewInit
{
	@Input()
	cell: Cell;
	
	country: string;
	
	constructor()
	{
		super();
	}
	
	get countries(): Array<{ id: Country; name: TCountryName }>
	{
		return countriesIdsToNamesArray;
	}
	
	ngAfterViewInit() {}
	
	onChanged(e) {}
}
