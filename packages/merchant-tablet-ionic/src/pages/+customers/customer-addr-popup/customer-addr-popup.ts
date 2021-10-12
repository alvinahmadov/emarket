import { Component, ViewChild, ElementRef, Input, OnInit } from '@angular/core';
import { ModalController }                                 from '@ionic/angular';
import Customer                                            from '@modules/server.common/entities/Customer';

@Component({
	           selector:    'customer-addr-popup',
	           styleUrls:   ['./customer-addr-popup.scss'],
	           templateUrl: './customer-addr-popup.html',
           })
export class CustomerAddrPopupPage implements OnInit
{
	@ViewChild('gmap', { static: true })
	public gmapElement: ElementRef;
	public map: google.maps.Map;
	public myLatLng = { lat: 0, lng: 0 };
	
	@Input()
	public customer: Customer;
	
	public city: string;
	public country: string;
	public street: string;
	public house: string;
	public apartment: string;
	public coordinates: number[];
	
	constructor(public modalController: ModalController) {}
	
	public get coordinatesStr()
	{
		return this.customer
		       ? this.customer.geoLocation.coordinatesArray
		             .map((c) => c.toFixed(6))
		             .reverse()
		             .join(', ')
		       : '';
	}
	
	public ngOnInit(): void
	{
		const customer = this.customer;
		this.city = customer.geoLocation.city;
		this.country = customer.geoLocation.countryName;
		this.street = customer.geoLocation.streetAddress;
		this.house = customer.geoLocation.house;
		this.apartment = customer.apartment;
		
		// We use reverse because MongoDB store lnt => lat
		this.coordinates = customer.geoLocation.coordinatesArray;
		
		this.myLatLng.lat = this.coordinates[0];
		this.myLatLng.lng = this.coordinates[1];
		
		this.loadMap();
	}
	
	public loadMap()
	{
		const mapProp = {
			center:    this.myLatLng,
			zoom:      15,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
		};
		
		this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
		
		const marker = new google.maps.Marker({
			                                      position: this.myLatLng,
			                                      map:      this.map,
			                                      title:    'Your Warehouse!',
		                                      });
	}
	
	public cancelModal()
	{
		this.modalController.dismiss();
	}
}
