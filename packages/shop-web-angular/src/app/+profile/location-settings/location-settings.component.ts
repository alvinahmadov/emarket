import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { LocationFormComponent }                      from './location/location.component';
import Customer                                       from '@modules/server.common/entities/Customer';
import { environment }                                from 'environments/environment';
import { ILocation }                                  from '@modules/server.common/interfaces/IGeoLocation';
import { InviteRouter }                               from '@modules/client.common.angular2/routers/invite-router.service';
import { InviteRequestRouter }                        from '@modules/client.common.angular2/routers/invite-request-router.service';
import { HttpClient }                                 from '@angular/common/http';
import { ActivatedRoute, Router }                     from '@angular/router';
import { GeoLocationRouter }                          from '@modules/client.common.angular2/routers/geo-location-router.service';
import { StorageService }                             from 'app/services/storage';
import { GeoLocationService }                         from 'app/services/geo-location';
import { first }                                      from 'rxjs/operators';
import { styleVariables }                             from 'styles/variables';
import { CustomersService }                           from 'app/services/customer.service';

@Component({
	           selector:    'es-location-settings',
	           templateUrl: './location-settings.component.html',
	           styleUrls:   ['./location-settings.component.scss']
           })
export class LocationSettingsComponent implements OnInit
{
	@ViewChild('locationForm')
	public locationForm: LocationFormComponent;
	
	public customer: Customer;
	
	public customerId: string;
	
	public isPasswordValid: boolean;
	
	public mapCoordEmitter = new EventEmitter<google.maps.LatLng | google.maps.LatLngLiteral>();
	public mapGeometryEmitter = new EventEmitter<any>();
	
	public readonly styleVariables: typeof styleVariables = styleVariables;
	
	public authLogo = environment.AUTH_LOGO;
	
	public coordinates: ILocation;
	
	constructor(
			protected inviteRouter: InviteRouter,
			protected inviteRequestRouter: InviteRequestRouter,
			protected http: HttpClient,
			protected router: Router,
			private customersService: CustomersService,
			private activatedRoute: ActivatedRoute,
			private geoLocationRouter: GeoLocationRouter,
			private storage: StorageService,
			private geoLocationService: GeoLocationService,
	)
	{
		this.loadUserData();
	}
	
	public ngOnInit()
	{
		this.updateCurrentAddressByCoordinates();
	}
	
	public async onOldPasswordChanged(password: string)
	{
		const response = await this.customersService
		                           .login(this.customer.username, password)
		                           .toPromise();
		
		if(!response || !response.user)
		{
			alert("Wrong old password. Retype it again!");
			this.isPasswordValid = false;
			return;
		}
		this.isPasswordValid = true;
	}
	
	public onCoordinatesChanges(coords: number[])
	{
		this.mapCoordEmitter.emit({ lat: coords[0], lng: coords[1] });
	}
	
	public onGeometrySend(geometry: any)
	{
		this.mapGeometryEmitter.emit(geometry);
	}
	
	private async updateCurrentAddressByCoordinates(): Promise<boolean>
	{
		try
		{
			const coords = await this.geoLocationService.getCurrentCoords();
			this.coordinates = {
				type:        'Point',
				coordinates: [coords.latitude, coords.longitude],
			};
		} catch(error)
		{
			console.error(error);
			return false;
		}
		
		return true;
	}
	
	public async updateCustomer()
	{
		if(!this.isPasswordValid)
			return;
		
		const customerInfo = this.locationForm.getCustomerUpdateInfo();
		const customer =
				      await this.customersService
				                .update(this.customerId,
				                        {
					                        username:    this.locationForm.username,
					                        email:       this.locationForm.email,
					                        apartment:   this.locationForm.apartament ?? '0',
					                        geoLocation: customerInfo.geoLocation,
					                        socialIds:   this.customer
					                                     ? this.customer.socialIds
					                                     : [],
				                        })
				                .toPromise();
		
		this.customersService.updatePassword(this.customerId, customerInfo.password)
		
		this.storage.customerId = customer.id;
	}
	
	private async loadUserData()
	{
		this.customerId = this.storage.customerId;
		
		if(this.customerId)
		{
			this.customer = await this.customersService
			                          .getCustomerById(this.customerId)
			                          .pipe(first())
			                          .toPromise();
		}
	}
}
