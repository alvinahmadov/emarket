import { Observable }           from 'rxjs';
import { UpdateObject }         from '../@pyro/db/db-update-object';
import { ICommentCreateObject } from '../interfaces/IComment';
import IPagingOptions           from '../interfaces/IPagingOptions';
import Comment                  from '../entities/Comment';
import { CreateObject } from '@pyro/db/db-create-object';

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
	
	increaseLikes(
			storeId: string,
			storeProductId: string,
			userId: string,
			commentId: string
	): Promise<Comment>;
	
	increaseDislikes(
			storeId: string,
			storeProductId: string,
			userId: string,
			commentId: string
	): Promise<Comment>;
	
	replyTo(
			storeId: string,
			storeProductId: string,
			replyCommentId: string,
			comment: CreateObject<Comment>
	): Promise<void>;
	
	delete(
			storeId: string,
			storeProductId: string,
			commentIds: string[]
	): Promise<Comment[]>;
	
}

export default ICommentsRouter;
