import {
	Component,
	ViewChild,
	ViewEncapsulation,
	ElementRef,
	OnInit
}                           from '@angular/core';
import { RouterOutlet }     from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { v4 as uuid }       from 'uuid'
import IUser                from '@modules/server.common/interfaces/IUser';
import Admin                from '@modules/server.common/entities/Admin';
import {
	ChatPopup,
	ChatService,
	ChatSession
}                           from '@modules/client.common.angular2/services/chat.service';
import { AppState }         from './app.service';
import { AdminsService }    from './services/admins.service';
import { environment }      from 'environments/environment'
import { CustomersService } from 'app/services/customer.service';
import { StorageService }   from 'app/services/storage';

export interface ToolbarController
{
	toolbarDisabled: boolean;
}

export const ROOT_SELECTOR = 'app';

/**
 * App Component
 * Top Level Component
 */
@Component({
	           selector:      'app',
	           styleUrls:     ['./app.component.scss'],
	           templateUrl:   './app.component.html',
	           encapsulation: ViewEncapsulation.None,
           })
export class AppComponent implements OnInit
{
	@ViewChild(RouterOutlet)
	public routerOutlet: RouterOutlet;
	
	@ViewChild('chatpopupContainer')
	public chatpopupContainer: ElementRef;
	
	private session: ChatSession;
	
	private chatPopup: ChatPopup;
	
	constructor(
			public appState: AppState,
			private translateService: TranslateService,
			private storageService: StorageService,
			private customersService: CustomersService,
			private adminsService: AdminsService,
			private chatService: ChatService
	)
	{
		// Here we initialize translates for the all app, when loads for the first time. Do not remove it
		const defaultLanguage = environment.DEFAULT_LANGUAGE ?? 'ru-RU';
		const availableLanguages = environment.AVAILABLE_LOCALES;
		
		if(translateService.currentLang)
		{
			const current = translateService.currentLang;
			translateService.setDefaultLang(current);
		}
		else
		{
			translateService.addLangs(availableLanguages.split('|'));
			translateService.setDefaultLang(defaultLanguage);
			
			const browserLang = translateService.getBrowserLang();
			translateService.use(
					browserLang.match(availableLanguages)
					? browserLang
					: defaultLanguage
			);
		}
		
	}
	
	public ngOnInit()
	{
		this.initializeChat()
	}
	
	private async initializeChat()
	{
		let customer: IUser;
		let admin: Admin;
		const isLogged = this.storageService.isLogged();
		
		admin = await this.adminsService.getAdmins().toPromise();
		if(isLogged)
		{
			customer = await this.customersService
			                     .getCustomerById(this.storageService.userId)
			                     .toPromise();
		}
		else
		{
			customer = {
				_id:      uuid(),
				username: "Customer",
				role:     "guest",
				email:    "customer@emarket.com"
			};
		}
		if(customer)
		{
			if(!customer.firstName)
				customer.firstName = customer.username;
			this.session = await this.chatService
			                         .createCurrentSession(customer);
			
			if(this.chatpopupContainer)
			{
				await this.chatService.getOrCreateConversation(this.session, {
					_id:      admin._id,
					username: "Emarket Admin",
					email:    admin.email,
					avatar:   admin.avatar,
					role:     "admin"
				});
				this.chatPopup = await this.chatService.createPopup(
						this.session,
						this.chatpopupContainer
				);
			}
		}
	}
	
	public get isToolbarDisabled()
	{
		const serverConnection = Number(this.storageService.serverConnection);
		return (
				this.routerOutlet == null ||
				serverConnection === 0 ||
				!this.routerOutlet.isActivated ||
				(this.routerOutlet.component as ToolbarController)
						.toolbarDisabled === true
		);
	}
	
	public get isChatDisabled()
	{
		const serverConnection = Number(this.storageService.serverConnection);
		return (
				this.routerOutlet == null ||
				serverConnection === 0 ||
				!this.routerOutlet.isActivated
		);
	}
}
