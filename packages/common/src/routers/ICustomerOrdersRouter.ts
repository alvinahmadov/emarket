import { Observable } from 'rxjs';
import Customer       from '../entities/Customer';
import Order          from '../entities/Order';

interface ICustomerOrdersRouter
{
	get(userId: Customer['id']): Observable<Order[]>;
}

export default ICustomerOrdersRouter;
