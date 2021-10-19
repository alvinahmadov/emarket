import {
	Component,
	ViewChild,
	EventEmitter,
	AfterViewInit,
}                                                           from '@angular/core';
import { FormBuilder, FormControl, FormGroup }              from '@angular/forms';
import { NgbActiveModal }                                   from '@ng-bootstrap/ng-bootstrap';
import { TranslateService }                                 from '@ngx-translate/core';
import { ToasterService }                                   from 'angular2-toaster';
import { WarehouseAuthRouter }                              from '@modules/client.common.angular2/routers/warehouse-auth-router.service';
import { BasicInfoFormComponent, ContactInfoFormComponent } from '../forms';
import { PaymentsSettingsFormComponent }                    from '../forms/payments-settings/payments-settings-form.component';
import { LocationFormComponent }                            from '../../forms/location';

@Component({
	           selector:    'ea-warehouse-mutation',
	           styleUrls:   ['./warehouse-mutation.component.scss'],
	           templateUrl: './warehouse-mutation.component.html',
           })
export class WarehouseMutationComponent implements AfterViewInit
{
	public loading: boolean;
	
	public BUTTON_DONE: string = 'BUTTON_DONE';
	public BUTTON_NEXT: string = 'BUTTON_NEXT';
	public BUTTON_PREV: string = 'BUTTON_PREV';
	
	@ViewChild('basicInfoForm')
	public basicInfoForm: BasicInfoFormComponent;
	
	@ViewChild('contactInfoForm', { static: true })
	public contactInfoForm: ContactInfoFormComponent;
	
	@ViewChild('locationForm')
	public locationForm: LocationFormComponent;
	
	@ViewChild('paymentsSettingsForm')
	public paymentsSettingsForm: PaymentsSettingsFormComponent;
	
	public mapCoordEmitter = new EventEmitter<number[]>();
	public mapGeometryEmitter = new EventEmitter<any>();
	
	public readonly form: FormGroup = this.formBuilder.group({
		                                                         basicInfo:   BasicInfoFormComponent.buildForm(this.formBuilder),
		                                                         password:    BasicInfoFormComponent.buildPasswordForm(this.formBuilder),
		                                                         contactInfo: ContactInfoFormComponent.buildForm(this.formBuilder),
		                                                         location:    LocationFormComponent.buildForm(this.formBuilder),
	                                                         });
	
	public readonly basicInfo = this.form.get('basicInfo') as FormControl;
	public readonly contactInfo = this.form.get('contactInfo') as FormControl;
	public readonly location = this.form.get('location') as FormControl;
	public readonly password = this.form.get('password') as FormControl;
	
	constructor(
			private readonly activeModal: NgbActiveModal,
			private readonly formBuilder: FormBuilder,
			private readonly toasterService: ToasterService,
			private readonly warehouseAuthRouter: WarehouseAuthRouter,
			private readonly _translateService: TranslateService
	)
	{}
	
	public get buttonDone()
	{
		return this._translate(this.BUTTON_DONE);
	}
	
	public get buttonNext()
	{
		return this._translate(this.BUTTON_NEXT);
	}
	
	public get buttonPrevious()
	{
		return this._translate(this.BUTTON_PREV);
	}
	
	public get isValidContactInfo()
	{
		return this.contactInfoForm.validForm !== undefined
		       ? this.contactInfoForm.validForm
		       : true;
	}
	
	public ngAfterViewInit()
	{
		// This hack is need because the styles of 'ng-bootstrap' modal and google autocomplete api
		// collide and autocomplete field just doesn't show without larger z-index.
		setTimeout(() =>
		           {
			           const elementRef = document.querySelector(
					           'body > div.pac-container.pac-logo'
			           );
			
			           if(elementRef)
			           {
				           elementRef['style']['zIndex'] = 10000;
			           }
		           }, 2000);
		
		if(this.locationForm)
		{
			this.locationForm.setDefaultCoords();
		}
	}
	
	public onCoordinatesChanges(coords: number[])
	{
		this.mapCoordEmitter.emit(coords);
	}
	
	public onGeometrySend(geometry: any)
	{
		this.mapGeometryEmitter.emit(geometry);
	}
	
	public async createWarehouse()
	{
		try
		{
			// GeoJSON use reversed order for coordinates from our implementation.
			// we use lat => lng but GeoJSON use lng => lat.
			const geoLocationInput = this.locationForm.getValue();
			// geoLocationInput.loc.coordinates.reverse();
			
			this.loading = true;
			const w = await this.warehouseAuthRouter
			                    .register({
				                              warehouse: {
					                              ...this.basicInfoForm.getValue(),
					                              ...this.contactInfoForm.getValue(),
					                              geoLocation:          geoLocationInput,
					                              isPaymentEnabled:     this.paymentsSettingsForm
							                                                    .isPaymentEnabled,
					                              paymentGateways:      this.paymentsSettingsForm.paymentsGateways,
					                              isCashPaymentEnabled: this.paymentsSettingsForm
							                                                    .isCashPaymentEnabled,
				                              },
				                              password:  this.basicInfoForm.getPassword(),
			                              });
			this.loading = false;
			this.toasterService.pop(
					'success',
					`Warehouse ${w.name} was created!`
			);
			
			this.activeModal.close();
		} catch(err)
		{
			this.loading = false;
			this.toasterService.pop(
					'error',
					`Error in creating warehouse: "${err.message}"`
			);
		}
	}
	
	public cancel()
	{
		this.activeModal.dismiss('canceled');
	}
	
	private _translate(key: string): string
	{
		let translationResult = '';
		
		this._translateService
		    .get(key)
		    .subscribe((res) =>
		               {
			               translationResult = res;
		               });
		
		return translationResult;
	}
}
