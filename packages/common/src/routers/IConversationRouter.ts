import { Observable }             from 'rxjs';
import { CreateObject }           from '@pyro/db/db-create-object';
import Conversation               from '../entities/Conversation';
import { TConversationFindInput } from '../interfaces/IConversation';

interface IConversationRouter
{
	getAll(findInput?: TConversationFindInput): Observable<Conversation[]>;
	
	getConversation(channelId: string): Promise<Conversation>;
	
	createConversation(createObject: CreateObject<Conversation>): Promise<Conversation>;
	
	removeConversation(channelId: string): Promise<void>;
}

export default IConversationRouter;
