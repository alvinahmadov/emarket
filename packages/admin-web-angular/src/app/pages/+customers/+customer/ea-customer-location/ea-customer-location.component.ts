import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params }                  from '@angular/router';
import { Subscription }                            from 'rxjs';
import { first }                                   from 'rxjs/operators';
import { CustomersService }                        from '@app/@core/data/customers.service';
import { Marker } from '@agm/core/services/google-maps-types';

declare var google: any;

@Component({
	           selector:    'ea-customer-location',
	           styleUrls:   ['./ea-customer-location.component.scss'],
	           templateUrl: './ea-customer-location.component.html',
           })
export class CustomerLocationComponent implements OnDestroy, OnInit
{
	@ViewChild('gmap', { static: true })
	public gmapElement: any;
	
	public map: google.maps.Map;
	public marker: any;
	public params$: Subscription;
	
	constructor(
			private readonly _customerService: CustomersService,
			private readonly _router: ActivatedRoute
	)
	{}
	
	public ngOnInit(): void
	{
		this.params$ = this._router
		                   .params
		                   .subscribe(
				                   async(params: Params) =>
				                   {
					                   const customer = await this._customerService
					                                              .getCustomerById(params['id'])
					                                              .pipe(first())
					                                              .toPromise();
					                   console.debug(customer.geoLocation);
					                   const coordinates = new google.maps.LatLng(
							                   customer.geoLocation.coordinates.lat,
							                   customer.geoLocation.coordinates.lng
					                   );
					                   this.showMap(coordinates);
					                   this.marker = this.addMarker(coordinates, this.map);
				                   }
		                   );
	}
	
	public ngOnDestroy(): void
	{
		this.marker.setMap(null);
		
		if(this.params$)
		{
			this.params$.unsubscribe();
		}
	}
	
	public showMap(coordinates)
	{
		const mapProp = {
			center:    coordinates,
			zoom:      17,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
		};
		this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
	}
	
	public addMarker(coordinates, map): Marker
	{
		return new google.maps
		                 .Marker({
			                         position: coordinates,
			                         map,
		                         });
	}
}
