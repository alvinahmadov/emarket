import {
	Component,
	Input,
	ViewChild,
	ElementRef,
	AfterViewInit,
	OnInit,
}                                 from '@angular/core';
import {
	AbstractControl,
	FormBuilder,
	FormGroup,
	Validators,
}                                 from '@angular/forms';
import { TranslateService }       from '@ngx-translate/core';
import { first }                  from 'rxjs/operators';
import { IMultiSelectOption }     from 'angular-2-dropdown-multiselect';
import _                          from 'lodash';
import isUrl                      from 'is-url';
import { IWarehouseCreateObject } from '@modules/server.common/interfaces/IWarehouse';
import { CarrierRouter }          from '@modules/client.common.angular2/routers/carrier-router.service';
import { FormHelpers }            from '@app/@shared/forms/helpers';

export type WarehouseManageTabsDetails = Pick<IWarehouseCreateObject,
		| 'name'
		| 'logo'
		| 'isActive'
		| 'hasRestrictedCarriers'
		| 'carriersIds'
		| 'isManufacturing'
		| 'isCarrierRequired'
		| 'useOnlyRestrictedCarriersForDelivery'
		| 'preferRestrictedCarriersForDelivery'
		| 'ordersShortProcess'
		| 'orderCancelation'
		| 'inStoreMode'
		| 'carrierCompetition'>;

type TDelivery = 'all' | 'onlyStore' | 'preferStore';

@Component({
	           selector: 'ea-warehouse-manage-tabs-details',
	           styleUrls: ['./warehouse-manage-tabs-details.component.scss'],
	           templateUrl: './warehouse-manage-tabs-details.component.html',
           })
export class WarehouseManageTabsDetailsComponent
		implements OnInit, AfterViewInit
{
	@ViewChild('fileInput')
	public fileInput: ElementRef;
	
	@ViewChild('logoPreview')
	public logoPreviewElement: ElementRef;
	
	@Input()
	public readonly form: FormGroup;
	
	public uploaderPlaceholder: string;
	
	public carriersOptions: IMultiSelectOption[];
	// orderCancelationOptions can be moved to a separate file
	public orderCancelationOptions = [
		{ text: 'ORDERING', value: 1 },
		{ text: 'START_PROCESSING', value: 2 },
		{ text: 'START_ALLOCATION', value: 3 },
		{ text: 'ALLOCATED', value: 4 },
		{ text: 'START_PACKAGING', value: 5 },
		{ text: 'PACKAGED', value: 6 },
		{ text: 'CARRIER_TAKE_WORK', value: 7 },
		{ text: 'CARRIER_GOT_IT', value: 8 },
		{ text: 'CARRIER_START_DELIVERY', value: 9 },
		{ text: 'DELIVERED', value: 11 },
	];
	
	private _delivery: TDelivery = 'all';
	
	constructor(
			private readonly _carrierRouter: CarrierRouter,
			private readonly _translateService: TranslateService
	)
	{}
	
	public get delivery()
	{
		return this._delivery;
	}
	
	public set delivery(value)
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
	
	public get inStoreMode()
	{
		return this.form.get('inStoreMode');
	}
	
	public get name()
	{
		return this.form.get('name');
	}
	
	public get logo()
	{
		return this.form.get('logo');
	}
	
	public get isActive()
	{
		return this.form.get('isActive');
	}
	
	public get hasRestrictedCarriers()
	{
		return this.form.get('hasRestrictedCarriers');
	}
	
	public get carriersIds()
	{
		return this.form.get('carriersIds');
	}
	
	public get showLogoMeta()
	{
		return this.logo && this.logo.value !== '';
	}
	
	public get isManufacturing()
	{
		return this.form.get('isManufacturing');
	}
	
	public get isCarrierRequired()
	{
		return this.form.get('isCarrierRequired');
	}
	
	public get useOnlyRestrictedCarriersForDelivery()
	{
		return this.form.get('useOnlyRestrictedCarriersForDelivery');
	}
	
	public get preferRestrictedCarriersForDelivery()
	{
		return this.form.get('preferRestrictedCarriersForDelivery');
	}
	
	public get ordersShortProcess()
	{
		return this.form.get('ordersShortProcess');
	}
	
	public get enabledOrderCancelation()
	{
		return this.form.get('enabledOrderCancelation');
	}
	
	public static buildForm(formBuilder: FormBuilder): FormGroup
	{
		// would be used in the parent component and injected into this.form
		return formBuilder.group({
			                         name: [
				                         '',
				                         [
					                         Validators.required,
					                         Validators.minLength(3),
					                         Validators.maxLength(255),
				                         ],
			                         ],
			                         logo: [
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
			                         isActive: [true, [Validators.required]],
			                         isManufacturing: [true, [Validators.required]],
			                         isCarrierRequired: [true, [Validators.required]],
			                         hasRestrictedCarriers: [false, [Validators.required]],
			                         useOnlyRestrictedCarriersForDelivery: [false],
			                         preferRestrictedCarriersForDelivery: [false],
			                         carriersIds: [[]],
			                         ordersShortProcess: [false],
			                         inStoreMode: [false],
			                         carrierCompetition: [false],
			
			                         enabledOrderCancelation: [false],
			                         stateOrderCancelation: [0],
		                         });
	}
	
	public ngOnInit(): void
	{
		this.getUploaderPlaceholderText();
		this.loadCarriersOptions();
	}
	
	public ngAfterViewInit()
	{
		this._setupLogoUrlValidation();
	}
	
	public getValue(): WarehouseManageTabsDetails
	{
		const basicInfo = this.form.getRawValue() as {
			name: string;
			logo: string;
			isActive: boolean;
			isManufacturing: boolean;
			isCarrierRequired: boolean;
			hasRestrictedCarriers: boolean;
			carriersIds: string[];
			useOnlyRestrictedCarriersForDelivery: boolean;
			preferRestrictedCarriersForDelivery: boolean;
			ordersShortProcess: boolean;
			inStoreMode: boolean;
			carrierCompetition: boolean;
			
			enabledOrderCancelation: boolean;
			stateOrderCancelation: number;
		};
		
		return {
			ordersShortProcess: basicInfo.ordersShortProcess,
			isActive: basicInfo.isActive,
			inStoreMode: basicInfo.inStoreMode,
			carrierCompetition: basicInfo.carrierCompetition,
			isManufacturing: basicInfo.isManufacturing,
			isCarrierRequired: basicInfo.isCarrierRequired,
			name: basicInfo.name,
			logo: basicInfo.logo,
			...(basicInfo.hasRestrictedCarriers
			    ? {
						hasRestrictedCarriers: basicInfo.hasRestrictedCarriers,
						carriersIds: basicInfo.carriersIds,
					}
			    : {
						hasRestrictedCarriers: false,
						carriersIds: basicInfo.carriersIds,
					}),
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
						preferRestrictedCarriersForDelivery: false,
					}),
			orderCancelation: {
				enabled: basicInfo.enabledOrderCancelation,
				onState: Number(basicInfo.stateOrderCancelation),
			},
		};
	}
	
	public setValue<T extends WarehouseManageTabsDetails>(basicInfo: T)
	{
		FormHelpers.deepMark(this.form, 'dirty');
		
		basicInfo = Object.assign(
				{
					useOnlyRestrictedCarriersForDelivery: false,
					preferRestrictedCarriersForDelivery: false,
					ordersShortProcess: false,
					inStoreMode: false,
					carrierCompetition: false,
					enabledOrderCancelation: basicInfo.orderCancelation
					                         ? basicInfo.orderCancelation.enabled
					                         : false,
					stateOrderCancelation: basicInfo.orderCancelation
					                       ? basicInfo.orderCancelation.onState
					                       : 0,
				},
				basicInfo
		);
		
		//Remove orderCancelation from the list becouse its  not actually form control
		//can be improved
		const filteredValues = Object.keys(this.getValue());
		_.remove(filteredValues, (e) => e === 'orderCancelation');
		
		this.form.setValue(
				_.pick(basicInfo, [
					...filteredValues,
					'hasRestrictedCarriers',
					'carriersIds',
					'useOnlyRestrictedCarriersForDelivery',
					'preferRestrictedCarriersForDelivery',
					'enabledOrderCancelation',
					'stateOrderCancelation',
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
	
	public deleteImg()
	{
		this.logo.setValue('');
	}
	
	private _setupLogoUrlValidation()
	{
		this.logoPreviewElement.nativeElement.onload = () =>
		{
			this.logo.setErrors(null);
		};
		
		this.logoPreviewElement.nativeElement.onerror = () =>
		{
			if(this.showLogoMeta)
			{
				this.logo.setErrors({ invalidUrl: true });
			}
		};
	}
	
	private async getUploaderPlaceholderText()
	{
		const res = await this._translateService
		                      .get(['WAREHOUSE_VIEW.MUTATION.PHOTO', 'OPTIONAL'])
		                      .pipe(first())
		                      .toPromise();
		
		this.uploaderPlaceholder = `${res['WAREHOUSE_VIEW.MUTATION.PHOTO']} (${res['OPTIONAL']})`;
	}
	
	private async loadCarriersOptions()
	{
		let carriers = await this._carrierRouter
		                         .getAllActive()
		                         .pipe(first())
		                         .toPromise();
		
		carriers = carriers.filter((c) => c.isSharedCarrier);
		
		this.carriersOptions = carriers.map((c) =>
		                                    {
			                                    return {
				                                    id: c.id,
				                                    name: `${c.firstName} ${c.lastName}`,
			                                    };
		                                    });
	}
}
