import { Observable }                                 from 'rxjs';
import { UpdateObject }                               from '../@pyro/db/db-update-object';
import { ICommentCreateObject, ICommentUpdateObject } from '../interfaces/IComment';
import IPagingOptions                                 from '../interfaces/IPagingOptions';
import Comment                                        from '../entities/Comment';
import { CreateObject }                               from '@pyro/db/db-create-object';

export interface ICommentInput
{
	storeId: string;
	storeProductId: string;
}

export interface ICommentsRetrieveInput extends ICommentInput
{
	pagingOptions?: IPagingOptions
}

export interface ICommentRetrieveInput extends ICommentInput
{
	commentId: string
}

export interface ICommentCreateInput extends ICommentInput
{
	comment: ICommentCreateObject
}

export interface ICommentUpdateInput extends ICommentRetrieveInput
{
	comment: ICommentUpdateObject
}

export interface ICommentDeleteInput extends ICommentInput
{
	commentIds: string[];
}

export interface ICommentRateInput extends ICommentRetrieveInput
{
	userId: string;
}

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
	): Observable<Comment[]>;
	
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
	): Promise<boolean>;
	
}

export default ICommentsRouter;
