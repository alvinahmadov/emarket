import { Injectable }            from '@angular/core';
import _                         from 'lodash';
import { Observable }            from 'rxjs';
import { map, share }            from 'rxjs/operators';
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
	
	public getComments(
			storeId: string,
			storeProductId: string,
			pagingOptions: IPagingOptions
	): Observable<Comment[]>
	{
		return this.router
		           .runAndObserve<IComment[]>(
				           'getComments',
				           storeId,
				           storeProductId,
				           pagingOptions
		           )
		           .pipe(
				           map(comments => _.map(comments, (comment) => this._factory(comment))),
				           share()
		           );
		
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
	): Promise<boolean>
	{
		return this.router
		           .run<boolean>('delete', storeId, storeProductId, commentIds);
	}
	
	public async increaseLikes(
			storeId: string,
			storeProductId: string,
			userId: string,
			commentId: string
	): Promise<Comment>
	{
		const comment = await this.router.run<IComment>(
				'increaseLikes',
				storeId,
				storeProductId,
				userId,
				commentId
		);
		
		return this._factory(comment);
	}
	
	public async increaseDislikes(
			storeId: string,
			storeProductId: string,
			userId: string,
			commentId: string
	): Promise<Comment>
	{
		const comment = await this.router.run<IComment>(
				'increaseDislikes',
				storeId,
				storeProductId,
				userId,
				commentId
		);
		
		return this._factory(comment);
	}
	
	public async replyTo(
			storeId: string,
			storeProductId: string,
			replyCommentId: string,
			comment: ICommentCreateObject
	): Promise<void>
	{
		await this.router.run<IComment>(
				'replyTo',
				storeId,
				storeProductId,
				replyCommentId,
				comment
		);
	}
	
	public async update(
			storeId: string,
			storeProductId: string,
			commentId: string,
			updateObject: IComment
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
