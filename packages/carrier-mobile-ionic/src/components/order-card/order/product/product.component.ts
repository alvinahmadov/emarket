import {
	ChangeDetectionStrategy,
	Component,
	Input,
	OnInit,
}                                from '@angular/core';
import { Platform }              from '@ionic/angular';
import { IProductImage }         from '@modules/server.common/interfaces/IProduct';
import OrderProduct              from '@modules/server.common/entities/OrderProduct';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { StorageService }        from 'services/storage.service';

@Component({
	           selector:        'e-cu-order-product',
	           styleUrls:       ['./product.component.scss'],
	           templateUrl:     './product.component.html',
	           changeDetection: ChangeDetectionStrategy.OnPush,
           })
export class ProductComponent implements OnInit
{
	private static MAX_DESCRIPTION_LENGTH: number = 140;
	
	@Input()
	public orderProduct: OrderProduct;
	
	@Input()
	public showDetailsButton: boolean = false;
	
	constructor(
			private readonly translateProductLocales: ProductLocalesService,
			private readonly storageService: StorageService,
			public platform: Platform
	)
	{}
	
	public ngOnInit(): void {}
	
	public get title(): string
	{
		return this.translateProductLocales.getTranslate(
				this.orderProduct.product.title
		);
	}
	
	public get description(): string
	{
		let description = this.translateProductLocales.getTranslate(
				this.orderProduct.product.description
		);
		
		return description.length < ProductComponent.MAX_DESCRIPTION_LENGTH
		       ? description
		       : description.substring(
				0,
				ProductComponent.MAX_DESCRIPTION_LENGTH - 3
		) + '...';
	}
	
	public get image(): IProductImage
	{
		return (
				this.orderProduct.product.images.find(
						(product) => product.locale === this.storageService.language
				) ||
				this.orderProduct.product.images.find(
						(product) => product.locale === 'en-US'
				) ||
				this.orderProduct.product.images[0]
		);
	}
	
	public get imageClass(): string
	{
		switch(this.image.orientation)
		{
			case 1:
				return 'vertical';
			case 2:
				return 'horizontal';
			default:
				return 'square';
		}
	}
	
	public get count(): number
	{
		return this.orderProduct.count;
	}
	
	public get price(): number
	{
		return this.orderProduct.count * this.orderProduct.price;
	}
	
	public get showInsideDetailsButton(): boolean
	{
		const description = this.translateProductLocales.getTranslate(
				this.orderProduct.product.description
		);
		const isTwoRowsDesc =
				      description.length > ProductComponent.MAX_DESCRIPTION_LENGTH / 2;
		
		return (
				this.showDetailsButton &&
				!isTwoRowsDesc &&
				this.image.orientation === 1
		);
	}
	
	public get showOutsideDetailsButton(): boolean
	{
		const description = this.translateProductLocales.getTranslate(
				this.orderProduct.product.description
		);
		const isTwoRowsDesc =
				      description.length > ProductComponent.MAX_DESCRIPTION_LENGTH / 2;
		
		return (
				this.showDetailsButton &&
				(this.image.orientation !== 1 || isTwoRowsDesc)
		);
	}
}
