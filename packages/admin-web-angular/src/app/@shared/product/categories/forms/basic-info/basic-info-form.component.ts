import {
	Component,
	ViewChild,
	ElementRef,
	Input,
	OnInit,
	AfterViewInit
}                                        from '@angular/core';
import {
	FormGroup,
	Validators,
	AbstractControl,
	FormBuilder,
}                                        from '@angular/forms';
import { TranslateService }              from '@ngx-translate/core';
import isUrl                             from 'is-url';
import _                                 from 'lodash';
import { first }                         from 'rxjs/operators';
import { IProductsCategoryCreateObject } from '@modules/server.common/interfaces/IProductsCategory';

@Component({
	           selector:    'ea-product-category-basic-info-form',
	           templateUrl: 'basic-info-form.component.html',
	           styleUrls:   ['basic-info-form.component.scss'],
           })
export class BasicInfoFormComponent implements OnInit, AfterViewInit
{
	@ViewChild('imagePreview', { static: true })
	public imagePreviewElement: ElementRef;
	
	@Input()
	public category: { title: string; image: string };
	
	public uploaderPlaceholder: string;
	
	public readonly form: FormGroup = this.fb.group({
		                                                name:  ['', Validators.required],
		                                                image: [
			                                                '',
			                                                [
				                                                (control: AbstractControl) =>
				                                                {
					                                                const imageUrl = control.value;
					
					                                                if(!isUrl(imageUrl) && !_.isEmpty(imageUrl))
					                                                {
						                                                return { invalidUrl: true };
					                                                }
					
					                                                return null;
				                                                },
			                                                ],
		                                                ],
	                                                });
	
	constructor(
			private readonly fb: FormBuilder,
			private readonly _langTranslateService: TranslateService
	)
	{}
	
	public get image()
	{
		return this.form.get('image');
	}
	
	public get name()
	{
		return this.form.get('name');
	}
	
	public get isFormModelValid(): boolean
	{
		return this.form.valid;
	}
	
	public get showImageMeta()
	{
		return this.image && this.image.value !== '';
	}
	
	public get usedLanguage()
	{
		const usedLanguage = this._langTranslateService.currentLang;
		switch(usedLanguage)
		{
			case 'en-US':
				return 'en-US';
			
			case 'ru-RU':
				return 'ru-RU';
			
			default:
				return 'ru-RU';
		}
	}
	
	public get createObject()
	{
		const usedLanguage = this.usedLanguage;
		
		const categoryObject: IProductsCategoryCreateObject = {
			name: [{ locale: usedLanguage, value: this.name.value }],
		};
		if(this.showImageMeta)
		{
			categoryObject.image = this.image.value;
		}
		
		return categoryObject;
	}
	
	public getEditObject(currentCategory)
	{
		const usedLanguage = this.usedLanguage;
		const newCategoryNames = currentCategory._nameLocaleValues.map(
				({ locale, value }) =>
				{
					return locale === usedLanguage
					       ? {
								locale: usedLanguage,
								value:  this.name.value,
							}
					       : { locale, value };
				}
		);
		if(!newCategoryNames.some((c) => c.locale === usedLanguage))
		{
			newCategoryNames.push({
				                      locale: usedLanguage,
				                      value:  this.name.value,
			                      });
		}
		
		const categoryRaw: IProductsCategoryCreateObject = {
			name:  newCategoryNames,
			image: this.image.value,
		};
		
		return categoryRaw;
	}
	
	public ngOnInit()
	{
		if(this.category)
		{
			this.name.setValue(this.category.title);
			this.image.setValue(this.category.image);
		}
		
		this.getUploaderPlaceholderText();
	}
	
	public deleteImg()
	{
		this.image.setValue('');
	}
	
	public ngAfterViewInit()
	{
		this._setupLogoUrlValidation();
	}
	
	private async getUploaderPlaceholderText()
	{
		this.uploaderPlaceholder = await this._langTranslateService
		                                     .get('CATEGORY_VIEW.CREATE.PHOTO_OPTIONAL')
		                                     .pipe(first())
		                                     .toPromise();
	}
	
	private _setupLogoUrlValidation()
	{
		this.imagePreviewElement.nativeElement.onload = () =>
		{
			this.image.setErrors(null);
		};
		
		this.imagePreviewElement.nativeElement.onerror = () =>
		{
			if(this.showImageMeta)
			{
				this.image.setErrors({ invalidUrl: true });
			}
		};
	}
}
