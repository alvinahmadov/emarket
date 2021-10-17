import { Component, ViewChild, OnInit } from '@angular/core';
import { WarehousesService }            from '@app/@core/data/warehouses.service';
import { environment }                  from 'environments/environment';
import Warehouse                        from '@modules/server.common/entities/Warehouse';
import {
	getDefaultCountryName,
	TCountryName,
}                                       from '@modules/server.common/data/countries';
import { Location }                     from '@angular/common';

@Component({
	           templateUrl: './warehouse-track.component.html',
	           styleUrls:   ['./warehouse-track.component.scss'],
           })
export class WarehouseTrackComponent implements OnInit
{
	@ViewChild('gmap', { static: true })
	public gmapElement: any;
	public map: google.maps.Map;
	
	public merchantMarkers: any[] = [];
	public merchants: Warehouse[] = [];
	public listOfCities: string[] = [];
	public listOfCountries: TCountryName[] = [];
	public listOfMerchants: string[];
	public merchantCity: string;
	public merchantName: string;
	public merchantCountry: TCountryName;
	
	//TODO: Set values
	selectedStore: any = null;
	selectedCarrier: any = null;
	
	constructor(
			private warehouseService: WarehousesService,
			private location: Location
	)
	{}
	
	public ngOnInit(): void
	{
		this.showMap();
		
		this.warehouseService
		    .getStoreLivePosition()
		    .subscribe((store) =>
		               {
			               this.merchants = store;
			
			               if(this.merchantMarkers.length === 0)
			               {
				               this.listOfCities = Array.from(
						               new Set(store.map((mer) => mer.geoLocation.city))
				               ).sort();
				               this.listOfCountries = Array.from(
						               new Set(
								               store.map(
										               (mer) =>
												               getDefaultCountryName(mer.geoLocation.countryId)
								               )
						               )
				               ).sort();
				               this.listOfMerchants = this.setSort(
						               store.map((mer) => mer.name)
				               );
				               this.populateMarkers(store, this.merchantMarkers);
			               }
			               else if(store.length === this.merchantMarkers.length)
			               {
				               this.updateMarkers(store);
			               }
			               else
			               {
				               this.updateMarkers(store);
			               }
		               });
	}
	
	public setSort(arr: any): any[]
	{
		return Array.from(new Set(arr)).sort();
	}
	
	public showMap()
	{
		const lat = environment.DEFAULT_LATITUDE;
		const lng = environment.DEFAULT_LONGITUDE;
		
		const mapProp = {
			center:    new google.maps.LatLng(lat, lng),
			zoom:      15,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
		};
		this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
	}
	
	public filterByName(event)
	{
		if(event)
		{
			this.merchantName = event;
			
			this.deleteMarkerStorage();
			const filteredMerchants = this.merchants.filter(
					(mer) => mer.name === this.merchantName
			);
			this.populateMarkers(filteredMerchants, this.merchantMarkers);
		}
		else
		{
			this.deleteMarkerStorage();
			this.populateMarkers(this.merchants, this.merchantMarkers);
		}
	}
	
	public filterByCity(event)
	{
		if(event)
		{
			this.merchantCity = event;
			this.merchantName = undefined;
			this.deleteMarkerStorage();
			const filteredMerchants = this.merchants.filter(
					(mer) => mer.geoLocation.city === this.merchantCity
			);
			this.populateMarkers(filteredMerchants, this.merchantMarkers);
			this.listOfMerchants = this.setSort(
					filteredMerchants.map((mer) => mer.name)
			);
		}
		else
		{
			this.deleteMarkerStorage();
			this.populateMarkers(this.merchants, this.merchantMarkers);
		}
	}
	
	public filterByCountry(event)
	{
		if(event)
		{
			this.merchantCountry = event;
			this.merchantCity = undefined;
			this.merchantName = undefined;
			this.deleteMarkerStorage();
			const filteredMerchants = this.merchants.filter(
					(mer) =>
							getDefaultCountryName(mer.geoLocation.countryId) ===
							this.merchantCountry
			);
			this.listOfCities = this.setSort(
					filteredMerchants.map((mer) => mer.geoLocation.city)
			);
			this.listOfMerchants = this.setSort(
					filteredMerchants.map((mer) => mer.name)
			);
			this.populateMarkers(filteredMerchants, this.merchantMarkers);
		}
		else
		{
			this.deleteMarkerStorage();
			this.populateMarkers(this.merchants, this.merchantMarkers);
		}
	}
	
	public populateMarkers(merchantArray, markerStorage)
	{
		const latlngbounds = new google.maps.LatLngBounds();
		
		merchantArray.forEach((mer) =>
		                      {
			                      const coords = new google.maps.LatLng(
					                      mer.geoLocation.loc.coordinates[1],
					                      mer.geoLocation.loc.coordinates[0]
			                      );
			                      const storeIcon = environment.MAP_MERCHANT_ICON_LINK;
			                      const marker = this.addMarker(coords, this.map, storeIcon);
			                      markerStorage.push({ marker, id: mer.id });
			                      latlngbounds.extend(coords);
		                      });
		
		this.map.fitBounds(latlngbounds);
	}
	
	public updateMarkers(merchantArray: Warehouse[])
	{
		merchantArray.forEach((store) =>
		                      {
			                      const newCoords = new google.maps.LatLng(
					                      store.geoLocation.loc.coordinates[1],
					                      store.geoLocation.loc.coordinates[0]
			                      );
			                      let markerIndex;
			                      const marker = this.merchantMarkers.find((markerItem, i) =>
			                                                               {
				                                                               if(markerItem.id === store.id)
				                                                               {
					                                                               markerIndex = i;
					                                                               return true;
				                                                               }
				                                                               else
				                                                               {
					                                                               return false;
				                                                               }
			                                                               });
			                      if(marker)
			                      {
				                      if(!newCoords.equals(marker.marker.getPosition()))
				                      {
					                      this.merchantMarkers[markerIndex].marker.setPosition(
							                      newCoords
					                      );
				                      }
			                      }
		                      });
	}
	
	public deleteMarkerStorage()
	{
		this.merchantMarkers.forEach((mar) =>
		                             {
			                             mar.marker.setMap(null);
		                             });
		this.merchantMarkers = [];
	}
	
	public addMarker(position, map, icon)
	{
		return new google.maps.Marker({
			                              position,
			                              map,
			                              icon,
		                              });
	}
	
	public goBack()
	{
		this.location.back();
	}
}
