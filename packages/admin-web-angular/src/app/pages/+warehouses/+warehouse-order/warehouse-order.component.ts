import { Component, Input, OnInit }     from '@angular/core';
import { ViewCell }                     from 'ng2-smart-table';
import { ToasterService }               from 'angular2-toaster';
import { NgbModal }                     from '@ng-bootstrap/ng-bootstrap';
import { WarehouseOrdersService }       from '@app/@core/data/warehouseOrders.service';
import { WarehouseOrderModalComponent } from '@app/@shared/warehouse/+warehouse-order-modal/warehouse-order-modal.component';
import { WarehouseInfoComponent }       from './warehouse-info/warehouse-info.component';

@Component({
	           styleUrls:   ['./warehouse-order.component.scss'],
	           templateUrl: './warehouse-order.component.html',
           })
export class WarehouseOrderComponent implements ViewCell, OnInit
{
	@Input()
	public value: any;
	
	@Input()
	public rowData: any;
	
	constructor(
			private readonly _modalService: NgbModal,
			private readonly _warehouseOrdersService: WarehouseOrdersService,
			private readonly _toasterService: ToasterService,
			private readonly modalService: NgbModal
	)
	{}
	
	public get renderValue(): string
	{
		return 'CUSTOMERS_VIEW.' + this.value.actionName.toString();
	}
	
	public ngOnInit() {}
	
	public openWarehouseOrderModal()
	{
		const componentRef = this._modalService.open(
				WarehouseOrderModalComponent,
				{ size: 'lg' }
		);
		const instance: WarehouseOrderModalComponent =
				      componentRef.componentInstance;
		
		instance.warehouseId = this.rowData.id;
		
		instance.makeOrderEmitter.subscribe((data) =>
		                                    {
			                                    const customerId = this.value.actionOwnerId.toString();
			                                    const warehouseId = instance.warehouseId;
			
			                                    this._warehouseOrdersService
			                                        .createOrder({ customerId: customerId, warehouseId, products: data })
			                                        .subscribe(() =>
			                                                   {
				                                                   this._toasterService.pop(
						                                                   `success`,
						                                                   `The order is finished!`
				                                                   );
				                                                   componentRef.close();
			                                                   });
		                                    });
	}
	
	public openInfo()
	{
		const activeModal = this.modalService.open(WarehouseInfoComponent, {
			size:      'sm',
			container: 'nb-layout',
		});
		const modalComponent: WarehouseInfoComponent =
				      activeModal.componentInstance;
		modalComponent.warehouseId = this.rowData.id;
		modalComponent.selectedWarehouse = this.rowData;
	}
}
