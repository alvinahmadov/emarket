import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import {
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	Output,
	AfterViewInit,
}                                              from '@angular/core';
import { Observable, Subject }                 from 'rxjs';
import { takeUntil }                           from 'rxjs/operators';
import { ToasterService }                      from 'angular2-toaster';
import { BasicInfoFormComponent }              from '@app/@shared/user/forms';
import { LocationFormComponent }               from '@app/@shared/forms/location';
import { CustomersService }                    from '@app/@core/data/customers.service';

@Component({
	           selector:    'ea-warehouse-order-create-user',
	           styleUrls:   ['./warehouse-order-create-user.component.scss'],
	           templateUrl: './warehouse-order-create-user.component.html',
           })
export class WarehouseOrderCreateUserComponent
		implements OnDestroy, AfterViewInit
{
	readonly form: FormGroup = this._formBuilder.group({
		                                                   basicInfo: BasicInfoFormComponent.buildForm(this._formBuilder),
		                                                   apartment: LocationFormComponent.buildApartmentForm(this._formBuilder),
		                                                   location:  LocationFormComponent.buildForm(this._formBuilder),
	                                                   });
	
	readonly basicInfo = this.form.get('basicInfo') as FormControl;
	readonly apartment = this.form.get('apartment') as FormControl;
	readonly location = this.form.get('location') as FormControl;
	
	@Input()
	public createUserEvent: Observable<void>;
	
	public mapCoordEmitter = new EventEmitter<google.maps.LatLng | google.maps.LatLngLiteral>();
	
	public mapGeometryEmitter = new EventEmitter<google.maps.places.PlaceGeometry | google.maps.GeocoderGeometry>();
	
	@Output()
	public newUserEmitter = new EventEmitter<any>();
	
	private readonly _ngDestroy$ = new Subject<void>();
	
	constructor(
			private readonly _formBuilder: FormBuilder,
			private readonly _customersService: CustomersService,
			private readonly _toasterService: ToasterService
	)
	{}
	
	public ngAfterViewInit()
	{
		this._listenForNewUser();
	}
	
	public ngOnDestroy()
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	public onCoordinatesChanges(
			location: google.maps.LatLng | google.maps.LatLngLiteral
	)
	{
		this.mapCoordEmitter.emit(location);
	}
	
	public onGeometrySend(
			geometry:
					| google.maps.places.PlaceGeometry
					| google.maps.GeocoderGeometry
	)
	{
		this.mapGeometryEmitter.emit(geometry);
	}
	
	private _listenForNewUser()
	{
		this.createUserEvent.pipe(takeUntil(this._ngDestroy$)).subscribe(() =>
		                                                                 {
			                                                                 if(this.form.valid)
			                                                                 {
				                                                                 this._registerNewUser();
			                                                                 }
		                                                                 });
	}
	
	private async _registerNewUser()
	{
		const rawData = {
			...this.basicInfo.value,
			apartment:   this.apartment.value,
			geoLocation: this.location.value,
		};
		
		// GeoJSON use reversed order for coordinates from our implementation.
		// we use lat => lng but GeoJSON use lng => lat.
		this.location.value.loc.coordinates.reverse();
		
		try
		{
			const customer = await this._customersService
			                       .registerCustomer({
				                                         user: rawData,
			                                         });
			const userFirstname = customer.firstName;
			this.newUserEmitter.emit(customer);
			this.form.reset();
			this._toasterService.pop(
					'success',
					`User "${userFirstname}" was added successfully`
			);
		} catch(error)
		{
			this._toasterService.pop(
					'error',
					`Error in creating customer: "${error.message}"`
			);
		}
	}
}
