import { Component, Input, OnInit } from '@angular/core';
import { ViewCell }                 from 'ng2-smart-table';
import { Router }                   from '@angular/router';
import OrderProduct                 from '@modules/server.common/entities/OrderProduct';
import { ProductLocalesService }    from '@modules/client.common.angular2/locale/product-locales.service';
import { ILocaleMember }            from '@modules/server.common/interfaces/ILocale';

@Component({
	           template: `
		<div
			*ngIf="product"
			(click)="redirect()"
			class="redirectBtn productBtn"
		>
			<h6>
				{{ productTitle }}
				<span class="badge badge-secondary">{{ product.count }}</span>
			</h6>
		</div>
	`,
           })
export class RedirectProductComponent implements ViewCell, OnInit
{
	value: string | number;
	product: OrderProduct;
	public productTitle: string;
	
	@Input()
	rowData: any;
	
	constructor(
			private readonly router: Router,
			private _productLocalesService: ProductLocalesService
	)
	{}
	
	ngOnInit(): void
	{
		if(this.rowData.products.length)
		{
			this.product = this.rowData.products[0];
			this.productTitle = this.localeTranslate(
					this.rowData.products[0].product.title
			);
		}
	}
	
	redirect()
	{
		if(this.product)
		{
			this.router.navigate([
				                     `products/list/${this.product['product'].id}`,
			                     ]);
		}
	}
	
	protected localeTranslate(member: ILocaleMember[])
	{
		return this._productLocalesService.getTranslate(member);
	}
}
