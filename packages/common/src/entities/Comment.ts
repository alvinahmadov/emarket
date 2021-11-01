import { Column }                         from 'typeorm';
import { DBObject, ModelName, Types }     from '@pyro/db';
import IComment, { ICommentCreateObject } from '../interfaces/IComment';

/**
 * Comment for product
 *
 * @class Comment
 * @extends {DBObject<IComment, ICommentCreateObject>}
 * @implements {IComment}
 */
@ModelName('Comment')
class Comment extends DBObject<IComment, ICommentCreateObject>
		implements IComment
{
	/**
	 * Customer
	 *
	 * @type {string}
	 * @memberof Comment
	 */
	@Types.String()
	@Column()
	userId: string;
	
	/**
	 * Customer
	 *
	 * @type {string}
	 * @memberof Comment
	 */
	@Types.String()
	@Column()
	productId: string;
	
	/**
	 *Comment made by customer
	 *
	 * @type {string}
	 * @memberof Comment
	 */
	@Types.String()
	@Column()
	content: string;
	
	/**
	 * Number of likes of comment
	 *
	 * @type {number}
	 * @memberof Comment
	 */
	@Types.Number(0)
	@Column()
	likes?: number;
	
	/**
	 * Number of dislikes of comment
	 *
	 * @type {number}
	 * @memberof Comment
	 * */
	@Types.Number(0)
	@Column()
	dislikes?: number;
	
	/**
	 * User to whom the comment as a reply adressed
	 *
	 * @type {number}
	 * @memberof Comment
	 * */
	@Types.String('')
	@Column()
	replyTo?: string;
	
	constructor(comment: IComment)
	{
		super(comment);
	}
}

export default Comment;
