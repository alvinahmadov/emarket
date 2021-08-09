import { Injectable }       from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ILocaleMember }    from '@modules/server.common/interfaces/ILocale';

class ProductTransientViewModel
{
	public title: string;
	public description: string;
	
	constructor()
	{
		this.title = '';
		this.description = '';
	}
}

@Injectable()
export class ProductLocalesService
{
	// TODO: Set default lang and locale from config
	private readonly _defaultLang: string = 'ru-RU';
	private readonly _defaultLocale: string = 'ru-RU';
	private _productTransientProperties = new ProductTransientViewModel();
	
	public currentLocale: string;
	
	constructor(private readonly _translateService: TranslateService) {}
	
	public get isServiceStateValid(): boolean
	{
		return (
				this._productTransientProperties.title !== '' &&
				this._productTransientProperties.description !== ''
		);
	}
	
	/**
	 * Get current product member and returns the translation equivalent.
	 * @param member  Current product member to pass.
	 * @param langChoice  Optional language of choice
	 * that function use to translate, if not specified just use the current context language.
	 * @returns String value of the current member translation.
	 */
	getTranslate(member: ILocaleMember[], langChoice?: string): string
	{
		if(!member || member.length <= 0)
		{
			return '';
		}
		
		const productMember: ILocaleMember =
				member.find((x) =>
						            x.locale.startsWith(
				langChoice || this._translateService.currentLang
						            )
				) ||
				// Use default lang
				member.find((x) => x.locale.startsWith(this._defaultLang)) ||
				// Or first
				member[0];
		// this is for pictures, they support url instead of value
		return productMember.value || productMember['url'];
	}
	
	getMemberValue(productMember: ILocaleMember[]): string
	{
		let valueMember = this._getProductLocaleMember(productMember);
		
		if(valueMember === undefined)
		{
			// Use default
			const useDefaultLocale = true;
			valueMember = this._getProductLocaleMember(
					productMember,
					useDefaultLocale
			);
		}
		
		if(valueMember === undefined && productMember)
		{
			// Or use first
			valueMember = productMember[0];
		}
		
		// When we create new product it has no members at all, because of that we use empty string for this case
		return valueMember ? valueMember.value : '';
	}
	
	setMemberValue(memberKey: string, memberValue: string)
	{
		this._productTransientProperties[memberKey] = memberValue;
	}
	
	assignPropertyValue(member: ILocaleMember[], memberKey: string)
	{
		const memberValue = member.find((m) => m.locale === this.currentLocale);
		const memberValueToAssign = this._productTransientProperties[memberKey];
		
		if(memberValue !== undefined)
		{
			memberValue.value = memberValueToAssign;
		}
		else
		{
			const locale: ILocaleMember = {
				locale: this.currentLocale,
				value: memberValueToAssign,
			};
			member.push(locale);
		}
	}
	
	takeSelectedLang(lang: string): string
	{
		let translateLang = this._defaultLocale;
		switch(lang)
		{
			case 'en-US':
				translateLang = 'en-US';
				break;
			case 'ru-RU':
				translateLang = 'ru-RU';
				break;
		}
		return translateLang;
	}
	
	private _getProductLocaleMember(
			productMember: ILocaleMember[],
			defaultLocale?: boolean
	): ILocaleMember
	{
		if(productMember)
		{
			return productMember.find(
					(t) =>
							t.locale ===
							(defaultLocale ? this._defaultLocale : this.currentLocale)
			);
		}
	}
}
