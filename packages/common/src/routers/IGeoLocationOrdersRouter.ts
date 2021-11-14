import { Observable } from 'rxjs';
import Order          from '../entities/Order';
import IGeoLocation   from '../interfaces/IGeoLocation';

export interface IGeoLocationOrdersRouterOptions
{
	populateWarehouse?: boolean;
	populateCarrier?: boolean;
}

interface IGeoLocationOrdersRouter
{
	get(
			geoLocation: IGeoLocation,
			options?: IGeoLocationOrdersRouterOptions
	): Observable<Order[]>;
}

export default IGeoLocationOrdersRouter;
