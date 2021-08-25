import { Injectable, OnInit } from '@angular/core';
import { TranslateService }   from '@ngx-translate/core';
import {
	getCountryName,
	countriesIdsToNamesArrayFn
}                             from '@modules/server.common/entities/GeoLocation';
import Country                from '@modules/server.common/enums/Country';
import { env }                from '../env';

@Injectable()
export class LocaleService implements OnInit
{
	private readonly _defaultLang: string = env.DEFAULT_LANGUAGE.split('-')[0];
	private readonly _defaultLocale: string = env.DEFAULT_LANGUAGE;
	private readonly _availableLocales: string[] = env.AVAILABLE_LOCALES.split('|');
	
	private _currentLocale: string;
	
	constructor(private readonly _translateService: TranslateService)
	{}
	
	ngOnInit()
	{
		this._currentLocale = localStorage.getItem('_language') ?? this._defaultLocale;
		this._translateService.addLangs(this._availableLocales);
		this._translateService.use(this._currentLocale);
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
		    .subscribe((res) => translationResult = res);
		
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
				                               translateLang = locale;
		                               })
		return translateLang;
	}
}
