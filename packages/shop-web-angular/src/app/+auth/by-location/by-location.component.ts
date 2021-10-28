import { Component, OnInit, EventEmitter, ViewChild, Input } from '@angular/core';
import { HttpClient }                                        from '@angular/common/http';
import { Router, ActivatedRoute }                            from '@angular/router';
import { first, map }                                        from 'rxjs/operators';
import { ICustomerCreateObject }                             from '@modules/server.common/interfaces/ICustomer';
import { ILocation }                                         from '@modules/server.common/interfaces/IGeoLocation';
import Customer                                              from '@modules/server.common/entities/Customer';
import InviteRequest                                         from '@modules/server.common/entities/InviteRequest';
import { GeoLocationRouter }                                 from '@modules/client.common.angular2/routers/geo-location-router.service';
import { InviteRouter }                                      from '@modules/client.common.angular2/routers/invite-router.service';
import { InviteRequestRouter }                               from '@modules/client.common.angular2/routers/invite-request-router.service';
import { CustomerRouter }                                    from '@modules/client.common.angular2/routers/customer-router.service';
import { CustomerAuthRouter }                                from '@modules/client.common.angular2/routers/customer-auth-router.service';
import { styleVariables }                                    from 'styles/variables';
import { environment }                                       from 'environments/environment';
import { StorageService }                                    from 'app/services/storage';
import { GeoLocationService }                                from 'app/services/geo-location';
import { LocationFormComponent }                             from './location/location.component';

export interface ICustomerDto
{
	customer: ICustomerCreateObject;
	password?: string;
}

@Component({
	           selector:    'es-login-by-location',
	           styleUrls:   ['./by-location.component.scss'],
	           templateUrl: './by-location.component.html',
           })
export class RegisterByLocationComponent implements OnInit
{
	@ViewChild('locationForm')
	public locationForm: LocationFormComponent;
	
	public customer: Customer;
	
	@Input()
	public customerId: string;
	
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
			protected customerRouter: CustomerRouter,
			private customerAuthRouter: CustomerAuthRouter,
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
	
	public async register()
	{
		await this.registerCustomer();
		await this.createInviteRequest();
	}
	
	private async createInviteRequest()
	{
		const inviteRequest = await this.locationForm.createInviteRequest();
		if(this.storage.inviteSystem)
		{
			await this.processInviteRequest(inviteRequest);
		}
		else
		{
			const inviteCurrent = await this.inviteRouter.create(inviteRequest);
			await this.customerRouter.updateCustomer(this.customerId, {
				isRegistrationCompleted: true,
				apartment:               inviteCurrent.apartment,
				geoLocation:             inviteCurrent.geoLocation,
			});
		}
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
	
	private async processInviteRequest(
			inviteRequest: InviteRequest
	): Promise<void>
	{
		if(inviteRequest)
		{
			this.storage.inviteRequestId = inviteRequest.id;
		}
		else
		{
			// TODO: show here that we can't get location and can't send invite because of that...
		}
		await this.router.navigate(['auth/code']);
	}
	
	private async registerCustomer()
	{
		const customerInfo = this.locationForm.getCreateUserInfo();
		const customer =
				      await this.customerAuthRouter
				                .register({
					                          user:     {
						                          username:                this.locationForm.username,
						                          email:                   this.locationForm.email,
						                          apartment:               this.locationForm.apartament ?? '0',
						                          geoLocation:             customerInfo.geoLocation,
						                          socialIds:               this.customer
						                                                   ? this.customer.socialIds
						                                                   : [],
						                          isRegistrationCompleted: false,
					                          },
					                          password: this.locationForm.password
				                          });
		
		this.storage.customerId = customer.id;
		await this.router.navigate(['auth/code']);
	}
	
	private async loadUserData()
	{
		this.customerId = await this.activatedRoute
		                            .params
		                            .pipe(
				                            map(p => p.id),
				                            first()
		                            )
		                            .toPromise();
		
		if(this.customerId)
		{
			this.customer = await this.customerRouter
			                          .get(this.customerId)
			                          .pipe(first())
			                          .toPromise();
		}
	}
}
