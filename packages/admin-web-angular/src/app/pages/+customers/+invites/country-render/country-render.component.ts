import { Component, AfterViewInit, Input } from '@angular/core';
import { DefaultEditor, Cell }             from 'ng2-smart-table';
import {
	TCountryData,
	countriesIdsToNamesArrayFn
}                                          from '@modules/server.common/data/countries';

@Component({
	           templateUrl: './country-render.component.html',
           })
export class CountryRenderComponent extends DefaultEditor
		implements AfterViewInit
{
	@Input()
	public cell: Cell;
	
	public country: string;
	
	public locale: string = 'en-US';
	
	public ngAfterViewInit() {}
	
	public onChanged(e) {}
	
	public get countries(): Array<TCountryData>
	{
		return countriesIdsToNamesArrayFn(this.locale);
	}
}
