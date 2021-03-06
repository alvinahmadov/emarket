import { Observable } from 'rxjs';
import IGeoLocation   from '../interfaces/IGeoLocation';
import Warehouse      from '../entities/Warehouse';

export interface IGeoLocationWarehousesRouterGetOptions
{
	fullProducts?: boolean;
	activeOnly?: boolean;
}

export interface IGeoLocationWarehousesOptions
{
	activeOnly?: boolean;
	inStoreMode?: boolean;
	maxDistance?: number;
	fullProducts?: boolean;
}

export interface IGeoLocationWarehousesFilterOptions
		extends IGeoLocationWarehousesOptions,
		        IGeoLocationWarehousesRouterGetOptions
{
	merchantsIds?: string[];
}

export interface INearStoresInput
{
	geoLocation: IGeoLocation,
	options?: IGeoLocationWarehousesOptions
}

interface IGeoLocationWarehousesRouter
{
	get(
			geoLocation: IGeoLocation,
			options?: IGeoLocationWarehousesRouterGetOptions
	): Observable<Warehouse[]>;
}

export default IGeoLocationWarehousesRouter;
