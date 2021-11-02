// import { UseGuards }                 from '@nestjs/common';
// import { AuthGuard }                 from '@nestjs/passport';
import { Mutation, Query, Resolver } from '@nestjs/graphql';
import Logger                        from 'bunyan';
import { map }                       from 'rxjs/operators';
import Comment                       from '@modules/server.common/entities/Comment';
import { CommentsService }           from '../../services/comments';
import { createLogger }              from '../../helpers/Log';

@Resolver('Comment')
export class CommentsResolver
{
	protected readonly logger: Logger = createLogger({
		                                                 name: 'commentsResolver',
		                                                 ns:   'graphql'
	                                                 });
	
	constructor(private readonly _commentsService: CommentsService) {}
	
	@Query('comment')
	public async getComment(
			_,
			{ storeId, storeProductId, commentId }
	): Promise<Comment>
	{
		this.logger.info('.getComment(findParams: ICommentFindParams)');
		return this._commentsService
		           .get(
				           storeId,
				           storeProductId,
				           commentId
		           )
		           .pipe(map(comment =>
		                     {
			                     this.logger.debug('Got comment', { storeId, storeProductId, comment });
			                     return comment;
		                     }))
		           .toPromise();
	}
	
	@Query('comments')
	public async getComments(
			_,
			{ storeId, storeProductId, pagingOptions = {} }
	): Promise<Comment[]>
	{
		if(!pagingOptions || (pagingOptions && !pagingOptions['sort']))
		{
			pagingOptions['sort'] = { field: '_createdAt', sortBy: 'desc' };
		}
		
		return this._commentsService
		           .getComments(
				           storeId,
				           storeProductId,
				           pagingOptions
		           );
	}
	
	@Query()
	public async getCountOfComments(
			_,
			{ storeId, storeProductId }
	): Promise<number>
	{
		const comments = await this._commentsService.getComments(storeId, storeProductId);
		return comments.length;
	}
	
	@Mutation()
	// @UseGuards(AuthGuard('jwt'))
	public async deleteCommentsByIds(
			_,
			{
				storeId,
				storeProductId,
				commentIds
			}
	): Promise<Comment[]>
	{
		return await this._commentsService
		                 .delete(storeId, storeProductId, commentIds)
	}
	
	@Mutation()
	public async addComment(
			_, { storeId, storeProductId, comment }
	): Promise<Comment[]>
	{
		return await this._commentsService.add(storeId, storeProductId, comment);
	}
	
	@Mutation()
	// @UseGuards(AuthGuard('jwt'))
	public async updateComment(
			_,
			{ storeId, storeProductId, commentId, comment }
	): Promise<Comment>
	{
		return this._commentsService
		           .save(
				           storeId,
				           storeProductId,
				           commentId,
				           comment
		           );
	}
}
