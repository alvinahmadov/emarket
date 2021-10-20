import { Component, Input, OnDestroy, OnInit }         from '@angular/core';
import { NbMenuService, NbSidebarService, NbMenuItem } from '@nebular/theme';
import { TranslateService }                            from '@ngx-translate/core';
import { Subject, Observable }                         from 'rxjs';
import * as rxops                                      from 'rxjs/operators';
import Admin                                           from '@modules/server.common/entities/Admin';
import { ChatService }                                 from '@modules/client.common.angular2/services/chat.service';
import { AdminsService }                               from '@app/@core/data/admins.service';
import { StorageService }                              from '@app/@core/data/store.service';

@Component({
	           selector:    'ngx-header',
	           styleUrls:   ['./header.component.scss'],
	           templateUrl: './header.component.html',
           })
export class HeaderComponent implements OnInit, OnDestroy
{
	@Input()
	public position = 'normal';
	
	public admin$: Observable<Admin>;
	
	public adminMenu: NbMenuItem[];
	
	public notificationCount: number = 0;
	public unreadMessageCount: number = 0;
	
	private ngDestroy$ = new Subject<void>();
	
	constructor(
			private sidebarService: NbSidebarService,
			private menuService: NbMenuService,
			private adminsService: AdminsService,
			private chatsService: ChatService,
			private storage: StorageService,
			private translateService: TranslateService
	)
	{
		this.initialize();
		this._applyTranslationOnSmartTable();
		this.admin$ = this.adminsService.getAdmin(this.storage.adminId);
	}
	
	public ngOnInit()
	{
		this.admin$
		    .pipe(rxops.takeUntil(this.ngDestroy$))
		    .subscribe(
				    (admin) => this.chatsService
				                   .createCurrentSession(admin)
				                   .then(() => this.unreadMessageCount = this.chatsService.unreadCount)
		    );
	}
	
	private async initialize()
	{
		this.adminMenu = [
			{
				title: this.getTranslation('HEADER_VIEW.PROFILE'),
				link:  '/profile',
			},
			{
				title: this.getTranslation('HEADER_VIEW.LOG_OUT'),
				link:  '/auth/logout',
			},
		];
	}
	
	public getTranslation(prefix: string)
	{
		let result = '';
		this.translateService.get(prefix).subscribe((res) =>
		                                            {
			                                            result = res;
		                                            });
		return result;
	}
	
	public get chatBadge()
	{
		return this.unreadMessageCount > 0 ? this.unreadMessageCount.toString() : '';
	}
	
	public get notificationBadge()
	{
		return this.notificationCount > 0 ? this.notificationCount.toString() : '';
	}
	
	public toggleSidebar(): boolean
	{
		this.sidebarService.toggle(true, 'menu-sidebar');
		return false;
	}
	
	public toggleSettings(): boolean
	{
		this.sidebarService.toggle(false, 'settings-sidebar');
		return false;
	}
	
	public navigateHome()
	{
		this.menuService.navigateHome('/dashboard');
	}
	
	public startSearch()
	{
		return false;
	}
	
	public ngOnDestroy()
	{
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
	
	private _applyTranslationOnSmartTable()
	{
		this.translateService.onLangChange.subscribe(() => this.initialize());
	}
}
