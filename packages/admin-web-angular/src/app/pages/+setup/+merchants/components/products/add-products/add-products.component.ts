import {
	Component,
	ViewChild,
	OnInit,
	Input,
	Output,
	EventEmitter,
}                                        from '@angular/core';
import { first }                         from 'rxjs/operators';
import Product                           from '@modules/server.common/entities/Product';
import { AddWarehouseProductsComponent } from '@app/@shared/warehouse-product/forms/add-warehouse-products-table';
import { WarehousesService }             from '@app/@core/data/warehouses.service';
import { NotifyService }                 from '@app/@core/services/notify/notify.service';

@Component({
	           selector:    'ea-merchants-setup-add-products',
	           templateUrl: './add-products.component.html',
           })
export class SetupMerchantAddProductsComponent implements OnInit
{
	@ViewChild('addWarehouseProductsTable', { static: true })
	public addWarehouseProductsTable: AddWarehouseProductsComponent;
	
	@Input()
	public products: Product[];
	@Input()
	public storeId: string;
	
	@Output()
	public successAdd: EventEmitter<boolean> = new EventEmitter<boolean>();
	
	constructor(
			private warehousesService: WarehousesService,
			private notifyService: NotifyService
	)
	{}
	
	public ngOnInit(): void
	{
		this.addWarehouseProductsTable.loadDataSmartTable(
				this.products || [],
				this.storeId
		);
	}
	
	public async add()
	{
		try
		{
			const productsForAdd = this.addWarehouseProductsTable.allWarehouseProducts;
			
			await this.warehousesService
			          .addProducts(this.storeId, productsForAdd)
			          .pipe(first())
			          .toPromise();
			
			this.successAdd.emit(true);
			
			const message = `${productsForAdd.length} products was added`;
			this.notifyService.success(message);
		} catch(error)
		{
			let message = `Something went wrong`;
			
			if(error.message === 'Validation error')
			{
				message = error.message;
			}
			
			this.notifyService.error(message);
		}
	}
}
