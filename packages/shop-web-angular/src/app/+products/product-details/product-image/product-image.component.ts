import { Component, Input } from '@angular/core';
import { IProductImage }    from '@modules/server.common/interfaces/IProduct';
import Currency             from '@modules/server.common/entities/Currency';

@Component({
	           selector:    'es-product-image',
	           styleUrls:   ['./product-image.component.scss'],
	           templateUrl: './product-image.component.html'
           })
export class ProductImageComponent
{
	@Input()
	public productImages: IProductImage[];
	
	@Input()
	public currency: Currency;
	
	public activeImageIndex: number;
	
	public get hasImages(): boolean
	{
		if(!this.productImages)
			return false;
		
		return this.productImages.length > 0;
	}
	
	public get isSingle(): boolean
	{
		if(this.hasImages)
		{
			return this.productImages.length == 1;
		}
		
		return false;
	}
	
	public get hasBottomImages(): boolean
	{
		return this.hasImages && !this.isSingle;
	}
	
	public get topImageUrl(): string
	{
		if(this.hasImages)
			return this.productImages[0].url;
		
		return "";
	}
	
	public get topImageValue(): string
	{
		if(this.hasImages)
			return this.productImages[0].value;
		
		return "";
	}
	
	public selectImage(
			topImage: HTMLImageElement,
			image: IProductImage,
			index: number
	)
	{
		this.activeImageIndex = index;
		topImage.src = image.url;
	}
	
}
