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
{ IConversationCreateObject, IConversationFindInput } from '@modules/server.common/interfaces/IConversation';
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
	
	@asyncListener()
	public async getConversation(channelId: string): Promise<Conversation | null>
	{
		const callId = uuid();
		
		this.log.info(
				{ callId },
				'.getConversation(channelId) called'
		);
		
		const conversation: Conversation =
				      await this.Model
				                .findOne({ channelId: channelId, isDeleted: { $eq: false } })
				                .lean()
				                .exec();
		
		this.log.info(
				{
					callId,
					channelId:    channelId,
					conversation: conversation
				},
				'.getConversation(channelId) with result'
		);
		
		return conversation;
	}
	
	@observableListener()
	public getConversations(findInput: IConversationFindInput = {}): Observable<Conversation[]>
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
	public async createConversation(conversation: IConversationCreateObject): Promise<Conversation>
	{
		const callId = uuid();
		
		try
		{
			this.log.info(
					{ callId },
					'.createConversation(conversation) called'
			);
			if(!conversation)
			{
				this.log.info(
						{
							callId,
							conversation: conversation
						},
						'.createConversation(conversation) got null/undefined'
				);
				return null;
			}
			return super.create(conversation);
		} catch(err)
		{
			this.log.error(
					{
						callId,
						error: err
					},
					'.createConversation(conversation) thrown error'
			);
			return null;
		}
	}
	
	@asyncListener()
	public async removeConversation(channelId: string): Promise<void>
	{
		const callId = uuid();
		
		try
		{
			this.log.info(
					{ callId },
					'.removeConversation(channelId) called'
			);
			const conversation = await this.throwIfNotExists(channelId);
			
			this.log.info(
					{
						callId,
						conversation: conversation
					},
					'.removeConversation(channelId) has conversation'
			);
			return await super.delete(conversation.id);
		} catch(err)
		{
			this.log.error(
					{
						callId,
						error: err
					},
					'.removeConversation(channelId) thrown error'
			);
			return null;
		}
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
	
	private async _getConversations(findInput?: IConversationFindInput): Promise<Conversation[]>
	{
		let findObject = { isDeleted: { $eq: false } };
		
		if(findInput)
			findObject = _.assign(findObject,
			                      findInput.locale
			                      ? { locale: findInput.locale }
			                      : {},
			                      findInput.platform
			                      ? { platform: findInput.platform }
			                      : {},
			                      findInput.participants
			                      ?
			                      { participants: findInput.participants }
			                      : {}
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
