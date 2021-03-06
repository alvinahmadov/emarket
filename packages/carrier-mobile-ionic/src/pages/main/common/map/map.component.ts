import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';

declare var google: any;
const directionsDisplay = new google.maps.DirectionsRenderer();
const directionsService = new google.maps.DirectionsService();

@Component({
	           selector:    'carrier-map',
	           templateUrl: 'map.component.html',
           })
export class MapComponent implements OnInit
{
	@ViewChild('map', { static: true })
	public mapElement: ElementRef;
	
	public map: google.maps.Map;
	
	public ngOnInit(): void
	{
		this.showMap();
	}
	
	public showMap()
	{
		const option = {
			zoom: 17,
		};
		
		this.map = new google.maps.Map(this.mapElement.nativeElement, option);
	}
	
	public setCenter(position)
	{
		if(this.map)
		{
			this.map.setCenter(position);
		}
	}
	
	public addMarker(position)
	{
		if(this.map)
		{
			const map = this.map;
			return new google.maps.Marker({
				                              position,
				                              map,
			                              });
		}
	}
	
	public drawRoute(origin, destination)
	{
		if(this.map)
		{
			directionsDisplay.setMap(this.map);
			
			const request = {
				origin,
				destination,
				travelMode: 'DRIVING',
			};
			
			directionsService.route(request, function(res, stat)
			{
				if(stat === 'OK')
				{
					directionsDisplay.setDirections({ routes: [] });
					
					directionsDisplay.setDirections(res);
				}
			});
		}
	}
}
