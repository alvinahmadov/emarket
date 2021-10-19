import { Component, Input, OnInit }    from '@angular/core';
import { Router }                      from '@angular/router';
import { Observable }                  from 'rxjs';
import { ViewCell }                    from 'ng2-smart-table';
import
{ WarehousesService as StoresService } from '@app/@core/data/warehouses.service';
import { default as Store }            from '@modules/server.common/entities/Warehouse';

@Component({
	           styles:      [
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
	           templateUrl: './redirect-store.component.html',
           })
export class RedirectStoreComponent implements ViewCell, OnInit
{
	public value: string | number;
	
	@Input()
	public rowData: any;
	public store$: Observable<Store>;
	
	public storeStatusText: string;
	
	constructor(
			private readonly router: Router,
			private readonly storesService: StoresService
	)
	{}
	
	public ngOnInit()
	{
		this.store$ = this.storesService.getStoreById(
				this.storeId
		);
		this.storeStatusText =
				'STATUS_TEXT.' + this.rowData.warehouseStatusText;
	}
	
	public get storeId(): string
	{
		return this.rowData.warehouseId
	}
	
	public redirect()
	{
		if(this.rowData.warehouseId)
		{
			this.router.navigate([`stores/${this.storeId}`]);
		}
	}
}
