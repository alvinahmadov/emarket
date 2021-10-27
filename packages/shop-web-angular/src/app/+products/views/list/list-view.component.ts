import {
	Component,
	Input,
	ViewChild,
	ElementRef,
	ViewChildren,
	QueryList,
	Output,
	EventEmitter,
	OnDestroy,
}                           from '@angular/core';
import { Subject }          from 'rxjs';
import ProductInfo          from '@modules/server.common/entities/ProductInfo';
import { MasonryComponent } from '@modules/masonry';
import { ProductComponent } from 'app/+products/product';

@Component({
	           selector:    'list-view',
	           styleUrls:   ['./list-view.component.scss'],
	           templateUrl: './list-view.component.html',
           })
export class ListViewComponent implements OnDestroy
{
	@Input()
	public products: ProductInfo[];
	@Input()
	public productsLoading: boolean;
	@Input()
	public isWideView: boolean;
	
	@ViewChild(MasonryComponent)
	public masonry: MasonryComponent;
	
	containerWidth: string = '100px';
	public productsCount: number = 10;
	
	@Output()
	public loadProducts = new EventEmitter<number>();
	
	@Output()
	public layoutComplete;
	
	@ViewChildren(ProductComponent)
	private productsComponents: QueryList<ProductComponent>;
	
	private _ngDestroy$ = new Subject<void>();
	
	constructor(private readonly elRef: ElementRef)
	{
		this.elRef.nativeElement.ownerDocument.body.style.overflow = 'hidden';
	}
	
	public onLayoutComplete(ev: any[]): void
	{
		this.elRef.nativeElement.ownerDocument.body.style.overflow = 'inherit';
		
		this.productsComponents.forEach((productComponent) =>
				                                productComponent.onLayoutComplete()
		);
	}
	
	public onResize(event)
	{
		this.containerWidth = `${0.6 * event.target.innerWidth} px`;
	}
	
	public ngOnDestroy()
	{
		this.elRef.nativeElement.ownerDocument.body.style.overflow = 'inherit';
		
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
