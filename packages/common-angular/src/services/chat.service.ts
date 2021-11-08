import { ElementRef, Injectable } from '@angular/core';
import { HttpClient }             from '@angular/common/http';
import { Observable }             from 'rxjs';
import Talk                       from 'talkjs';
import { environment }            from 'environments/environment';
import IUser                      from '@modules/server.common/interfaces/IUser';

export type ChatUser = Talk.User;
export type ChatSession = Talk.Session;
export type ChatInbox = Talk.Inbox;
export type ChatBox = Talk.Chatbox;
export type ChatPopup = Talk.Popup;
export type ChatConversation = Talk.ConversationBuilder;

@Injectable({
	            providedIn: "root"
            })
export class ChatService
{
	private readonly appId: string;
	private readonly apiBaseUrl: string = 'https://api.talkjs.com';
	private currentUser: ChatUser
	
	private _unreadCount: number = 0;
	public selectedConversationId: string;
	public selectedConversation: ChatConversation | null;
	
	constructor(
			private httpClient: HttpClient
	)
	{
		this.appId = environment.TALKJS_APP_ID;
	}
	
	public get unreadCount()
	{
		return this._unreadCount;
	}
	
	public async createCurrentSession(owner: IUser): Promise<Talk.Session>
	{
		await Talk.ready;
		
		if(!this.currentUser)
			this.currentUser = await this.createUser(owner);
		
		const sessionOptions: Talk.SessionOptions = {
			appId: this.appId,
			me:    this.currentUser
		}
		
		return new Talk.Session(sessionOptions);
	}
	
	public async getOrCreateConversation(
			session: ChatSession,
			recipient: IUser,
			conversationId?: string
	): Promise<[Talk.ConversationBuilder, string]>
	{
		try
		{
			if(!this.currentUser)
				return null;
			
			let recipientUser: Talk.User = await this.createUser(recipient);
			
			this.selectedConversationId = conversationId
			                              ?? Talk.oneOnOneId(this.currentUser, recipientUser);
			
			this.selectedConversation = session.getOrCreateConversation(this.selectedConversationId);
			this.selectedConversation.setParticipant(this.currentUser);
			this.selectedConversation.setParticipant(recipientUser);
			return [this.selectedConversation, this.selectedConversationId];
		} catch(e)
		{
			console.error({
				              message: e.message,
				              stack:   e.stack,
				              user:    recipient
			              })
		}
	}
	
	public async createInbox(
			session: Talk.Session,
			elementContainer?: ElementRef
	)
	{
		const inbox = session.createInbox({ selected: this.selectedConversation });
		inbox.on("conversationSelected",
		         (event: Talk.ConversationSelectedEvent) =>
		         {
			         if(event.conversation && this.selectedConversationId !== event.conversation.id)
			         {
				         this.selectedConversationId = event.conversation.id;
				         this.selectedConversation = session.getOrCreateConversation(
						         this.selectedConversationId
				         );
			         }
		         });
		await inbox.mount(elementContainer.nativeElement);
		return inbox;
	}
	
	public async createChatbox(
			session: Talk.Session,
			elementContainer?: ElementRef
	)
	{
		const chatbox = session.createChatbox(this.selectedConversation);
		await chatbox.mount(elementContainer.nativeElement);
		return chatbox;
	}
	
	public async createPopup(
			session: Talk.Session,
			elementContainer?: ElementRef
	)
	{
		const popup = session.createPopup(this.selectedConversation);
		await popup.mount(elementContainer.nativeElement);
		return popup;
	}
	
	public handleUnreadEvents(session: Talk.Session): ChatService
	{
		const changeHandler = (messages: Talk.UnreadConversation[]) =>
		{
			messages.forEach(() => this._unreadCount++);
		}
		session.unreads.on("change", changeHandler);
		
		return this;
	}
	
	public get messages(): Observable<object | null>
	{
		if(this.selectedConversationId)
			return this.getMessages(this.selectedConversationId);
		return null;
	}
	
	public getMessages(conversationId: string): Observable<Talk.Message[]>
	{
		return this.httpClient.get<any>(
				`${this.apiBaseUrl}/v1/${this.appId}/conversations/${conversationId}/messages/`
		);
	}
	
	public deleteMessage(conversationId: string, messageId: string): Observable<object>
	{
		return this.httpClient.delete(
				`${this.apiBaseUrl}/v1/${this.appId}/conversations/${conversationId}/messages/${messageId}`,
				{}
		);
	}
	
	protected async createUser(user): Promise<ChatUser>
	{
		const firstName = user?.firstName ?? "";
		const lastName = user?.lastName ?? "";
		const fullName = user?.fullName ?? `${firstName} ${lastName}`;
		return new Talk.User({
			                     id:       user._id.toString(),
			                     email:    user.email,
			                     name:     user.fullName ?? user.username,
			                     photoUrl: user.avatar,
			                     role:     user.role,
			                     custom:   {
				                     firstName: firstName,
				                     lastName:  lastName,
				                     fullName:  fullName
			                     }
		                     });
	}
}
