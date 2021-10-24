import { Component, OnInit } from '@angular/core';
import { ViewCell }          from 'ng2-smart-table';
import Carrier               from '@modules/server.common/entities/Carrier';
import { StorageService }    from 'services/storage.service';

@Component({
	           selector:  'carrier-image-view',
	           styleUrls: ['./image.scss'],
	           template:  `
		                      <span class="image-component">
			<img *ngIf="carrier?.logo" src="{{ carrier.logo }}"/>
		</span>
	                      `,
           })
export class ImageComponent implements ViewCell, OnInit
{
	public value: string | number;
	public rowData: any;
	public carrier: Carrier;
	
	constructor(private storageService: StorageService) {}
	
	public ngOnInit(): void
	{
		this.carrier = this.rowData.carrier;
	}
}
