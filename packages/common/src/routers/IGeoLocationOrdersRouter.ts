import { Observable }                      from 'rxjs';
import Order                               from '../entities/Order';
import IGeoLocation                        from '../interfaces/IGeoLocation';

export interface IGeoLocationOrdersRouterOptions
{
	populateWarehouse?: boolean;
	populateCarrier?: boolean;
}

export interface IGeoLocationOrdersPagingOptions
{
	sort?: string;
	limit?: number;
	skip?: number;
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


interface IGeoLocationOrdersRouter
{
	get(
			geoLocation: IGeoLocation,
			options?: IGeoLocationOrdersRouterOptions
	): Observable<Order[]>;
}

export default IGeoLocationOrdersRouter;
