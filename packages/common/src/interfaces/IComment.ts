import { DBCreateObject, DBRawObject, PyroObjectId } from '@pyro/db';

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
	content: string;
	
	/**
	 * User to whom the comment adressed
	 * */
	replyTo?: string;
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
}

export default IComment;
