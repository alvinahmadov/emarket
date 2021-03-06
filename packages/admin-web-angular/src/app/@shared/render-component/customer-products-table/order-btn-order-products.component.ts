import { Component, Input, OnInit } from '@angular/core';
import { ViewCell }                 from 'ng2-smart-table';
import { CustomOrderComponent }     from '../../../pages/+customers/+customer/ea-customer-products/custom-order';
import { NgbModal }                 from '@ng-bootstrap/ng-bootstrap';
import Product                      from '@modules/server.common/entities/Product';

@Component({
	           template: `
		                     <div class="product">
			                     <div (click)="openModal()" class="btn btn-custom">
				                     {{ 'CUSTOMERS_VIEW.ORDER' | translate }}
			                     </div>
		                     </div>
	                     `,
           })
export class OrderBtnOrderProductsComponent implements ViewCell, OnInit
{
	public value: string | number;
	
	@Input()
	public rowData: any;
	
	@Input()
	public availableProducts: Product[];
	
	@Input()
	public customerId: string;
	
	private productId: string;
	
	constructor(private readonly modalService: NgbModal) {}
	
	public ngOnInit(): void
	{
		this.productId = this.rowData.warehouseProduct.product.id;
	}
	
	public openModal()
	{
		const productsArray: any = this.availableProducts;
		if(productsArray)
		{
			localStorage.setItem('ever_customOrderProductId', this.productId);
			const currProduct = productsArray.find((x) =>
			                                       {
				                                       return x.warehouseProduct.product.id === this.productId;
			                                       });
			const activeModal = this.modalService.open(CustomOrderComponent, {
				size:      'lg',
				container: 'nb-layout',
			});
			
			const modalComponent: CustomOrderComponent =
					      activeModal.componentInstance;
			modalComponent.warehouseId = currProduct.warehouseId;
			modalComponent.customerId = this.customerId;
			modalComponent.currentProduct = currProduct;
		}
	}
}
