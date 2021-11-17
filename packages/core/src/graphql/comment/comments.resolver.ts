import { UseGuards }                 from '@nestjs/common';
import { AuthGuard }                 from '@nestjs/passport';
import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { Observable }                from 'rxjs';
import {
	ICommentInput,
	ICommentsRetrieveInput,
	ICommentRetrieveInput,
	ICommentCreateInput,
	ICommentUpdateInput,
	ICommentDeleteInput,
	ICommentRateInput,
}                                    from '@modules/server.common/routers/ICommentRouter';
import Comment                       from '@modules/server.common/entities/Comment';
import { CommentsService }           from '../../services/comments';

@Resolver('Comment')
export class CommentsResolver
{
	constructor(private readonly _commentsService: CommentsService) {}
	
	@Query('comment')
	public async getComment(_, retrieveInput: ICommentRetrieveInput): Promise<Comment>
	{
		return this._commentsService.get(
				retrieveInput.storeId,
				retrieveInput.storeProductId,
				retrieveInput.commentId
		).toPromise();
	}
	
	@Query('comments')
	public getComments(_, retrieveInput: ICommentsRetrieveInput): Observable<Comment[]>
	{
		let pagingOptions = retrieveInput.pagingOptions ?? {};
		
		if(!pagingOptions || (pagingOptions && !pagingOptions.sort))
		{
			pagingOptions.sort = { field: '_createdAt', sortBy: 'desc' };
		}
		
		return this._commentsService.getComments(
				retrieveInput.storeId,
				retrieveInput.storeProductId,
				pagingOptions
		);
	}
	
	@Query()
	public async getCountOfComments(_, countInput: ICommentInput): Promise<number>
	{
		const comments = await this._commentsService.getComments(
				countInput.storeId,
				countInput.storeProductId
		).toPromise();
		
		return comments.length;
	}
	
	@Mutation()
	public async addComment(_, createInput: ICommentCreateInput): Promise<Comment[]>
	{
		return this._commentsService.add(
				createInput.storeId,
				createInput.storeProductId,
				createInput.comment
		);
	}
	
	@Mutation()
	@UseGuards(AuthGuard('jwt'))
	public async updateComment(_, updateInput: ICommentUpdateInput): Promise<Comment>
	{
		return this._commentsService.update(
				updateInput.storeId,
				updateInput.storeProductId,
				updateInput.commentId,
				updateInput.comment
		);
	}
	
	@Mutation('increaseCommentLikes')
	public async increaseLikes(_, rateInput: ICommentRateInput): Promise<Comment>
	{
		return this._commentsService.increaseLikes(
				rateInput.storeId,
				rateInput.storeProductId,
				rateInput.userId,
				rateInput.commentId
		);
	}
	
	@Mutation('increaseCommentDislikes')
	public async increaseDislikes(_, rateInput: ICommentRateInput): Promise<Comment>
	{
		return this._commentsService.increaseDislikes(
				rateInput.storeId,
				rateInput.storeProductId,
				rateInput.userId,
				rateInput.commentId
		);
	}
	
	@Mutation()
	@UseGuards(AuthGuard('jwt'))
	public async deleteCommentsByIds(_, deleteInput: ICommentDeleteInput): Promise<Comment[]>
	{
		return await this._commentsService.delete(
				deleteInput.storeId,
				deleteInput.storeProductId,
				deleteInput.commentIds
		);
	}
}
