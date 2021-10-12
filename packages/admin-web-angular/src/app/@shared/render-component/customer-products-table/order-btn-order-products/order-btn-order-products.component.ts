import { Component, Input, OnInit } from '@angular/core';
import { NgbModal }                 from '@ng-bootstrap/ng-bootstrap';
import { ViewCell }                 from 'ng2-smart-table';
import Product                      from '@modules/server.common/entities/Product';
import { CustomOrderComponent }     from '@app/pages/+customers/+customer/ea-customer-products/custom-order';

@Component({
	           templateUrl: './order-btn-order-products.component.html',
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
			const currProduct = productsArray.find(
					(x) => x.warehouseProduct.product.id === this.productId
			);
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
