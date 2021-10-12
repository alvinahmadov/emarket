import { Component, Input, OnInit }           from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
	IPromotion,
	IPromotionCreateObject,
}                                             from '@modules/server.common/interfaces/IPromotion';

@Component({
	           selector:    'details-info-form',
	           styleUrls:   ['./details-info-form.component.scss'],
	           templateUrl: './details-info-form.component.html',
           })
export class DetailsInfoFormComponent implements OnInit
{
	@Input()
	public readonly form: FormGroup;
	
	@Input()
	public promotionData: IPromotion;
	
	public promotionDetails: Partial<IPromotion>;
	
	constructor() {}
	
	public ngOnInit(): void
	{
		if(!this.promotionData)
		{
			this.promotionData = {
				_id:            '',
				_createdAt:     undefined,
				_updatedAt:     undefined,
				description:    [],
				active:         false,
				activeFrom:     new Date(),
				activeTo:       undefined,
				image:          "",
				product:        undefined,
				promoPrice:     0,
				purchasesCount: 0,
				title:          [],
				warehouse:      undefined,
			};
		}
		this.promotionDetails =
				this.promotionData || DetailsInfoFormComponent._initPromotionDetails();
		
		this.setValue();
	}
	
	public get image()
	{
		return this.form.get('image');
	}
	
	public static buildForm(formBuilder: FormBuilder): FormGroup
	{
		return formBuilder.group({
			                         image:          [''],
			                         active:         [true],
			                         purchasesCount: [0, Validators.min(0)],
			                         promoPrice:     [0, Validators.min(0)],
		                         });
	}
	
	public getValue()
	{
		return this.form.value as IPromotionCreateObject;
	}
	
	public setValue()
	{
		if(!this.promotionDetails) return;
		
		const promotionFormValue = {
			image:          this.promotionDetails.image || '',
			active:         this.promotionDetails.active || true,
			purchasesCount: this.promotionDetails.purchasesCount || 0,
			promoPrice:     this.promotionData.promoPrice || 0,
		};
		
		this.form.patchValue(promotionFormValue);
	}
	
	private static _initPromotionDetails(): Partial<IPromotion>
	{
		return {
			image:          null,
			active:         true,
			purchasesCount: 0,
			promoPrice:     0,
		};
	}
}
