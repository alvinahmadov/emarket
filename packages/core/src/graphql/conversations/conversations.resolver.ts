import { Mutation, Query, Resolver } from '@nestjs/graphql';
// import { UseGuards }                 from '@nestjs/common';
// import { AuthGuard }                 from '@nestjs/passport';
import { first }                     from 'rxjs/operators';
import {
	IConversationCreateObject,
	IConversationFindInput
}                                    from '@modules/server.common/interfaces/IConversation';
import { ConversationsService }      from '../../services/conversation';

@Resolver('Conversation')
export class ConversationsResolver
{
	constructor(private readonly _conversationsService: ConversationsService) {}
	
	@Query('conversation')
	async getConversation(_, { id }: { id: string })
	{
		return this._conversationsService.get(id).pipe(first()).toPromise();
	}
	
	@Query('conversations')
	async getConversations(
			_,
			{ findInput }: { findInput: IConversationFindInput }
	)
	{
		return this._conversationsService.getConversations(findInput).toPromise();
	}
	
	@Mutation()
	// @UseGuards(AuthGuard('jwt'))
	async createConversation(
			_,
			{ createInfo }: { createInfo: IConversationCreateObject }
	)
	{
		console.log(createInfo)
		return this._conversationsService.createConversation(createInfo);
	}
	
	@Mutation()
	async removeConversation(_, { channelId }: { channelId: string })
	{
		await this._conversationsService.throwIfNotExists(channelId);
		return this._conversationsService.remove(channelId);
	}
}
