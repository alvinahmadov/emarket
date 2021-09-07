import { Injectable, OnInit } from '@angular/core';
import { TranslateService }   from '@ngx-translate/core';
import {
	getCountryName,
	countriesIdsToNamesArrayFn
}                             from '@modules/server.common/entities/GeoLocation';
import Country                from '@modules/server.common/enums/Country';
import { environment as env } from '../environments/environment';

@Injectable()
export class LocaleService
{
	private readonly _defaultLang: string = env.DEFAULT_LANGUAGE.split('-')[0];
	private readonly _defaultLocale: string = env.DEFAULT_LANGUAGE;
	private readonly _availableLocales: string[];
	
	private _currentLocale: string;
	
	constructor(private readonly _translateService: TranslateService)
	{
		if(env.AVAILABLE_LOCALES.indexOf('|') > 0)
		{
			this._availableLocales = env.AVAILABLE_LOCALES.split('|');
		}
		else
		{
			this._availableLocales = ['ru-RU'];
		}
		
		if(!this._translateService.currentLang)
		{
			this._translateService.addLangs(this._availableLocales);
			this._translateService.setDefaultLang(env.DEFAULT_LANGUAGE);
			const browserLang = this._translateService.getBrowserLang();
			this._translateService.use(
					browserLang.match(env.AVAILABLE_LOCALES)
					? browserLang
					: 'ru-RU'
			);
		}
		
		this._currentLocale = this._translateService.currentLang;
		this._translateService.setDefaultLang(this._currentLocale);
	}
	
	get defaultLang()
	{
		return this._defaultLang;
	}
	
	get defaultLocale()
	{
		return this._defaultLocale;
	}
	
	get currentLocale()
	{
		return this._currentLocale;
	}
	
	set currentLocale(locale: string)
	{
		if(locale)
		{
			this._currentLocale = locale;
		}
	}
	
	get countries()
	{
		return countriesIdsToNamesArrayFn(this._currentLocale)
	}
	
	get languages()
	{
		return []
	}
	
	translate(key: string): string
	{
		let translationResult = '';
		
		this._translateService
		    .get(key)
		    .subscribe((res) =>
		               {
			               console.log("Inside LocaleService:")
			               console.log(res)
			               console.log(translationResult)
			               translationResult = res
		               });
		
		return translationResult;
	}
	
	getCountryName(countryId: Country): string
	{
		const lang = this._translateService.currentLang;
		return getCountryName(lang, countryId);
	}
	
	selectedLang(lang: string): string
	{
		let translateLang = this._defaultLocale;
		
		this._availableLocales.forEach((locale) =>
		                               {
			                               if(lang === locale)
			                               {
				                               translateLang = locale;
			                               }
		                               })
		return translateLang;
	}
}
