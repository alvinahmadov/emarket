import { Observable }               from 'rxjs';
import Warehouse                    from '../entities/Warehouse';
import { IGeoLocationCreateObject } from '../interfaces/IGeoLocation';

interface IWarehouseRouter
{
	get(id: string, fullProducts?: boolean): Observable<Warehouse | null>;
	
	getAllActive(fullProducts?: boolean): Observable<Warehouse[]>;
	
	updateGeoLocation(
			warehouseId: string,
			geoLocation: IGeoLocationCreateObject
	): Promise<Warehouse>;
	
	updateAvailability(
			warehouseId: string,
			isAvailable: boolean
	): Promise<Warehouse>;
	
	save(warehouse: Warehouse): Promise<Warehouse>;
}

export default IWarehouseRouter;
