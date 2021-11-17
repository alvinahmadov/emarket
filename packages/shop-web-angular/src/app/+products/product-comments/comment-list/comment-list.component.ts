import {
	Component,
	Input,
	OnDestroy,
	AfterViewInit
}                                from '@angular/core';
import { Subject }               from 'rxjs';
import Comment                   from '@modules/server.common/entities/Comment';
import Customer                  from '@modules/server.common/entities/Customer';
import { environment as env }    from '@modules/client.common.angular2/environments/environment';
import { environment }           from 'environments/environment';
import { ProductCommentService } from 'app/services/product-comment.service';
import { CustomersService }      from 'app/services/customer.service';
import { StorageService }        from 'app/services/storage';

@Component({
	           selector:    'es-comment-list',
	           templateUrl: './comment-list.component.html',
	           styleUrls:   ['./comment-list.component.scss']
           })
export class CommentListComponent implements AfterViewInit, OnDestroy
{
	@Input()
	public storeId: string;
	
	@Input()
	public storeProductId: string;
	
	@Input()
	public customerId: string;
	
	@Input()
	public comments: Comment[];
	
	public showReply = false;
	public togglePanel: any = {};
	public _customer: Customer;
	private _customers: Customer[];
	
	private _ngDestroy$: Subject<void> = new Subject<void>();
	
	constructor(
			private readonly _commentsService: ProductCommentService,
			private readonly _customersService: CustomersService,
			public readonly storageService: StorageService
	)
	{}
	
	public ngAfterViewInit(): void
	{
		if(this.storeId && this.storeProductId)
		{
			if(this.customerId)
				this._customersService
				    .getCustomerById(this.customerId)
				    .subscribe((customer) => this._customer = customer);
			
			this._customersService
			    .getCustomers()
			    .subscribe(customers => this._customers = customers);
		}
	}
	
	public ngOnDestroy()
	{
		this._ngDestroy$.next()
		this._ngDestroy$.complete();
	}
	
	public get timezone(): string
	{
		return env.TIME_ZONE ?? 'Europe/Moscow';
	}
	
	public get datetimeFormat(): string
	{
		return environment.DATETIME_FORMAT;
	}
	
	public get locale(): string
	{
		return this.storageService.locale ?? 'en-US';
	}
	
	public isByMe(comment: Comment): boolean
	{
		return comment.userId === this.customerId;
	}
	
	public getCustomer(comment: Comment): Customer | null
	{
		return this._customers
		       ? this._customers.find(c => c.id === comment.userId)
		       : null;
	}
	
	public getAvatar(comment: Comment)
	{
		const avatar = this.getCustomer(comment)?.avatar;
		
		if(!avatar)
		{
			return "https://img.icons8.com/external-kiranshastry-solid-kiranshastry/64/000000/external-user-interface-kiranshastry-solid-kiranshastry-1.png";
		}
		
		return avatar;
	}
	
	public async onDeleteComment(comment: Comment)
	{
		const commentId = comment.id;
		
		if(this.customerId && this.comments.length > 0)
		{
			const comment = await this._commentsService
			                          .getComment(
					                          this.storeId,
					                          this.storeProductId,
					                          commentId
			                          )
			                          .toPromise();
			
			if(comment && comment.userId === this.customerId)
			{
				await this._commentsService
				          .deleteCommentsByIds(
						          this.storeId,
						          this.storeProductId,
						          [commentId]
				          );
			}
		}
	}
	
	public async onLike(comment: Comment)
	{
		const commentId = comment.id;
		
		if(this.customerId && this.comments.length > 0)
		{
			await this._commentsService
			          .increaseLikes(
					          this.storeId,
					          this.storeProductId,
					          this.customerId,
					          commentId
			          );
		}
	}
	
	public async onDisLike(comment: Comment)
	{
		const commentId = comment.id;
		
		if(this.customerId && this.comments.length > 0)
		{
			await this._commentsService
			          .increaseDislikes(
					          this.storeId,
					          this.storeProductId,
					          this.customerId,
					          commentId
			          );
		}
	}
	
	public onReply()
	{
		this.showReply = !this.showReply;
	}
}
