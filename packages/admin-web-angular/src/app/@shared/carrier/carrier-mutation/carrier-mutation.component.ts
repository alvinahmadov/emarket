import {
	Component,
	ViewChild,
	EventEmitter,
	AfterViewInit,
}                                              from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ToasterService }                      from 'angular2-toaster';
import { NgbActiveModal }                      from '@ng-bootstrap/ng-bootstrap';
import { TranslateService }                    from '@ngx-translate/core';

import { ICarrierCreateObject }   from '@modules/server.common/interfaces/ICarrier';
import CommonUtils                from '@modules/server.common/utilities/common';
import { CarrierRouter }          from '@modules/client.common.angular2/routers/carrier-router.service';
import { BasicInfoFormComponent } from '../forms';
import { LocationFormComponent }  from '../../forms/location';

@Component({
	           selector:    'ea-carrier-mutation',
	           styleUrls:   ['./carrier-mutation.component.scss'],
	           templateUrl: './carrier-mutation.component.html',
           })
export class CarrierMutationComponent implements AfterViewInit
{
	@ViewChild('basicInfoForm')
	public basicInfoForm: BasicInfoFormComponent;
	
	@ViewChild('locationForm')
	public locationForm: LocationFormComponent;
	
	public readonly form: FormGroup = this.formBuilder
	                                      .group({
		                                             basicInfo: BasicInfoFormComponent.buildForm(this.formBuilder),
		                                             location:  LocationFormComponent.buildForm(this.formBuilder),
		                                             password:  BasicInfoFormComponent.buildPasswordForm(this.formBuilder),
	                                             });
	
	public readonly basicInfo = this.form.get('basicInfo') as FormControl;
	public readonly location = this.form.get('location') as FormControl;
	public readonly password = this.form.get('password') as FormControl;
	
	public loading: boolean;
	
	public mapCoordEmitter = new EventEmitter<google.maps.LatLng | google.maps.LatLngLiteral>();
	public mapGeometryEmitter = new EventEmitter<google.maps.places.PlaceGeometry | google.maps.GeocoderGeometry>();
	
	public BUTTON_DONE: string = 'BUTTON_DONE';
	public BUTTON_NEXT: string = 'BUTTON_NEXT';
	public BUTTON_PREV: string = 'BUTTON_PREV';
	
	constructor(
			private toasterService: ToasterService,
			private readonly activeModal: NgbActiveModal,
			private readonly formBuilder: FormBuilder,
			protected carrierRouter: CarrierRouter,
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
	
	public ngAfterViewInit(): void
	{
		if(this.locationForm)
		{
			this.locationForm.setDefaultCoords();
		}
	}
	
	public onGeometrySend(
			geometry:
					| google.maps.places.PlaceGeometry
					| google.maps.GeocoderGeometry
	)
	{
		this.mapGeometryEmitter.emit(geometry);
	}
	
	public onCoordinatesChanges(
			location: google.maps.LatLng | google.maps.LatLngLiteral
	)
	{
		this.mapCoordEmitter.emit(location);
	}
	
	public async createCarrier()
	{
		try
		{
			// GeoJSON use reversed order for coordinates from our implementation.
			// we use lat => lng but GeoJSON use lng => lat.
			const geoLocationInput = this.locationForm.getValue();
			geoLocationInput.loc.coordinates.reverse();
			
			this.loading = true;
			const carrierCreateObj: ICarrierCreateObject = {
				...this.basicInfoForm.getValue(),
				geoLocation: geoLocationInput,
			};
			
			if(!carrierCreateObj.logo)
			{
				const letter = carrierCreateObj.firstName
				                               .charAt(0)
				                               .toUpperCase();
				carrierCreateObj.logo = CommonUtils.getDummyImage(300, 300, letter);
			}
			
			const carrier = await this.carrierRouter
			                          .register({
				                                    carrier:  carrierCreateObj,
				                                    password: this.basicInfoForm.getPassword(),
			                                    });
			this.loading = false;
			this.toasterService.pop(
					'success',
					`Carrier ${carrier.firstName} was created`
			);
			this.activeModal.close(carrier);
		} catch(err)
		{
			this.loading = false;
			
			this.toasterService.pop(
					'error',
					`Error in creating carrier: "${err.message}"`
			);
			this.activeModal.dismiss('canceled');
		}
	}
	
	public cancel()
	{
		this.activeModal.dismiss('canceled');
	}
	
	private _translate(key: string): string
	{
		let translationResult = '';
		
		this._translateService.get(key)
		    .subscribe((res) => translationResult = res);
		
		return translationResult;
	}
}
