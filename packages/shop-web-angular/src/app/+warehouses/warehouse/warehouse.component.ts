import { Router }                                                     from '@angular/router';
import { Component, EventEmitter, Inject, Input, OnChanges, Output, } from '@angular/core';
import { Observable }                                                 from 'rxjs';
import 'rxjs/add/observable/fromEvent';
import { ElementQueries }                                             from 'css-element-queries/src/ElementQueries';
import { StorageService }                                             from 'app/services/storage';
import { DOCUMENT }                                                   from '@angular/common';
import Warehouse                                                      from '@modules/server.common/entities/Warehouse';

@Component({
	           selector: 'warehouse',
	           styleUrls: ['./warehouse.component.scss'],
	           templateUrl: './warehouse.component.html',
           })
export class WarehouseComponent implements OnChanges
{
	@Output()
	load: EventEmitter<void> = new EventEmitter<void>();
	
	@Input()
	warehouse: Warehouse;
	
	showTitle: 'shown' | 'hidden' = 'hidden';
	isGridView: boolean;
	logo: string;
	
	@Input()
	private layoutComplete: Observable<void>;
	
	constructor(
			@Inject(DOCUMENT) public document: Document,
			private readonly router: Router,
			private readonly storage: StorageService
	)
	{
		this.isGridView = this.storage.productListViewType === 'grid';
	}
	
	ngOnChanges(): void
	{
		if(this.warehouse)
		{
			this.logo = this.warehouse.logo;
		}
	}
	
	onImageLoad(): void
	{
		if(ElementQueries)
		{
			ElementQueries.init();
		}
		
		this.load.emit();
		this.showTitle = 'shown';
	}
	
	onLayoutComplete(): void
	{
		return;
	}
}
