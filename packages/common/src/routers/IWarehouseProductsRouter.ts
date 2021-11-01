import { Observable }             from 'rxjs';
import WarehouseProduct           from '../entities/WarehouseProduct';
import IWarehouseProduct,
{ IWarehouseProductCreateObject } from '../interfaces/IWarehouseProduct';

interface IWarehouseProductsRouter
{
	get(id: string, fullProducts?): Observable<WarehouseProduct[]>;
	
	getAvailable(warehouseId: string): Observable<WarehouseProduct[]>;
	
	add(
			warehouseId: string,
			products: IWarehouseProductCreateObject[]
	): Promise<WarehouseProduct[]>;
	
	update(
			warehouseId: string,
			updatedWarehouseProduct: IWarehouseProduct
	): Promise<WarehouseProduct>;
	
	changePrice(
			warehouseId: string,
			productId: string,
			price: number
	): Promise<WarehouseProduct>;
	
	increaseCount(
			warehouseId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>;
	
	increaseSoldCount(
			warehouseId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>;
	
	increaseViewsCount(
			warehouseId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>;
	
	increaseLikesCount(
			warehouseId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>;
	
	decreaseCount(
			warehouseId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>;
	
	decreaseSoldCount(
			warehouseId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>;
	
	decreaseViewsCount(
			warehouseId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>;
	
	decreaseLikesCount(
			warehouseId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>;
	
	getTopProducts(
			warehouseId: string,
			quantity: number
	): Observable<WarehouseProduct[]>;
}

export default IWarehouseProductsRouter;
