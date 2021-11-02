import { injectable }                     from 'inversify';
import Logger                             from 'bunyan';
import mongoose                           from 'mongoose';
import { Observable }                     from 'rxjs';
import { first, map }                     from 'rxjs/operators';
import { _throw }                         from 'rxjs/observable/throw';
import _                                  from 'lodash';
import {
	asyncListener,
	observableListener,
	routerName, serialization
}                                         from '@pyro/io';
import { UpdateObject }                   from '@pyro/db/db-update-object';
import IComment, { ICommentCreateObject } from '@modules/server.common/interfaces/IComment';
import IPagingOptions                     from '@modules/server.common/interfaces/IPagingOptions';
import ICommentsRouter                    from '@modules/server.common/routers/ICommentRouter';
import Comment                            from '@modules/server.common/entities/Comment';
import WarehouseProduct                   from '@modules/server.common/entities/WarehouseProduct';
import IService                           from '../../services/IService';
import { createLogger }                   from '../../helpers/Log';
import { WarehousesProductsService }      from '../../services/warehouses';

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
			newComment._createdAt = new Date();
			newComment._updatedAt = new Date();
			return newComment
		};
		
		const warehouseProduct = await this._getWarehouseProduct(storeId, storeProductId)
		                                   .toPromise();
		const commentCountBefore = warehouseProduct.comments?.length;
		
		let updatedProduct: WarehouseProduct;
		
		if(warehouseProduct.comments && warehouseProduct.comments.length > 0)
		{
			warehouseProduct.comments.push(initComment(comment));
		}
		else
		{
			warehouseProduct.comments = [initComment(comment)];
		}
		
		try
		{
			updatedProduct = await this._warehousesProductsService
			                           .update(storeId, warehouseProduct);
			
			const commentCountAfter = updatedProduct.comments.length;
			
			if(commentCountBefore != commentCountAfter)
			{
				this.logger.debug(`Successfully added comments for product (${storeProductId}) of store (${storeId})`);
			}
			
			return this._commentsFactory(updatedProduct.comments);
		} catch(err)
		{
			this.logger.error(err);
		}
		return this._commentsFactory(warehouseProduct.comments);
	}
	
	@asyncListener()
	public async save(
			storeId: string,
			storeProductId: string,
			commentId: string,
			updatedComment: Comment
	): Promise<Comment>
	{
		return this.update(
				storeId,
				storeProductId,
				commentId,
				updatedComment
		);
	}
	
	@asyncListener()
	public async update(
			storeId: string,
			storeProductId: string,
			commentId: string,
			@serialization((comment: IComment) => new Comment(comment))
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
			warehouseProduct.comments[commentIndex] = this._factory(updateObject as IComment);
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
					if(c['_id'] == null || c['_id'] == undefined)
					{
						return false;
					}
					let comment = this._factory(c);
					return !commentIds.includes(comment.id);
				}
		);
		warehouseProduct.comments = this._commentsFactory(updated);
		await this._warehousesProductsService.update(
				warehouseId,
				warehouseProduct
		);
		
		return updated;
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
	
	private _commentsFactory(comments: IComment[])
	{
		return _.map(comments, comment => this._factory(comment));
	}
	
	protected _factory(comment: IComment)
	{
		return comment == null ? null : new Comment(comment)
	}
}
