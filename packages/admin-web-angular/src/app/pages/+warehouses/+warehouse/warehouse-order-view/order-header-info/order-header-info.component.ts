import {
	Component,
	ViewChild,
	OnInit,
	OnDestroy,
	EventEmitter,
	Input,
	OnChanges,
} from '@angular/core';

import { Subject }          from 'rxjs';
import Order                from '@modules/server.common/entities/Order';
import { TranslateService } from '@ngx-translate/core';

@Component({
	           selector: 'ea-order-header-info',
	           styleUrls: ['./order-header-info.component.scss'],
	           templateUrl: './order-header-info.component.html',
           })
export class OrderHeaderInfoComponent implements OnInit, OnDestroy, OnChanges
{
	public timers: string[] = [];
	@Input()
	selectedOrder: Order;
	private _ngDestroy$ = new Subject<void>();
	
	constructor(private _translateService: TranslateService) {}
	
	ngOnChanges() {}
	
	ngOnInit() {}
	
	getStatus(status)
	{
		const columnTitlePrefix = 'STATUS_TEXT.';
		const forTranslate = columnTitlePrefix + status;
		return this._translate(forTranslate);
	}
	
	ngOnDestroy()
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	private _translate(key: string): string
	{
		let translationResult = '';
		
		this._translateService.get(key).subscribe((res) =>
		                                          {
			                                          translationResult = res;
		                                          });
		
		return translationResult;
	}
}
