import Logger                                         from 'bunyan';
import { injectable }                                 from 'inversify';
import _                                              from 'lodash'
import { v1 as uuid }                                 from 'uuid';
import { Observable, of }                             from 'rxjs';
import { concat, exhaustMap, tap }                    from 'rxjs/operators';
import {
	asyncListener,
	observableListener,
	routerName
}                                                     from '@pyro/io';
import { DBService }                                  from '@pyro/db-server';
import IConversation,
{ IConversationCreateObject, TConversationFindInput } from '@modules/server.common/interfaces/IConversation';
import Conversation                                   from '@modules/server.common/entities/Conversation';
import IConversationRouter                            from '@modules/server.common/routers/IConversationRouter';
import IService                                       from '../IService';
import { createLogger }                               from '../../helpers/Log';

@injectable()
@routerName('conversation')
export class ConversationsService extends DBService<Conversation>
		implements IConversationRouter, IService
{
	public readonly DBObject: any = Conversation;
	protected readonly log: Logger = createLogger({ name: 'conversationsService' });
	
	@observableListener()
	public getAll(findInput?: TConversationFindInput): Observable<Conversation[]>
	{
		const callId = uuid();
		
		this.log.info(
				{ callId },
				'.getAll(findInput?) called'
		);
		
		return of(null)
				.pipe(
						concat(this.existence),
						exhaustMap(() => this._getConversations()),
						tap({
							    next:  (conversations: Conversation[]) =>
							           {
								           this.log.info(
										           { callId, conversations },
										           '.getAll() emitted next value'
								           );
							           },
							    error: (err: any) =>
							           {
								           this.log.error(
										           { callId, err },
										           '.getAll() thrown error!'
								           );
							           }
						    })
				);
	}
	
	@asyncListener()
	public async getConversation(channelId: string): Promise<Conversation | null>
	{
		const callId = uuid();
		
		this.log.info(
				{ callId },
				'.getConversation(channelId) called'
		);
		return await (this.Model
		                  .findOne({ channelId: channelId, isDeleted: { $eq: false } })
		                  .lean()
		                  .exec()) as Conversation;
	}
	
	@asyncListener()
	public async createConversation(conversation: IConversationCreateObject): Promise<Conversation>
	{
		return await super.create(conversation);
	}
	
	@asyncListener()
	public async removeConversation(channelId: string): Promise<void>
	{
		const conversation = await this.throwIfNotExists(channelId);
		await super.delete(conversation.id);
	}
	
	public async throwIfNotExists(channelId: string)
	{
		let ex = await this.findOne({ channelId: channelId })
		if(!ex)
		{
			throw Error(`Conversation with channel '${channelId}' does not exists!`);
		}
		
		return ex;
	}
	
	private async _getConversations(findInput?: TConversationFindInput): Promise<Conversation[]>
	{
		let findObject = _.assign(
				{ isDeleted: { $eq: false } },
				findInput.locale
				? { locale: findInput.locale }
				: {},
				findInput.platform
				? { platform: findInput.platform }
				: {},
				findInput.participants ?
				{ participants: findInput.participants }
				                       :
				{}
		)
		
		return _.map(
				(await this.Model
				           .find(findObject)
				           .lean()
				           .exec()) as IConversation[],
				(conversation) => new Conversation(conversation)
		);
	}
}
