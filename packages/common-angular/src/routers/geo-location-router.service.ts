import { Injectable }            from '@angular/core';
import { RouterFactory, Router } from '../lib/router';
import GeoLocation               from '@modules/server.common/entities/GeoLocation';
import IGeoLocationsRouter       from '@modules/server.common/routers/IGeoLocationsRouter';

@Injectable()
export class GeoLocationRouter implements IGeoLocationsRouter
{
	private readonly router: Router;
	
	constructor(routerFactory: RouterFactory)
	{
		this.router = routerFactory.create('geo-location');
	}
	
	getAddressByCoordinatesUsingArcGIS(
			lat: number,
			lng: number
	): Promise<any | null>
	{
		return this.router.run('getAddressByCoordinatesUsingArcGIS', lat, lng);
	}
	
	getLocationByIP(ipStackKey: string): Promise<GeoLocation | null>
	{
		return this.router.run<GeoLocation>('getLocationByIP', ipStackKey);
	}
}
