import { Entity, Column }                           from 'typeorm';
import { ModelName, DBObject, Schema, Types }       from '../@pyro/db';
import IConversation, { IConversationCreateObject } from '../interfaces/IConversation';
import IPlatform                                    from '../interfaces/IPlatform';

/**
 * Represent Device (e.g. Table or Browser, used by someone to access one of apps)
 *
 * @class Device
 * @extends {DBObject<IDeviceRawObject, IDeviceCreateObject>}
 * @implements {IDeviceRawObject}
 */
@ModelName('Conversation')
@Entity({ name: 'conversations' })
class Conversation extends DBObject<IConversation, IConversationCreateObject>
		implements IConversation
{
	/**
	 * ChannelID used for chat
	 *
	 * @type {string}
	 * @memberof Device
	 */
	@Schema({ type: String, required: true })
	@Column()
	channelId: string;
	
	/**
	 * Ids of users participating in conversation
	 * */
	@Schema([String])
	participants: string[];
	
	/**
	 * Platform of the device (browser, ios, android, etc)
	 *
	 * @type {IPlatform}
	 * @memberof Device
	 */
	@Types.String('browser')
	@Column()
	platform: IPlatform;
	
	/**
	 * Language for chat
	 *
	 * @type {ILanguage}
	 * @memberof Device
	 */
	@Types.String('ru-RU')
	@Column()
	locale: string;
	
	@Types.Boolean(false)
	@Column()
	isDeleted: boolean;
}

export default Conversation;