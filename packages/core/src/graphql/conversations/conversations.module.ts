import { Module }                from '@nestjs/common';
import { ConversationsResolver } from './conversations.resolver';

@Module({
	        providers: [ConversationsResolver]
        })
export class ConversationsModule {}
