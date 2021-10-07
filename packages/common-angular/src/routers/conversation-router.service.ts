import { Injectable }            from '@angular/core';
import { Observable }            from 'rxjs';
import * as rxops                from 'rxjs/operators';
import {
	IConversation,
	IConversationCreateObject,
	TConversationFindInput,
}                                from '@modules/server.common/interfaces/IConversation';
import Conversation              from '@modules/server.common/entities/Conversation';
import IConversationRouter       from '@modules/server.common/routers/IConversationRouter';
import { Router, RouterFactory } from '../lib/router';

@Injectable()
export class ConversationRouter implements IConversationRouter
{
	private readonly router: Router;
	
	constructor(routerFactory: RouterFactory)
	{
		this.router = routerFactory.create('conversation');
	}
	
	public getAll(findInput?: TConversationFindInput): Observable<Conversation[]>
	{
		return this.router
		           .runAndObserve<IConversation[]>('getAll', findInput)
		           .pipe(
				           rxops.map(
						           conversations =>
								           conversations.map(conversation =>
										                             this._conversationFactory(conversation))
				           ),
				           rxops.share()
		           );
	}
	
	public async getConversation(channelId: string): Promise<Conversation>
	{
		return this._conversationFactory(
				await this.router.run<IConversation>(
						'getConversation',
						channelId
				));
	}
	
	public async createConversation(conversation: IConversationCreateObject): Promise<Conversation>
	{
		return this._conversationFactory(
				await this.router.run<IConversation>(
						'createConversation',
						conversation
				));
	}
	
	public async removeConversation(channelId: string): Promise<void>
	{
		return await this.router.run<void>(
				'removeConversation',
				channelId
		);
	}
	
	protected _conversationFactory(conversation: IConversation): Conversation
	{
		return conversation == null ? null : new Conversation(conversation);
	}
}
