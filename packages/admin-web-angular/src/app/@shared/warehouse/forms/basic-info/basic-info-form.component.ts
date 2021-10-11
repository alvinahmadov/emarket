import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
}                                              from '@angular/forms';
import { pick }                                from 'lodash';
import { IMultiSelectOption }                  from 'angular-2-dropdown-multiselect';
import { first }                               from 'rxjs/operators';
import { TranslateService }                    from '@ngx-translate/core';
import { IWarehouseCreateObject }              from '@modules/server.common/interfaces/IWarehouse';
import { CommonUtils }                         from '@modules/server.common/utilities';
import { CarrierRouter }                       from '@modules/client.common.angular2/routers/carrier-router.service';
import { FormHelpers }                         from '@app/@shared/forms/helpers';

export type WarehouseBasicInfo = Pick<IWarehouseCreateObject,
		| 'name'
		| 'logo'
		| 'isActive'
		| 'username'
		| 'hasRestrictedCarriers'
		| 'carriersIds'
		| 'useOnlyRestrictedCarriersForDelivery'
		| 'preferRestrictedCarriersForDelivery'
		| 'ordersShortProcess'
		| 'orderCancelation'>;

export type TDelivery = 'all' | 'onlyStore' | 'preferStore';

@Component({
	           selector:    'ea-warehouse-basic-info-form',
	           styleUrls:   ['basic-info-form.component.scss'],
	           templateUrl: 'basic-info-form.component.html',
           })
export class BasicInfoFormComponent implements OnInit
{
	@ViewChild('fileInput', { static: true })
	public fileInput: any;
	
	@Input()
	readonly form: FormGroup;
	@Input()
	readonly password?: AbstractControl;
	
	public uploaderPlaceholder: string;
	
	public carriersOptions: IMultiSelectOption[];
	
	private _delivery: TDelivery = 'all';
	
	constructor(
			private readonly carrierRouter: CarrierRouter,
			private readonly translateService: TranslateService
	)
	{}
	
	public ngOnInit(): void
	{
		this.loadCarriersOptions();
		this.getUploaderPlaceholderText();
	}
	
	public get delivery(): TDelivery
	{
		return this._delivery;
	}
	
	public set delivery(value: TDelivery)
	{
		this._delivery = value;
		this.useOnlyRestrictedCarriersForDelivery.setValue(false);
		this.preferRestrictedCarriersForDelivery.setValue(false);
		
		switch(value)
		{
			case 'onlyStore':
				this.useOnlyRestrictedCarriersForDelivery.setValue(true);
				break;
			case 'preferStore':
				this.preferRestrictedCarriersForDelivery.setValue(true);
				break;
		}
	}
	
	public get name(): AbstractControl
	{
		return this.form.get('name');
	}
	
	public get logo(): AbstractControl
	{
		return this.form.get('logo');
	}
	
	public get isActive(): AbstractControl
	{
		return this.form.get('isActive');
	}
	
	public get username(): AbstractControl
	{
		return this.form.get('username');
	}
	
	public get hasRestrictedCarriers(): AbstractControl
	{
		return this.form.get('hasRestrictedCarriers');
	}
	
	public get carriersIds(): AbstractControl
	{
		return this.form.get('carriersIds');
	}
	
	public get useOnlyRestrictedCarriersForDelivery(): AbstractControl
	{
		return this.form.get('useOnlyRestrictedCarriersForDelivery');
	}
	
	public get preferRestrictedCarriersForDelivery(): AbstractControl
	{
		return this.form.get('preferRestrictedCarriersForDelivery');
	}
	
	public get showLogoMeta(): boolean
	{
		return this.logo && this.logo.value !== '';
	}
	
	public static buildForm(formBuilder: FormBuilder): FormGroup
	{
		// would be used in the parent component and injected into this.form
		return formBuilder.group({
			                         name:     [
				                         '',
				                         [
					                         Validators.required,
					                         Validators.minLength(3),
					                         Validators.maxLength(255),
				                         ],
			                         ],
			                         logo:     [
				                         '',
				                         [
					                         (control: AbstractControl) =>
					                         {
						                         const isEmpty = control.value === '';
						                         if(!isEmpty)
						                         {
							                         if(
									                         !control.value.startsWith('http') ||
									                         control.value.match(
											                         /s?:?(\/\/[^"']*\.(?:jpg|jpeg|gif|png|svg))/
									                         ) === null
							                         )
							                         {
								                         return { validUrl: true };
							                         }
						                         }
						                         return null;
					                         },
				                         ],
			                         ],
			                         isActive: [true, [Validators.required]],
			                         username: ['', [Validators.required]],
			
			                         hasRestrictedCarriers:                [false, [Validators.required]],
			                         useOnlyRestrictedCarriersForDelivery: [false],
			                         preferRestrictedCarriersForDelivery:  [false],
			                         ordersShortProcess:                   [false],
			                         carriersIds:                          [[]],
		                         });
	}
	
	public static buildPasswordForm(formBuilder: FormBuilder): AbstractControl
	{
		return new FormControl('', [Validators.required]);
	}
	
	public getValue(): WarehouseBasicInfo
	{
		const basicInfo = this.form.getRawValue() as {
			name: string;
			logo: string;
			isActive: boolean;
			username: string;
			
			hasRestrictedCarriers: boolean;
			carriersIds: string[];
			useOnlyRestrictedCarriersForDelivery: boolean;
			preferRestrictedCarriersForDelivery: boolean;
			ordersShortProcess: boolean;
		};
		
		if(!basicInfo.logo)
		{
			const letter = basicInfo.name.charAt(0).toUpperCase();
			basicInfo.logo = CommonUtils.getDummyImage(300, 300, letter);
		}
		
		return {
			isActive: basicInfo.isActive,
			name:     basicInfo.name,
			username: basicInfo.username,
			logo:     basicInfo.logo,
			...(basicInfo.hasRestrictedCarriers
			    ? {
						hasRestrictedCarriers: basicInfo.hasRestrictedCarriers,
						carriersIds:           basicInfo.carriersIds,
					}
			    : {}),
			...(basicInfo.hasRestrictedCarriers &&
			    basicInfo.carriersIds &&
			    basicInfo.carriersIds.length
			    ? {
						useOnlyRestrictedCarriersForDelivery:
						basicInfo.useOnlyRestrictedCarriersForDelivery,
						preferRestrictedCarriersForDelivery:
						basicInfo.preferRestrictedCarriersForDelivery,
					}
			    : {
						useOnlyRestrictedCarriersForDelivery: false,
						preferRestrictedCarriersForDelivery:  false,
					}),
			ordersShortProcess: basicInfo.ordersShortProcess,
			orderCancelation:   { enabled: false, onState: 0 },
		};
	}
	
	public setValue<T extends WarehouseBasicInfo>(basicInfo: T): void
	{
		FormHelpers.deepMark(this.form, 'dirty');
		
		basicInfo = Object.assign(
				{
					useOnlyRestrictedCarriersForDelivery: false,
					preferRestrictedCarriersForDelivery:  false,
					ordersShortProcess:                   false,
				},
				basicInfo
		);
		
		this.form.setValue(
				pick(basicInfo, [
					...Object.keys(this.getValue()),
					'hasRestrictedCarriers',
					'carriersIds',
					'useOnlyRestrictedCarriersForDelivery',
					'preferRestrictedCarriersForDelivery',
				])
		);
		
		const onlyStore = basicInfo.useOnlyRestrictedCarriersForDelivery;
		const preferStore = basicInfo.preferRestrictedCarriersForDelivery;
		
		if(onlyStore)
		{
			this.delivery = 'onlyStore';
		}
		else if(preferStore)
		{
			this.delivery = 'preferStore';
		}
		else
		{
			this.delivery = 'all';
		}
	}
	
	public getPassword(): string
	{
		// password is not part of warehouse
		if(!this.password)
		{
			throw new Error("Form doesn't contain password");
		}
		return this.password.value as string;
	}
	
	public setPassword(value: string)
	{
		this.password.setValue(value);
	}
	
	public deleteImg()
	{
		this.logo.setValue('');
	}
	
	private async getUploaderPlaceholderText()
	{
		const res = await this.translateService
		                      .get(['WAREHOUSE_VIEW.MUTATION.PHOTO', 'OPTIONAL'])
		                      .pipe(first())
		                      .toPromise();
		
		this.uploaderPlaceholder = `${res['WAREHOUSE_VIEW.MUTATION.PHOTO']} (${res['OPTIONAL']})`;
	}
	
	private async loadCarriersOptions()
	{
		let carriers = await this.carrierRouter
		                         .getAllActive()
		                         .pipe(first())
		                         .toPromise();
		
		carriers = carriers.filter((c) => c.isSharedCarrier);
		
		this.carriersOptions = carriers.map((c) =>
		                                    {
			                                    return {
				                                    id:   c.id,
				                                    name: `${c.firstName} ${c.lastName}`,
			                                    };
		                                    });
	}
}
