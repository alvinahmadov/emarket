import { Observable } from 'rxjs';
import Customer       from '../entities/Customer';
import Device         from '../entities/Device';

interface ICustomerProductsRouter
{
	getPlaceholder(
			userId: Customer['id'],
			deviceId: Device['id']
	): Observable<string>;
}

export default ICustomerProductsRouter;
