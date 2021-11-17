import { injectable }                                           from 'inversify';
import Logger                                                   from 'bunyan';
import mongoose                                                 from 'mongoose';
import { Observable }                                           from 'rxjs';
import { first, map }                                           from 'rxjs/operators';
import { _throw }                                               from 'rxjs/observable/throw';
import _                                                        from 'lodash';
import {
	asyncListener,
	observableListener,
	routerName, serialization
}                                                               from '@pyro/io';
import { UpdateObject }                                         from '@pyro/db/db-update-object';
import IComment, { ICommentCreateObject, ICommentUpdateObject } from '@modules/server.common/interfaces/IComment';
import IPagingOptions                                           from '@modules/server.common/interfaces/IPagingOptions';
import ICommentsRouter                                          from '@modules/server.common/routers/ICommentRouter';
import Comment                                                  from '@modules/server.common/entities/Comment';
import WarehouseProduct                                         from '@modules/server.common/entities/WarehouseProduct';
import IService                                                 from '../../services/IService';
import { createLogger }                                         from '../../helpers/Log';
import { WarehousesProductsService }                            from '../../services/warehouses';

@injectable()
@routerName('comment')
export class CommentsService
		implements ICommentsRouter, IService
{
	protected readonly logger: Logger = createLogger({
		                                                 name: 'commentsService'
	                                                 });
	
	constructor(private readonly _warehousesProductsService: WarehousesProductsService)
	{}
	
	@observableListener()
	public get(
			storeId: string,
			storeProductId: string,
			commentId: string
	): Observable<Comment>
	{
		this.logger.info('.get(storeId, storeProductId, commentId) called');
		return this._getWarehouseProduct(storeId, storeProductId)
		           .pipe(
				           map((wProduct) =>
				               {
					               const comment = _.find(
							               wProduct.comments,
							               c =>
							               {
								               const comment = this._factory(c);
								               return comment.id === commentId;
							               }
					               );
					
					               if(comment !== undefined)
						               _throw(new Error(`Comment with id ${commentId} not exists`));
					
					               return this._factory(comment);
				               })
		           );
	}
	
	@observableListener()
	public async getComments(
			storeId: string,
			storeProductId: string,
			pagingOptions: IPagingOptions = {}
	): Promise<Comment[]>
	{
		this.logger.info('.getComments(storeId, storeProductId, pagingOptions) called');
		const sortObj = {};
		
		if(pagingOptions.sort)
		{
			sortObj[pagingOptions.sort.field] = pagingOptions.sort.sortBy;
		}
		
		return await this._getWarehouseProduct(storeId, storeProductId)
		                 .pipe(
				                 map(warehouseProduct =>
						                     _.map(
								                     warehouseProduct.comments,
								                     comment => this._factory(comment))
				                 ),
		                 )
		                 .toPromise();
	}
	
	@asyncListener()
	public async add(
			storeId: string,
			storeProductId: string,
			comment: ICommentCreateObject
	): Promise<Comment[]>
	{
		this.logger.info('.add(storeId, storeProductId, comment) called');
		
		const initComment = (commentObj: ICommentCreateObject): Comment =>
		{
			if(!commentObj['_id'])
				commentObj['_id'] = new mongoose.Types.ObjectId();
			
			const newComment = this._factory(commentObj as IComment);
			newComment.likes = 0;
			newComment.dislikes = 0;
			newComment.likesBy = [];
			newComment.dislikesBy = [];
			newComment.deleteRequested = false;
			newComment._createdAt = new Date();
			newComment._updatedAt = new Date();
			return newComment
		};
		
		const warehouseProduct = await this._getWarehouseProduct(storeId, storeProductId)
		                                   .toPromise();
		const commentCountBefore = warehouseProduct.comments?.length;
		
		let updatedProduct: WarehouseProduct;
		
		if(!warehouseProduct.comments)
			warehouseProduct.comments = []
		
		warehouseProduct.comments.push(initComment(comment));
		
		try
		{
			updatedProduct = await this._warehousesProductsService
			                           .update(storeId, warehouseProduct);
			
			const commentCountAfter = updatedProduct.comments.length;
			
			if(commentCountBefore != commentCountAfter)
			{
				this.logger.info(`Successfully added comments for product (${storeProductId}) of store (${storeId})`);
			}
			
			return this._commentsFactory(updatedProduct.comments);
		} catch(err)
		{
			this.logger.error(err);
		}
		return this._commentsFactory(warehouseProduct.comments);
	}
	
	@asyncListener()
	public async update(
			storeId: string,
			storeProductId: string,
			commentId: string,
			@serialization(
					(comment: ICommentUpdateObject) => new Comment(comment as IComment)
			)
					updateObject: UpdateObject<Comment>
	): Promise<Comment>
	{
		let warehouseProduct = await this._getWarehouseProduct(storeId, storeProductId)
		                                 .toPromise();
		
		let commentIndex = _.findIndex(
				warehouseProduct.comments,
				comment => comment._id.toString() === commentId
		);
		
		if(commentIndex > 0)
		{
			const updatedComment = this._factory(updateObject);
			updatedComment._updatedAt = new Date();
			warehouseProduct.comments[commentIndex] = updatedComment;
		}
		
		const updatedProduct = (
				await this._warehousesProductsService.update(
						storeId,
						warehouseProduct
				)
		);
		
		return _.find(
				updatedProduct.comments,
				(comment) => comment['id'] === commentId
		) as Comment;
	}
	
	@asyncListener()
	public async increaseLikes(
			storeId: string,
			storeProductId: string,
			userId: string,
			commentId: string
	): Promise<Comment>
	{
		return this._changeRate(storeId, storeProductId, userId, commentId, "like");
	}
	
	@asyncListener()
	public async increaseDislikes(
			storeId: string,
			storeProductId: string,
			userId: string,
			commentId: string
	): Promise<Comment>
	{
		return this._changeRate(storeId, storeProductId, userId, commentId, "dislike");
	}
	
	@asyncListener()
	public async replyTo(
			storeId: string,
			storeProductId: string,
			replyCommentId: string,
			comment: ICommentCreateObject
	)
	{
		comment['replyTo'] = replyCommentId;
		await this.add(storeId, storeProductId, comment);
	}
	
	@asyncListener()
	public async delete(
			warehouseId: string,
			productId: string,
			commentIds: string[]
	): Promise<Comment[]>
	{
		this.logger.info('Deleting comments ' + commentIds);
		
		const warehouseProduct = await this._getWarehouseProduct(warehouseId, productId)
		                                   .toPromise();
		const updated = warehouseProduct.comments.filter(
				(c) =>
				{
					if(c._id == null)
					{
						return false;
					}
					
					return _.findIndex(
							commentIds,
							commentId => c._id.toString() === commentId
					) == -1;
				}
		);
		warehouseProduct.comments = this._commentsFactory(updated);
		await this._warehousesProductsService.update(
				warehouseId,
				warehouseProduct
		);
		
		return this._commentsFactory(warehouseProduct.comments);
	}
	
	protected _getWarehouseProduct(
			storeId: string,
			storeProductId: string
	): Observable<WarehouseProduct | null>
	{
		return this._warehousesProductsService
		           .getProduct(storeId, storeProductId)
		           .pipe(first());
	}
	
	private async _changeRate(
			storeId: string,
			storeProductId: string,
			userId: string,
			commentId: string,
			op: "like" | "dislike"
	): Promise<Comment | null>
	{
		let wProd = await this._getWarehouseProduct(storeId, storeProductId)
		                      .toPromise();
		const hasRated = (_userId: string, comment: Comment) =>
				!(comment.likesBy.includes(_userId) || comment.dislikesBy.includes(_userId));
		
		let comment = _.find(wProd.comments, comment => comment._id.toString() === commentId);
		
		if(comment)
		{
			if(comment.userId !== userId)
			{
				if(!hasRated(userId, comment))
				{
					if(op === "like")
					{
						++comment.likes;
						comment.likesBy.push(userId);
					}
					else
					{
						++comment.dislikes;
						comment.dislikesBy.push(userId);
					}
					
					return this.update(
							storeId,
							storeProductId,
							commentId,
							comment
					);
				}
				else
				{
					if(op === "dislike")
					{
						if(comment.likes > 0)
							--comment.likes;
						
						if(comment.likesBy.length > 0)
						{
							const index = comment.likesBy.findIndex(uId => uId === userId);
							if(index >= 0)
								comment.likesBy = comment.likesBy.splice(index, 1);
						}
					}
					else
					{
						if(comment.dislikes > 0)
							--comment.dislikes;
						
						if(comment.dislikesBy.length > 0)
						{
							const index = comment.dislikesBy.findIndex(uId => uId === userId);
							if(index >= 0)
								comment.dislikesBy = comment.dislikesBy.splice(index, 1);
						}
					}
					
					return this.update(
							storeId,
							storeProductId,
							commentId,
							comment
					);
				}
			}
			
			return comment;
		}
		
		return null;
	}
	
	private _commentsFactory(comments: IComment[])
	{
		return _.map(comments, comment => this._factory(comment));
	}
	
	protected _factory(comment: IComment)
	{
		return comment == null ? null : new Comment(comment)
	}
}
