import {
	Component,
	ElementRef,
	ViewChild,
	OnInit,
	AfterViewInit,
	OnDestroy
}                                   from '@angular/core';
import { NavigationStart, Router }  from '@angular/router';
import { Subject, Subscription }    from 'rxjs';
import { first, filter, takeUntil } from 'rxjs/operators';
import Talk                         from 'talkjs';
import IUser                        from '@modules/server.common/interfaces/IUser';
import Admin                        from '@modules/server.common/entities/Admin';
import Customer                     from '@modules/server.common/entities/Customer';
import {
	ChatService,
	ChatSession,
	ChatInbox
}                                   from '@modules/client.common.angular2/services/chat.service';
import { AdminsService }            from 'services/admins.service';
import { CustomersService }         from 'services/customers.service';
import { StorageService }           from 'services/storage.service';
import { WarehousesService }        from 'services/warehouses.service';

type Conversation = Talk.ConversationBuilder;

@Component({
	           selector:    'chats',
	           styleUrls:   ['./chats.component.scss'],
	           templateUrl: './chats.component.html'
           })
export class ChatsComponent implements OnInit, AfterViewInit, OnDestroy
{
	@ViewChild('inboxContainer')
	public inboxContainer!: ElementRef;
	
	public merchant$: Subscription;
	
	public selectedConversation: Conversation | null;
	public selectedConversationId: string;
	
	private session: ChatSession;
	private inbox: ChatInbox;
	
	public participantId: string;
	public admin: Admin;
	
	private _ngDestroy$: Subject<boolean> = new Subject<boolean>();
	
	constructor(
			private readonly _router: Router,
			private adminsService: AdminsService,
			private customersService: CustomersService,
			private warehousesService: WarehousesService,
			private chatService: ChatService,
			private storageService: StorageService,
	)
	{}
	
	public async ngOnInit()
	{
		this._router
		    .events
		    .pipe(filter((e) => e instanceof NavigationStart))
		    .subscribe(() =>
		               {
			               const navigation = this._router.getCurrentNavigation();
			               if(navigation.extras.state)
			               {
				               this.participantId = navigation.extras.state.userId;
			               }
		               });
		
		this.adminsService
		    .getAdmins()
		    .pipe(
				    first(),
				    takeUntil(this._ngDestroy$)
		    ).subscribe((admins) =>
		                {
			                if(Array.isArray(admins))
				                this.admin = admins[0]
			                else
				                this.admin = admins
		                });
		
	}
	
	public async ngAfterViewInit()
	{
		const warehouseId = this.storageService.warehouseId;
		const store = await this.warehousesService
		                        .getStoreById(warehouseId)
		                        .toPromise();
		this.merchant$ = this.customersService
		                     .findCustomers(
				                     {
					                     role:     "merchant",
					                     username: store.username
				                     }
		                     ).pipe(takeUntil(this._ngDestroy$))
		                     .subscribe((customers: Customer[]) =>
		                                {
			                                if(customers)
			                                {
				                                try
				                                {
					                                this.initialize(customers[0]);
				                                } catch(err)
				                                {
					                                console.error(err);
				                                }
			                                }
		                                });
	}
	
	public ngOnDestroy(): void
	{
		this._ngDestroy$.next(true);
		this._ngDestroy$.complete();
	}
	
	private async initialize(merchant: Customer)
	{
		if(merchant)
		{
			this.session = await this.chatService
			                         .createCurrentSession(merchant);
			
			if(this.participantId)
			{
				const user = await this.customersService
				                       .getCustomer(this.participantId)
				                       .toPromise();
				if(user)
				{
					await this.initializeConversation(user);
				}
			}
			else if(this.admin)
			{
				await this.initializeConversation({
					                                  _id:      this.admin._id.toString(),
					                                  email:    this.admin.email,
					                                  username: this.admin.username ?? this.admin.email,
					                                  avatar:   this.admin.avatar,
					                                  role:     this.admin.role
				                                  });
			}
			
			this.inbox = await this.chatService.createInbox(
					this.session,
					this.inboxContainer
			);
			
			this.chatService.handleUnreadEvents(this.session);
		}
	}
	
	private async initializeConversation(recipient: IUser)
	{
		[
			this.selectedConversation,
			this.selectedConversationId
		] = await this.chatService.getOrCreateConversation(this.session, recipient);
		
	}
}
