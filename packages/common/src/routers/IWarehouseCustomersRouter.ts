import { Observable } from 'rxjs';
import Customer       from '../entities/Customer';
import Warehouse      from '../entities/Warehouse';

interface IWarehouseCustomersRouter
{
	get(warehouseId: Warehouse['id']): Observable<Customer[]>;
	
	// getMerchant(warehouseId: Warehouse['id'], username: string): Observable<User>;
}

export default IWarehouseCustomersRouter;
