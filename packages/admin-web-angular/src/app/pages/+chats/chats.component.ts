import {
	Component, ElementRef, ViewChild,
	AfterViewInit, OnDestroy, OnInit
}                                              from '@angular/core';
import { NavigationStart, Router }             from '@angular/router';
import { Subject, Subscription }               from 'rxjs';
import * as rxops                              from 'rxjs/operators';
import talkjs                                  from 'talkjs';
import Admin                                   from '@modules/server.common/entities/Admin';
import { ChatInbox, ChatService, ChatSession } from '@modules/client.common.angular2/services/chat.service';
import { AdminsService }                       from '@app/@core/data/admins.service';
import { CustomersService }                    from '@app/@core/data/customers.service';
import { StorageService }                      from '@app/@core/data/store.service';

type Conversation = talkjs.ConversationBuilder;

@Component({
	           selector:    'chats',
	           styleUrls:   ['./chats.component.scss'],
	           templateUrl: './chats.component.html'
           })
export class ChatsComponent implements OnInit, AfterViewInit, OnDestroy
{
	@ViewChild('inboxContainer')
	inboxContainer!: ElementRef;
	
	public admin$: Subscription;
	
	public selectedConversation: Conversation | null;
	public selectedConversationId: string;
	
	private _ngDestroy$: Subject<boolean> = new Subject<boolean>();
	
	public eventsSubject: Subject<Conversation> = new Subject<Conversation>();
	
	public participantId: string;
	
	public conversations: Conversation[] = [];
	
	private session: ChatSession;
	
	private inbox: ChatInbox;
	
	constructor(
			private readonly _router: Router,
			private storage: StorageService,
			private chatService: ChatService,
			private adminsService: AdminsService,
			private customersService: CustomersService,
	)
	{
	}
	
	public ngOnInit()
	{
		this._router
		    .events
		    .pipe(
				    rxops.filter((e) => e instanceof NavigationStart)
		    )
		    .subscribe(() =>
		               {
			               const navigation = this._router.getCurrentNavigation();
			               if(navigation.extras.state)
			               {
				               this.participantId = navigation.extras.state.userId;
			               }
		               });
		
	}
	
	public ngAfterViewInit()
	{
		this.admin$ = this.adminsService
		                  .getAdmin(this.storage.adminId)
		                  .pipe(rxops.takeUntil(this._ngDestroy$))
		                  .subscribe(admin =>
		                             {
			                             if(admin)
			                             {
				                             try
				                             {
					                             this.initialize(admin);
				                             } catch(err)
				                             {
					                             console.error(err);
				                             }
			                             }
		                             });
	}
	
	public ngOnDestroy(): void
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	private async initialize(admin: Admin)
	{
		if(admin)
		{
			this.session = await this.chatService
			                         .createCurrentSession(admin);
			
			if(this.participantId)
			{
				const user = await this.customersService.getCustomerById(this.participantId).toPromise();
				if(user)
				{
					[
						this.selectedConversation,
						this.selectedConversationId
					] = await this.chatService.getOrCreateConversation(this.session, user);
					this.chatService.getMessages(this.selectedConversationId)
					    .subscribe((res: any) => console.warn(res));
				}
			}
			this.inbox = await this.chatService.createInbox(
					this.session,
					this.inboxContainer
			);
		}
	}
}
