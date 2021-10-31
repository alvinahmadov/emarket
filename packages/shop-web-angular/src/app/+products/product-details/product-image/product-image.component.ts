import { Component, Input, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { IProductImage }                                      from '@modules/server.common/interfaces/IProduct';
import Currency                                               from '@modules/server.common/entities/Currency';
import { DragScrollComponent }                                from 'ngx-drag-scroll';

@Component({
	           selector:    'es-product-image',
	           templateUrl: './product-image.component.html',
	           styleUrls:   ['./product-image.component.scss']
           })
export class ProductImageComponent implements OnInit
{
	@Input()
	public productImages: IProductImage[];
	
	@Input()
	public currency: Currency;
	
	@ViewChild('dragScroll')
	public dragScroll: DragScrollComponent;
	
	public activeImageIndex: number;
	
	constructor() { }
	
	public ngOnInit(): void
	{
		if (this.dragScroll)
		{
			this.dragScroll.scrollbarHidden = true;
		}
	}
	
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
