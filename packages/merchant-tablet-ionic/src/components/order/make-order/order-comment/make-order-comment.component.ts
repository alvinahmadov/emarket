import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ViewCell }                               from 'ng2-smart-table';

@Component({
	           styles:   [
		           `
                       .order-comment-wrapper textarea {
                           width: 100%;
                       }
		           `,
	           ],
	           template: `
		                     <div class="order-comment-wrapper">
			                     <textarea (blur)="setComment($event)"></textarea>
		                     </div>
	                     `,
           })
export class MakeOrderCommentComponent implements ViewCell
{
	@Input()
	public value;
	
	@Input()
	public rowData: any;
	
	@Output()
	public comment = new EventEmitter<string>();
	
	public get productId(): string
	{
		return this.value.productId;
	}
	
	public setComment(e)
	{
		this.comment.emit(e.target.value);
	}
}
