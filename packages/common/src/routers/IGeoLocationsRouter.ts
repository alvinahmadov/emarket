import GeoLocation from '../entities/GeoLocation'

interface IGeoLocationsRouter
{
	getAddressByCoordinatesUsingArcGIS(
			lat: number,
			lng: number
	): Promise<any | null>;
	
	getLocationByIP(clientIp?: string): Promise<GeoLocation | null>
}

export default IGeoLocationsRouter;
