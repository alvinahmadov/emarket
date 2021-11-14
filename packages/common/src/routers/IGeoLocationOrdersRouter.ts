import { Observable }                      from 'rxjs';
import Order                               from '../entities/Order';
import IGeoLocation                        from '../interfaces/IGeoLocation';
import { IGeoLocationOrdersPagingOptions } from "@ever-platform/core/build/src/services/geo-locations";

export interface IGeoLocationOrdersRouterOptions
{
	populateWarehouse?: boolean;
	populateCarrier?: boolean;
}

interface IGeoLocationOrdersSearchRecord
{
	key: string;
	value: string;
}

export interface IGeoLocationOrdersSearchObject
{
	isCancelled?: boolean;
	byRegex: Array<IGeoLocationOrdersSearchRecord>;
}

export interface IGeoLocationWorkOrderSearchInput extends IGeoLocationOrdersSearchObject
{
	isCancelled?: boolean;
}

export interface IGeoLocationWorkOrderInput
{
	geoLocation: IGeoLocation;
	skippedOrderIds: string[];
	options: IGeoLocationOrdersPagingOptions;
	searchObj?: IGeoLocationOrdersSearchObject;
}

export interface IGeoLocationWorkOrdersInput extends IGeoLocationWorkOrderInput
{
	searchObj: IGeoLocationWorkOrderSearchInput;
}

export interface IGeoLocationOrdersPagingOptions
{
	sort?: string;
	limit?: number;
	skip?: number;
}


interface IGeoLocationOrdersRouter
{
	get(
			geoLocation: IGeoLocation,
			options?: IGeoLocationOrdersRouterOptions
	): Observable<Order[]>;
}

export default IGeoLocationOrdersRouter;
