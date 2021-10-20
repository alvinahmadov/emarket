import { Component }        from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NbThemeService }   from '@nebular/theme';
import { getLanguage }      from '@modules/server.common/data/languages';
import { StateService }     from '@app/@core/data/state.service';
import { StorageService }   from '@app/@core/data/store.service';
import { environment }      from 'environments/environment';

@Component({
	           selector:    'ngx-theme-settings',
	           styleUrls:   ['./theme-settings.component.scss'],
	           templateUrl: './theme-settings.component.html',
           })
export class ThemeSettingsComponent
{
	public layouts = [];
	public sidebars = [];
	
	public languages: Array<{ name: string; value: string }> = [];
	
	public readonly themes = [
		{
			value: 'everlight',
			name:  'Ever Light',
		},
		{
			value: 'everdark',
			name:  'Ever Dark',
		},
		{
			value: 'default',
			name:  'White',
		},
		{
			value: 'cosmic',
			name:  'Cosmic',
		},
		{
			value: 'corporate',
			name:  'Corporate',
		},
		{
			value: 'dark',
			name:  'Dark',
		},
	];
	
	public currentTheme = 'corporate';
	public defaultLanguage = '';
	public selectedLanguage = '';
	
	constructor(
			protected stateService: StateService,
			public translate: TranslateService,
			private storageService: StorageService,
			private themeService: NbThemeService
	)
	{
		this.defaultLanguage = environment.DEFAULT_LANGUAGE;
		this.initialize();
		
		this.stateService
		    .getLayoutStates()
		    .subscribe((layouts: any[]) => (this.layouts = layouts));
		
		this.stateService
		    .getSidebarStates()
		    .subscribe((sidebars: any[]) => (this.sidebars = sidebars));
	}
	
	private initialize()
	{
		const availableLanguages = environment.AVAILABLE_LOCALES.split('|');
		
		if(availableLanguages)
		{
			for(const language of availableLanguages)
			{
				this.languages.push({
					                    name:  getLanguage(language),
					                    value: language
				                    });
			}
		}
		else
		{
			this.languages.push({
				                    name:  getLanguage(this.defaultLanguage ?? 'en-US'),
				                    value: this.defaultLanguage
			                    });
		}
		
		this.translate.addLangs(availableLanguages);
		this.translate.setDefaultLang(this.defaultLanguage);
		
		const browserLang = this.translate.getBrowserLang();
		
		if(this.storageService.locale)
		{
			this.selectedLanguage = this.storageService.locale;
		}
		else
		{
			if(this.defaultLanguage)
			{
				this.selectedLanguage = this.defaultLanguage;
			}
			else
			{
				this.selectedLanguage = browserLang.match(environment.AVAILABLE_LOCALES)
				                        ? browserLang
				                        : 'ru-RU'
			}
		}
		
		this.storageService.locale = this.selectedLanguage;
		this.translate.use(this.selectedLanguage);
		
		if(this.storageService.theme)
		{
			this.currentTheme = this.storageService.theme;
			this.themeService.changeTheme(this.currentTheme);
		}
	}
	
	public toggleTheme()
	{
		this.themeService.changeTheme(this.currentTheme);
		this.storageService.theme = this.currentTheme;
	}
	
	public switchLanguage()
	{
		this.translate.use(this.selectedLanguage);
		this.storageService.locale = this.selectedLanguage;
		if(this.translate.currentLang.includes('he') || this.translate.currentLang.includes('ar'))
		{
			this.stateService.setSidebarState(this.sidebars[1]);
		}
		else
		{
			this.stateService.setSidebarState(this.sidebars[0]);
		}
	}
	
	public layoutSelect(layout: any): boolean
	{
		this.layouts = this.layouts.map((l: any) =>
		                                {
			                                l.selected = false;
			                                return l;
		                                });
		
		layout.selected = true;
		this.stateService.setLayoutState(layout);
		return false;
	}
	
	public sidebarSelect(sidebars: any): boolean
	{
		this.sidebars = this.sidebars.map((s: any) =>
		                                  {
			                                  s.selected = false;
			                                  return s;
		                                  });
		
		sidebars.selected = true;
		this.stateService.setSidebarState(sidebars);
		return false;
	}
}
