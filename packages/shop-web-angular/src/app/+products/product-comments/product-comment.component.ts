import { Component, OnInit }                  from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router }             from '@angular/router';
import { Subscription }                       from 'rxjs';
import Comment                                from '@modules/server.common/entities/Comment';
import { ProductCommentService }              from 'app/services/product-comment.service';
import { StorageService }                     from 'app/services/storage';

@Component({
	           selector:    'es-product-comment',
	           templateUrl: './product-comment.component.html',
	           styleUrls:   ['./product-comment.component.scss']
           })
export class ProductCommentComponent implements OnInit
{
	public warehouseProductId: string;
	public warehouseId: string;
	public customerId: string;
	public productId: string;
	public title: string;
	
	public comments: Comment[] = [];
	public commentForm: FormGroup;
	
	private comments$: Subscription;
	
	constructor(
			private fb: FormBuilder,
			private productCommentService: ProductCommentService,
			private storage: StorageService,
			private activatedRouter: ActivatedRoute,
			private router: Router
	)
	{
		this.customerId = this.storage.customerId;
		this.productId = this.router.getCurrentNavigation().extras.state['productId'];
		this.title = this.router.getCurrentNavigation().extras.state['productTitle'];
	}
	
	public ngOnInit()
	{
		this.commentForm = this.fb.group({ message: ['', Validators.required] });
		this.warehouseId = this.activatedRouter.snapshot.params['warehouseId'];
		this.warehouseProductId = this.activatedRouter.snapshot.params['warehouseProductId'];
		
		if(this.customerId)
		{
			if(this.warehouseId && this.warehouseProductId)
			{
				this.comments$ = this.productCommentService
				                     .getComments(this.warehouseId, this.warehouseProductId)
				                     .subscribe((comments) => this.comments = comments);
			}
		}
	}
	
	public get message(): string
	{
		return this.commentForm.value.message;
	}
	
	public onCommentCancel()
	{
		this.commentForm.reset();
	}
	
	public onSubmit()
	{
		if(this.message)
		{
			if(this.message?.length > 0)
			{
				this.productCommentService
				    .addComment(
						    this.warehouseId,
						    this.warehouseProductId,
						    {
							    message:   this.message,
							    userId:    this.customerId,
							    productId: this.warehouseProductId
						    }
				    )
				    .then(comments =>
				          {
					          this.comments = comments;
					          this.onCommentCancel();
				          });
			}
		}
	}
}
