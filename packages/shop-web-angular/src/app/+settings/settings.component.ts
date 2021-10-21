import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { TranslateService }                     from '@ngx-translate/core';
import { DOCUMENT }                             from '@angular/common';
import { getLanguage }                          from '@modules/server.common/data/languages';
import { environment }                          from 'environments/environment';
import { StorageService }                       from 'app/services/storage';

@Component({
	           selector:    'settings',
	           styleUrls:   ['./settings.component.scss'],
	           templateUrl: './settings.component.html',
           })
export class SettingsComponent implements OnInit
{
	public selectedLang: string;
	public defaultLanguage = '';
	public dir: 'ltr' | 'rtl';
	
	constructor(
			public translateService: TranslateService,
			@Inject(DOCUMENT)
			public document: Document,
			private storage: StorageService
	)
	{
		this.defaultLanguage = environment.DEFAULT_LANGUAGE;
		const languages = environment.AVAILABLE_LOCALES;
		
		if(translateService.currentLang)
		{
			const current = translateService.currentLang;
			this.selectedLang = current;
			translateService.setDefaultLang(current);
		}
		else
		{
			translateService.addLangs(languages.split('|'));
			translateService.setDefaultLang('ru-RU');
			
			const browserLang = translateService.getBrowserLang();
			
			if(this.defaultLanguage)
			{
				translateService.use(this.defaultLanguage);
			}
			else
			{
				let language = browserLang.match(languages)
				               ? browserLang
				               : 'ru-RU';
				translateService.use(language)
			}
			
			this.selectedLang = this.translateService.currentLang;
		}
	}
	
	public ngOnInit() {}
	
	public switchLanguage(language: string)
	{
		this.translateService.use(language);
		
		const langAbbreviation = language.substr(0, 2);
		
		if(language.startsWith('he') || language.startsWith('ar'))
		{
			this.dir = 'rtl';
		}
		else
		{
			this.dir = 'ltr';
		}
		this.document.documentElement.dir = this.dir;
		this.document.documentElement.lang = langAbbreviation;
	}
	
	public translateLanguage(languageCode: string): string
	{
		return getLanguage(languageCode);
	}
}
