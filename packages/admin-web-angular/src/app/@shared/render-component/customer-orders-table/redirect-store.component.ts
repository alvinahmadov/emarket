import { Component, Input, OnInit } from '@angular/core';
import { ViewCell }                 from 'ng2-smart-table';
import { Router }                   from '@angular/router';
import { WarehousesService }        from '../../../@core/data/warehouses.service';
import Warehouse                    from '@modules/server.common/entities/Warehouse';
import { Observable }               from 'rxjs';

@Component({
	           styles:   [
		           `
                       .warehouse-name {
                           padding-top: 5px;
                           font-weight: bold;
                       }

                       .warehouse-image {
                           width: 30px;
                           height: 30px;
                       }
		           `
	           ],
	           template: `
		                     <div
				                     *ngIf="store$ | async as store"
				                     (click)="redirect()"
				                     class="redirectBtn"
		                     >
			                     <h6>
				                     <img class="warehouse-image" alt="" src="{{ store.logo }}"/>
				                     <div class="warehouse-name">{{ store.name }}</div>
			                     </h6>
			                     <h6>{{ warehouseStatusText | translate }}</h6>
		                     </div>
	                     `,
           })
export class RedirectStoreComponent implements ViewCell, OnInit
{
	public value: string | number;
	
	@Input()
	public rowData: any;
	public store$: Observable<Warehouse>;
	
	public warehouseStatusText: string;
	
	constructor(
			private readonly router: Router,
			private readonly warehousesService: WarehousesService
	)
	{}
	
	public ngOnInit()
	{
		this.store$ = this.warehousesService.getStoreById(
				this.rowData.warehouseId
		);
		this.warehouseStatusText =
				'STATUS_TEXT.' + this.rowData.warehouseStatusText;
	}
	
	public get storeId(): string
	{
		return this.rowData.warehouseId;
	}
	
	public redirect()
	{
		if(this.rowData.warehouseId)
		{
			this.router.navigate([`stores/${this.storeId}`]);
		}
	}
}
