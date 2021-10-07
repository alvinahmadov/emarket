import { DBCreateObject, DBRawObject, PyroObjectId } from '@pyro/db';
import ICustomer                                     from './ICustomer';

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
	 *Comment made by customer
	 * */
	content: string;
}

interface IComment extends ICommentCreateObject, DBRawObject
{
	_id: PyroObjectId;
	
	/**
	 * User to whom the comment adressed
	 * */
	replyTo?: string;
	
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
