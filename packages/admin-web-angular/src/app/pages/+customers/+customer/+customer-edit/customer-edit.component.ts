import { Component, ViewChild, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup }        from '@angular/forms';
import { ActivatedRoute, Router }                     from '@angular/router';
import { first }                                      from 'rxjs/operators';
import { ToasterService }                             from 'angular2-toaster';
import { CustomerRouter }                             from '@modules/client.common.angular2/routers/customer-router.service';
import IGeoLocation                                   from '@modules/server.common/interfaces/IGeoLocation';
import Customer                                       from '@modules/server.common/entities/Customer';
import { BasicInfoFormComponent }                     from '@app/@shared/user/forms';
import { LocationFormComponent }                      from '@app/@shared/forms/location';

@Component({
	           styleUrls:   ['./customer-edit.component.scss'],
	           templateUrl: './customer-edit.component.html',
           })
export class CustomerEditComponent implements OnInit
{
	@ViewChild('basicInfoForm')
	basicInfoForm: BasicInfoFormComponent;
	
	@ViewChild('locationForm')
	locationForm: LocationFormComponent;
	
	mapTypeEmitter = new EventEmitter<string>();
	mapCoordEmitter = new EventEmitter<number[]>();
	mapGeometryEmitter = new EventEmitter<any>();
	
	public loading: boolean;
	
	readonly form: FormGroup = this._formBuilder.group({
		                                                   basicInfo: BasicInfoFormComponent.buildForm(this._formBuilder),
		                                                   location:  LocationFormComponent.buildForm(this._formBuilder),
	                                                   });
	
	readonly basicInfo = this.form.get('basicInfo') as FormControl;
	readonly location = this.form.get('location') as FormControl;
	
	public _currentCustomer: Customer;
	
	constructor(
			private readonly _activatedRoute: ActivatedRoute,
			private readonly _router: Router,
			private readonly _formBuilder: FormBuilder,
			private readonly _customerRouter: CustomerRouter,
			private readonly _toasterService: ToasterService
	)
	{}
	
	ngOnInit()
	{
		const id = this._activatedRoute.snapshot.params.id;
		
		this._customerRouter
		    .get(id)
		    .pipe(first())
		    .subscribe((customer) =>
		               {
			               if(!customer)
			               {
				               this._toasterService.pop(
						               'error',
						               `Customer with id ${id} doesn't exist!`
				               );
			               }
			
			               this._currentCustomer = customer;
			
			               // GeoJSON use reversed order of lat => lng
			               const geoLocationInput = customer.geoLocation;
			               geoLocationInput.loc.coordinates.reverse();
			
			               this.basicInfoForm.setValue(customer);
			               this.locationForm.setValue(geoLocationInput);
			               this._emitMapCoordinates([
				                                        customer.geoLocation.coordinates.lat,
				                                        customer.geoLocation.coordinates.lng,
			                                        ]);
		               });
	}
	
	onCoordinatesChanges(coords: number[])
	{
		this.mapCoordEmitter.emit(coords);
	}
	
	onGeometrySend(geometry: any)
	{
		this.mapGeometryEmitter.emit(geometry);
	}
	
	emitMapType(mapType: string)
	{
		this.mapTypeEmitter.emit(mapType);
	}
	
	async updateCustomer()
	{
		const geoLocationInput = this.locationForm.getValue();
		geoLocationInput.loc.coordinates.reverse();
		try
		{
			this.loading = true;
			const customer = await this._customerRouter.updateCustomer(
					this._currentCustomer.id,
					{
						...this.basicInfoForm.getValue(),
						geoLocation: geoLocationInput as IGeoLocation,
					}
			);
			this.loading = false;
			this._toasterService.pop(
					'success',
					`Customer ${customer.firstName} was updated`
			);
			await this._router.navigate([`/customers/list/${customer.id}`], {
				relativeTo: this._activatedRoute,
			});
		} catch(err)
		{
			this.loading = false;
			this._toasterService.pop(
					'error',
					`Error in updating customer: "${err.message}"`
			);
		}
	}
	
	private _emitMapCoordinates(coords: number[])
	{
		this.mapCoordEmitter.emit(coords);
	}
}
