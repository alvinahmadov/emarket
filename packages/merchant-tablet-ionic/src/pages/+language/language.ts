import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT }                  from '@angular/common';
import { TranslateService }          from '@ngx-translate/core';
import { getLanguage }               from '@modules/server.common/data/languages';
import ILanguage                     from '@modules/server.common/interfaces/ILanguage';
import { DeviceRouter }              from '@modules/client.common.angular2/routers/device-router.service';
import { environment as env }        from 'environments/environment';
import { StorageService }            from 'services/storage.service';

@Component({
	           selector:    'page-language',
	           templateUrl: 'language.html',
	           styleUrls:   ['./language.scss'],
           })
export class LanguagePage implements OnInit
{
	public language: ILanguage;
	public dir: 'ltr' | 'rtl';
	
	public OK: string = 'OK';
	public CANCEL: string = 'CANCEL';
	public PREFIX: string = 'LANGUAGE_VIEW.';
	public selected: string;
	
	constructor(
			public translate: TranslateService,
			private _deviceRouter: DeviceRouter,
			private storageService: StorageService,
			@Inject(DOCUMENT) private document: Document
	)
	{}
	
	public ngOnInit()
	{
		if(!this.translate.currentLang)
			if(this.storageService.locale)
				this.translate.currentLang = this.storageService.locale;
		const availableLanguages = env.AVAILABLE_LOCALES.split('|');
		this.selected = this.storageService.locale;
		this.language = this.storageService.locale as ILanguage;
		this.translate.addLangs(availableLanguages);
	}
	
	public get buttonOK(): string
	{
		return this._translate(this.PREFIX + this.OK);
	}
	
	public get buttonCancel(): string
	{
		return this._translate(this.PREFIX + this.CANCEL);
	}
	
	public translateLanguage(locale: string): string
	{
		return getLanguage(locale);
	}
	
	public switchLanguage(language: string)
	{
		this._deviceRouter.updateLanguage(
				localStorage.getItem('_deviceId'),
				this.language
		);
		this.storageService.locale = language;
		this.translate.use(language);
		
		const currentLang = localStorage.getItem('_language');
		
		const langAbbreviation = currentLang.substr(0, 2);
		
		if(langAbbreviation === 'he' || langAbbreviation === 'ar')
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
	
	private _translate(key: string): string
	{
		let translationResult = '';
		this.translate
		    .get(key)
		    .subscribe((res) => translationResult = res);
		return translationResult;
	}
}
