import { DBCreateObject, DBRawObject, PyroObjectId } from '../@pyro/db';
import IPlatform                                     from './IPlatform';

export interface IConversationCreateObject extends DBCreateObject
{
	/**
	 * Channel id of conversation that exists
	 * in TalkJS service
	 *
	 * @type {string | null}
	 * @memberOf IConversationCreateObject
	 * */
	channelId: string;
	
	/**
	 * Ids of users participating in conversation
	 * */
	participants?: string[];
	
	/**
	 * Platform of owner
	 *
	 * @default browser
	 *
	 * @type {string}
	 * @memberOf IConversationCreateObject
	 * */
	platform?: IPlatform;
	
	/**
	 * Language of conversation
	 *
	 * @default ru-RU
	 * @type {string}
	 * @memberOf IConversationCreateObject
	 * */
	locale?: string;
}

export interface IConversationFindInput
{
	channelId?: string;
	participants?: string[];
	platform?: IPlatform;
	locale?: string;
}

export interface IConversation extends IConversationCreateObject, DBRawObject
{
	_id: PyroObjectId;
}

export default IConversation;
