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
}                                                     from '@angular/core';
import { MasonryComponent }                           from '@modules/masonry';
import Warehouse                                      from '@modules/server.common/entities/Warehouse';
import { WarehouseComponent }                         from 'app/+warehouses/warehouse/warehouse.component';
import { Observable, Subject }                        from 'rxjs';
import { animate, state, style, transition, trigger } from "@angular/animations";

@Component({
	           selector: 'list-view',
	           animations: [
		           trigger('show', [
			           state('shown', style({ opacity: 1 })),
			           state('hidden', style({ opacity: 0 })),
			           transition('shown <=> hidden', animate('.2s')),
		           ]),
	           ],
	           styleUrls: ['./list-view.component.scss'],
	           templateUrl: './list-view.component.html',
           })
export class ListViewComponent implements OnDestroy
{
	@Input()
	warehouses: Warehouse[];
	@Input()
	warehousesLoading: boolean;
	@Input()
	isWideView: boolean;
	
	@ViewChild(MasonryComponent)
	masonry: MasonryComponent;
	
	containerWidth: string = '100px';
	warehousesCount: number = 10;
	
	@Output()
	loadWarehouses = new EventEmitter<number>();
	
	@ViewChildren(WarehouseComponent)
	private warehousesComponents: QueryList<WarehouseComponent>;
	
	@Input()
	layoutComplete: Observable<void>;
	
	private _ngDestroy$ = new Subject<void>();
	
	constructor(private readonly elRef: ElementRef)
	{
		this.elRef.nativeElement.ownerDocument.body.style.overflow = 'hidden';
	}
	
	onLayoutComplete(): void
	{
		this.elRef.nativeElement.ownerDocument.body.style.overflow = 'inherit';
		
		this.warehousesComponents.forEach((warehouseComponent) =>
				                                  warehouseComponent.onLayoutComplete()
		);
	}
	
	onResize(event)
	{
		this.containerWidth = `${0.6 * event.target.innerWidth} px`;
	}
	
	ngOnDestroy()
	{
		this.elRef.nativeElement.ownerDocument.body.style.overflow = 'inherit';
		
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
