import { Observable }                     from 'rxjs';
import { UpdateObject }                   from '../@pyro/db/db-update-object';
import IComment, { ICommentCreateObject } from '../interfaces/IComment';
import IPagingOptions                     from '../interfaces/IPagingOptions';
import Comment                            from '../entities/Comment';

interface ICommentsRouter
{
	get(
			storeId: string,
			storeProductId: string,
			commentId: string
	): Observable<Comment>;
	
	getComments(
			storeId: string,
			storeProductId: string,
			pagingOptions: IPagingOptions
	): Promise<Comment[]>;
	
	add(
			storeId: string,
			storeProductId: string,
			comment: ICommentCreateObject
	): Promise<Comment[]>;
	
	update(
			storeId: string,
			storeProductId: string,
			commentId: string,
			updateObject: UpdateObject<Comment>
	): Promise<Comment>;
	
	save(
			storeId: string,
			storeProductId: string,
			commentId: string,
			updatedComment: IComment
	): Promise<Comment>;
	
	delete(
			storeId: string,
			storeProductId: string,
			commentIds: string[]
	): Promise<Comment[]>;
}

export default ICommentsRouter;
