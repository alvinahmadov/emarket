import { Injectable }              from '@angular/core';
import { TranslateService }        from '@ngx-translate/core';
import { Country, getCountryName } from '@modules/server.common/entities/GeoLocation';
import { env }                     from '../env';

@Injectable()
export class LocaleService
{
	private readonly _defaultLang: string = env.DEFAULT_LANGUAGE.split('-')[0];
	private readonly _defaultLocale: string = env.DEFAULT_LANGUAGE;
	private readonly _availableLocales: string[] = env.AVAILABLE_LOCALES.split('|');
	
	private _currentLocale: string;
	
	constructor(private readonly _translateService: TranslateService)
	{
		this._currentLocale = _translateService.currentLang;
		if(!this._translateService.getLangs())
		{
			this._translateService.addLangs(this._availableLocales);
		}
		
		if(!this._currentLocale)
		{
			this._currentLocale = this._defaultLocale;
			this._translateService.use(this._currentLocale);
		}
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
		if(!locale)
		{
			this._currentLocale = locale;
		}
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
