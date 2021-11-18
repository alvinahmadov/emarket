import { Input, Component, OnInit, Output }   from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ProductCommentService }              from 'app/services/product-comment.service';

@Component({
	           selector:    'es-reply-form',
	           templateUrl: './reply.component.html',
           })
export class ReplyComponent implements OnInit
{
	@Output('repCancel')
	public repCancel: boolean;
	
	@Input('commentId')
	public commentId: string;
	
	@Input('replyId')
	public replyId: string;
	
	@Input()
	public storeId: string;
	
	@Input()
	public storeProductId: string;
	
	public replyForm: FormGroup;
	
	constructor(
			private fb: FormBuilder,
			private productCommentService: ProductCommentService
	)
	{}
	
	public ngOnInit()
	{
		
		this.replyForm = this.fb.group({
			                               message: ['', Validators.required]
		                               });
	}
	
	public onReplyCancel()
	{
		this.repCancel = false;
		this.replyForm.reset();
	}
	
	public onSubmit()
	{
		const submittedVal = {
			name:     this.replyForm.value.name,
			email:    this.replyForm.value.email,
			message:  this.replyForm.value.message,
			comment:  this.commentId,
			postDate: Date.now()
		}
		
		this.productCommentService.getComment(
				this.storeId,
				this.storeProductId,
				this.commentId
		);
		// this.productCommentService.saveComment()
	}
}
