import { Observable }   from 'rxjs';
import WarehouseProduct from '../entities/WarehouseProduct';
import IComment         from '../interfaces/IComment';
import {
	IWarehouseProductCreateObject,
	default as IWarehouseProduct
}                       from '../interfaces/IWarehouseProduct';

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
	
	addComment(
			warehouseId: string,
			productId: string,
			comment: IComment
	): Promise<void>;
	
	getTopProducts(
			warehouseId: string,
			quantity: number
	): Observable<WarehouseProduct[]>;
}

export default IWarehouseProductsRouter;
