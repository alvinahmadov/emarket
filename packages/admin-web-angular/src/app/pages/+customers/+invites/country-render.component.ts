import { Component, AfterViewInit, Input } from '@angular/core';
import { DefaultEditor, Cell }             from 'ng2-smart-table';
import {
	TCountryName,
	countriesIdsToNamesArray,
}                                          from '@modules/server.common/data/countries';
import Country                             from '@modules/server.common/enums/Country';

@Component({
	           template: `
		                     <select
				                     [(ngModel)]="this.cell.newValue"
				                     (change)="onChanged($event)"
				                     class="form-control ng-pristine ng-valid ng-touched"
		                     >
			                     <option
					                     *ngFor="let country of countries"
					                     value="{{ country.name }}"
			                     >
				                     {{ country.name }}
			                     </option>
		                     </select>
	                     `,
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
