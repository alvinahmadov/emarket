import { Component, OnInit, OnDestroy, Input, OnChanges } from '@angular/core';
import { Subject }                                        from 'rxjs';
import Warehouse                                          from '@modules/server.common/entities/Warehouse';

@Component({
	           selector: 'ea-warehouse-main-info',
	           styleUrls: ['./warehouse-main-info.component.scss'],
	           templateUrl: './warehouse-main-info.component.html',
           })
export class WarehouseMainInfoViewComponent
		implements OnInit, OnDestroy, OnChanges
{
	@Input()
	public selectedWarehouse: Warehouse;
	protected isManufacturing: boolean;
	protected isCarrierRequired: boolean;
	private _ngDestroy$ = new Subject<void>();
	
	constructor() {}
	
	ngOnChanges()
	{
		if(this.selectedWarehouse)
		{
			this.isManufacturing = this.selectedWarehouse.isManufacturing;
			this.isCarrierRequired = this.selectedWarehouse.isCarrierRequired;
		}
	}
	
	ngOnInit() {}
	
	ngOnDestroy()
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
