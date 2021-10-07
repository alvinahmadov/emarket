import { Component, AfterViewInit, Input } from '@angular/core';
import { DefaultEditor, Cell }             from 'ng2-smart-table';
import {
	TCountryName,
	countriesIdsToNamesArrayFn
}                                          from '@modules/server.common/data/countries';
import Country                             from '@modules/server.common/enums/Country';
import { Store }                           from '@app/@core/data/store.service';

@Component({
	           templateUrl: './country-render.component.html',
           })
export class CountryRenderComponent extends DefaultEditor
		implements AfterViewInit
{
	@Input()
	public cell: Cell;
	
	public country: string;
	
	public locale: string;
	
	constructor(private store: Store)
	{
		super();
		this.locale = this.store.locale ?? 'ru-RU';
	}
	
	public get countries(): Array<{ id: Country; name: TCountryName }>
	{
		return countriesIdsToNamesArrayFn(this.locale);
	}
	
	public ngAfterViewInit() {}
	
	public onChanged(e) {}
}
