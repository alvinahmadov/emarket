import { Component, OnInit, ViewChild, ViewEncapsulation, } from '@angular/core';
import { RouterOutlet }                                     from '@angular/router';
import { TranslateService }                                 from '@ngx-translate/core';
import { AppState }                                         from './app.service';
import { Store }                                            from './services/store';
import { environment }                                      from '../environments/environment'

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
	           selector: 'app',
	           encapsulation: ViewEncapsulation.None,
	           styles: [
		           `
			html,
			body,
			app,
			mat-sidenav-container {
				margin: 0;
				width: 100%;
				height: 100%;
				background-color: #eeeeee;
			}

			.app-content {
				width: 100%;
				height: 100%;
				background-color: #eeeeee;
			}

			.app-content.toolbar-enabled {
				padding-top: 64px;
				height: 100%;
			}
		`,
	           ],
	           template: `
		<toolbar *ngIf="!isToolbarDisabled"></toolbar>
		<div
			class="app-content"
			[ngClass]="{ 'toolbar-enabled': !isToolbarDisabled }"
		>
			<router-outlet></router-outlet>
		</div>
	`,
           })
export class AppComponent implements OnInit
{
	@ViewChild(RouterOutlet)
	public routerOutlet: RouterOutlet;
	
	constructor(
			public appState: AppState,
			private translateService: TranslateService,
			private store: Store
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
	
	public get isToolbarDisabled()
	{
		const serverConnection = Number(this.store.serverConnection);
		return (
				this.routerOutlet == null ||
				serverConnection === 0 ||
				!this.routerOutlet.isActivated ||
				(this.routerOutlet.component as ToolbarController)
						.toolbarDisabled === true
		);
	}
	
	ngOnInit()
	{
		console.log('Initial App State', this.appState.state);
	}
}
