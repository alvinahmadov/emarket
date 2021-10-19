import { Component, Input, OnInit }    from '@angular/core';
import { Router }                      from '@angular/router';
import { Observable }                  from 'rxjs';
import { ViewCell }                    from 'ng2-smart-table';
import { default as Store }            from '@modules/server.common/entities/Warehouse';
import
{ WarehousesService as StoresService } from '@app/@core/data/warehouses.service';

@Component({
	           template: `
		                     <div class="product">
			                     <h6 *ngIf="store$ | async as store" class="text-center">
				                     <span (click)="redirect()"
				                           class="button-redirect warhouseBtn">
					                     <span class="productTitle">
						                     {{ store.name }}
					                     </span>
				                     </span>
			                     </h6>
		                     </div>
	                     `,
           })
export class StoreOrderProductsComponent implements ViewCell, OnInit
{
	public value: string | number;
	public store$: Observable<Store>;
	
	@Input()
	public rowData: any;
	
	constructor(
			private readonly router: Router,
			private readonly storesService: StoresService
	)
	{}
	
	public ngOnInit(): void
	{
		this.store$ = this.storesService.getStoreById(
				this.rowData.warehouseId
		);
	}
	
	public get storeId(): string
	{
		return this.rowData.warehouseId;
	}
	
	public redirect()
	{
		if(this.rowData)
		{
			this.router.navigate([`stores/${this.storeId}`]);
		}
	}
}
