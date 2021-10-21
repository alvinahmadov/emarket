import { Component, OnInit, ViewChild, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup }        from '@angular/forms';
import { ActivatedRoute }                             from '@angular/router';
import { map, first }                                 from 'rxjs/operators';
import { ToasterService }                             from 'angular2-toaster';
import IGeoLocation                                   from '@modules/server.common/interfaces/IGeoLocation';
import Carrier                                        from '@modules/server.common/entities/Carrier';
import { CarrierRouter }                              from '@modules/client.common.angular2/routers/carrier-router.service';
import { BasicInfoFormComponent }                     from '@app/@shared/carrier/forms';
import { LocationFormComponent }                      from '@app/@shared/forms/location';

@Component({
	           selector:    'ea-carrier-edit',
	           styleUrls:   ['./carrier-edit.component.scss'],
	           templateUrl: './carrier-edit.component.html',
           })
export class CarrierEditComponent implements OnInit
{
	@ViewChild('basicInfoForm')
	public basicInfoForm: BasicInfoFormComponent;
	
	@ViewChild('locationForm')
	public locationForm: LocationFormComponent;
	
	public mapTypeEmitter = new EventEmitter<string>();
	public mapCoordEmitter = new EventEmitter<number[]>();
	public mapGeometryEmitter = new EventEmitter<any>();
	
	public loading: boolean;
	
	public readonly form: FormGroup =
			                this.formBuilder.group({
				                                       basicInfo: BasicInfoFormComponent.buildForm(this.formBuilder),
				                                       location:  LocationFormComponent.buildForm(this.formBuilder),
				                                       apartment: LocationFormComponent.buildApartmentForm(this.formBuilder),
			                                       });
	
	public readonly basicInfo = this.form.get('basicInfo') as FormControl;
	public readonly location = this.form.get('location') as FormControl;
	public readonly apartment = this.form.get('apartment') as FormControl;
	
	public readonly carrierId$ = this.activatedRoute.params.pipe(map((p) => p['id']));
	
	public currentCarrier: Carrier;
	
	constructor(
			private readonly toasterService: ToasterService,
			private readonly activatedRoute: ActivatedRoute,
			private readonly formBuilder: FormBuilder,
			private readonly carrierRouter: CarrierRouter
	)
	{}
	
	public get isCarrierValid()
	{
		return this.basicInfo.valid && this.location.valid;
	}
	
	public ngOnInit()
	{
		const id = this.activatedRoute.snapshot.params.id;
		
		this.carrierRouter
		    .get(id)
		    .pipe(first())
		    .subscribe((carrier) =>
		               {
			               if(!carrier)
			               {
				               this.toasterService.pop(
						               'error',
						               `Carrier with id ${id} doesn't exist!`
				               );
			               }
			
			               this.currentCarrier = carrier;
			
			               // GeoJSON use reversed order for coordinates from our locationForm.
			               // we use lat => lng but GeoJSON use lng => lat.
			               const geoLocationInput = carrier.geoLocation;
			               geoLocationInput.loc.coordinates.reverse();
			
			               this.basicInfoForm.setValue(carrier);
			               this.locationForm.setValue(geoLocationInput);
			               this.locationForm.setApartment(carrier.apartment);
		               });
	}
	
	public onCoordinatesChanges(coords: number[])
	{
		this.mapCoordEmitter.emit(coords);
	}
	
	public onGeometrySend(geometry: any)
	{
		this.mapGeometryEmitter.emit(geometry);
	}
	
	public emitMapType(mapType: string)
	{
		this.mapTypeEmitter.emit(mapType);
	}
	
	public async updateCarrier()
	{
		try
		{
			const basicInfo = this.basicInfoForm.getValue();
			basicInfo['apartment'] = this.apartment.value;
			
			// GeoJSON use reversed order for coordinates from our implementation.
			// we use lat => lng but GeoJSON use lng => lat.
			const geoLocationInput = this.locationForm.getValue();
			geoLocationInput.loc.coordinates.reverse();
			
			this.loading = true;
			const carrier = await this.carrierRouter.updateById(
					this.currentCarrier.id,
					{
						...basicInfo,
						geoLocation: geoLocationInput as IGeoLocation,
					}
			);
			this.loading = false;
			this.toasterService.pop(
					'success',
					`Carrier ${carrier.firstName} was updated`
			);
		} catch(err)
		{
			this.loading = false;
			this.toasterService.pop(
					'error',
					`Error in updating carrier: "${err.message}"`
			);
		}
	}
}
