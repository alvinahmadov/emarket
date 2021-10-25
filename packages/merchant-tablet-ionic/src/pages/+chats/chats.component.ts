import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subject }                                  from 'rxjs';
import { first }                                    from 'rxjs/operators';
import Talk                                         from 'talkjs';
import Admin                                        from '@modules/server.common/entities/Admin';
import { ChatService, ChatSession, ChatInbox }      from '@modules/client.common.angular2/services/chat.service';
import { AdminsService }                            from 'services/admins.service';
import { CustomersService }                         from 'services/customers.service';
import { StorageService }                           from 'services/storage.service';

type Conversation = Talk.ConversationBuilder;

@Component({
	           selector:    'chats',
	           styleUrls:   ['./chats.component.scss'],
	           templateUrl: './chats.component.html'
           })
export class ChatsComponent implements OnInit
{
	@ViewChild('inboxContainer')
	public inboxContainer!: ElementRef;
	
	private session: ChatSession;
	private inbox: ChatInbox;
	
	private eventsSubject: Subject<Conversation> = new Subject<Conversation>();
	
	constructor(
			private adminsService: AdminsService,
			private customersService: CustomersService,
			private chatService: ChatService,
			private storageService: StorageService,
	)
	{}
	
	public ngOnInit()
	{
		this.loadConversations();
	}
	
	public async loadConversations()
	{
		let conversation: Conversation;
		const adminUser: Admin = await this.adminsService
		                                   .findAdmin({})
		                                   .pipe(first())
		                                   .toPromise();
		
		const merchant = await this.customersService
		                           .getCustomer(this.storageService.merchantId).toPromise();
		this.session = await this.chatService.createCurrentSession(merchant);
		
		if(adminUser)
		{
			[conversation,] = await this.chatService
			                            .getOrCreateConversation(
					                            this.session,
					                            adminUser
			                            );
		}
		
		this.inbox = await this.session.createInbox({ useBrowserHistory: false, selected: conversation });
		await this.inbox.mount(this.inboxContainer.nativeElement);
	}
	
	public openChat(conversation: Conversation)
	{
		this.eventsSubject.next(conversation);
	}
}
