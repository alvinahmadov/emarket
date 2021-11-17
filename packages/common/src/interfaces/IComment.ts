import {
	PyroObjectId,
	DBCreateObject,
	DBRawObject
} from '@pyro/db';

export interface ICommentCreateObject extends DBCreateObject
{
	/**
	 * Customer
	 *
	 * @type {string}
	 * @memberof Comment
	 */
	userId: string;
	
	/**
	 * Id of product under which is comment
	 * */
	productId: string;
	
	/**
	 *Comment made by customer
	 * */
	message: string;
	
	/**
	 * User to whom the comment adressed
	 * */
	replyTo?: string;
}

export interface ICommentUpdateObject extends DBCreateObject
{
	userId?: string;
	
	productId?: string;
	
	message?: string;
	
	replyTo?: string;
	
	likes?: number;
	
	dislikes?: number;
	
	likesBy?: string[];
	
	dislikesBy?: string[];
}

interface IComment extends ICommentCreateObject, DBRawObject
{
	_id: PyroObjectId;
	
	/**
	 * Number of likes of comment
	 * */
	likes?: number;
	
	/**
	 * Number of dislikes of comment
	 * */
	dislikes?: number;
	
	likesBy?: string[];
	
	dislikesBy?: string[];
	
	deleteRequested?: boolean;
}

export default IComment;
