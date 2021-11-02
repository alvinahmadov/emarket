import { Injectable }            from '@angular/core';
import _                         from 'lodash';
import { Observable }            from 'rxjs';
import { map }                   from 'rxjs/operators';
import { UpdateObject }          from '@pyro/db/db-update-object';
import IComment, {
	ICommentCreateObject
}                                from '@modules/server.common/interfaces/IComment';
import ICommentsRouter           from '@modules/server.common/routers/ICommentRouter';
import Comment                   from '@modules/server.common/entities/Comment';
import IPagingOptions            from '@modules/server.common/interfaces/IPagingOptions';
import { Router, RouterFactory } from '../lib/router';

@Injectable()
export class CommentsRouter implements ICommentsRouter
{
	private readonly router: Router;
	
	constructor(routerFactory: RouterFactory)
	{
		this.router = routerFactory.create('comment');
	}
	
	public get(
			storeId: string,
			storeProductId: string,
			commentId: string
	): Observable<Comment>
	{
		return this.router
		           .runAndObserve<IComment>('get', storeId, storeProductId, commentId)
		           .pipe(
				           map(comment => this._factory(comment))
		           );
	}
	
	public async getComments(
			storeId: string,
			storeProductId: string,
			pagingOptions: IPagingOptions
	): Promise<Comment[]>
	{
		const comments = await this.router
		                           .run<IComment[]>(
				                           'getComments',
				                           storeId,
				                           storeProductId,
				                           pagingOptions
		                           );
		
		return _.map(comments, (comment) => this._factory(comment));
	}
	
	public async add(
			storeId: string,
			storeProductId: string,
			comment: ICommentCreateObject
	): Promise<Comment[]>
	{
		const comments = await this.router
		                           .run<IComment[]>('add', storeId, storeProductId, comment);
		
		return _.map(comments, c => this._factory(c));
	}
	
	public async delete(
			storeId: string,
			storeProductId: string,
			commentIds: string[]
	): Promise<Comment[]>
	{
		const comments = await this.router
		                           .run<IComment[]>('delete', storeId, storeProductId, commentIds);
		
		return _.map(comments, c => this._factory(c));
	}
	
	public async save(
			storeId: string,
			storeProductId: string,
			commentId: string,
			updatedComment: IComment
	): Promise<Comment>
	{
		const comment = await this.router
		                          .run<IComment>(
				                          'save',
				                          storeId,
				                          storeProductId,
				                          commentId,
				                          updatedComment
		                          );
		
		return this._factory(comment);
	}
	
	public async update(
			storeId: string,
			storeProductId: string,
			commentId: string,
			updateObject: UpdateObject<Comment>
	): Promise<Comment>
	{
		const comment = await this.router
		                          .run<IComment>(
				                          'update',
				                          storeId,
				                          storeProductId,
				                          commentId,
				                          updateObject
		                          );
		
		return this._factory(comment);
	}
	
	protected _factory(comment: IComment)
	{
		return comment == null
		       ? null
		       : new Comment(comment);
	}
}
