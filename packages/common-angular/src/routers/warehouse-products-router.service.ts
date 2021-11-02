import { Observable }            from 'rxjs';
import { map }                   from 'rxjs/operators';
import { Router, RouterFactory } from '../lib/router';
import _                         from 'lodash';
import { Injectable }            from '@angular/core';
import IWarehouseProduct, {
	IWarehouseProductCreateObject
}                                from '@modules/server.common/interfaces/IWarehouseProduct';
import WarehouseProduct          from '@modules/server.common/entities/WarehouseProduct';
import IWarehouseProductsRouter  from '@modules/server.common/routers/IWarehouseProductsRouter';

@Injectable()
export class WarehouseProductsRouter implements IWarehouseProductsRouter
{
	private readonly router: Router;
	
	constructor(routerFactory: RouterFactory)
	{
		this.router = routerFactory.create('warehouse-products');
	}
	
	public get(id: string, fullProducts = true): Observable<WarehouseProduct[]>
	{
		return this.router
		           .runAndObserve<IWarehouseProduct[]>('get', id, fullProducts)
		           .pipe(
				           map((warehouseProducts) =>
						               _.map(warehouseProducts, (warehouseProduct) =>
								               this._factory(warehouseProduct)
						               )
				           )
		           );
	}
	
	public getAvailable(warehouseId: string): Observable<WarehouseProduct[]>
	{
		return this.router
		           .runAndObserve<IWarehouseProduct[]>('getAvailable', warehouseId)
		           .pipe(
				           map((warehouseProducts) =>
						               _.map(warehouseProducts, (warehouseProduct) =>
								               this._factory(warehouseProduct)
						               )
				           )
		           );
	}
	
	public async add(
			warehouseId: string,
			products: IWarehouseProductCreateObject[]
	): Promise<WarehouseProduct[]>
	{
		const warehouseProducts = await this.router.run<IWarehouseProduct[]>(
				'add',
				warehouseId,
				products
		);
		return _.map(warehouseProducts, (warehouseProduct) =>
				this._factory(warehouseProduct)
		);
	}
	
	public async update(
			warehouseId: string,
			updatedWarehouseProduct: IWarehouseProduct
	): Promise<WarehouseProduct>
	{
		const warehouseProduct = await this.router.run<IWarehouseProduct>(
				'update',
				warehouseId,
				updatedWarehouseProduct
		);
		return this._factory(warehouseProduct);
	}
	
	public async changePrice(
			warehouseId: string,
			productId: string,
			price: number
	): Promise<WarehouseProduct>
	{
		const warehouseProduct = await this.router.run<IWarehouseProduct>(
				'changePrice',
				warehouseId,
				productId,
				price
		);
		return this._factory(warehouseProduct);
	}
	
	public async decreaseCount(
			warehouseId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		const warehouseProduct = await this.router.run<IWarehouseProduct>(
				'decreaseCount',
				warehouseId,
				productId,
				count
		);
		return this._factory(warehouseProduct);
	}
	
	public async increaseCount(
			warehouseId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		const warehouseProduct = await this.router.run<IWarehouseProduct>(
				'increaseCount',
				warehouseId,
				productId,
				count
		);
		return this._factory(warehouseProduct);
	}
	
	public async changeProductAvailability(
			warehouseId: string,
			productId: string,
			isAvailable: boolean
	): Promise<WarehouseProduct>
	{
		const warehouseProduct = await this.router.run<IWarehouseProduct>(
				'changeProductAvailability',
				warehouseId,
				productId,
				isAvailable
		);
		
		return this._factory(warehouseProduct);
	}
	
	public async changeProductTakeaway(
			warehouseId: string,
			productId: string,
			isTakeaway: boolean
	): Promise<WarehouseProduct>
	{
		const warehouseProduct = await this.router.run<IWarehouseProduct>(
				'changeProductTakeaway',
				warehouseId,
				productId,
				isTakeaway
		);
		
		return this._factory(warehouseProduct);
	}
	
	public async changeProductDelivery(
			warehouseId: string,
			productId: string,
			isDelivery: boolean
	): Promise<WarehouseProduct>
	{
		const warehouseProduct = await this.router.run<IWarehouseProduct>(
				'changeProductDelivery',
				warehouseId,
				productId,
				isDelivery
		);
		
		return this._factory(warehouseProduct);
	}
	
	public async increaseSoldCount(
			warehouseId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		const warehouseProduct = await this.router.run<IWarehouseProduct>(
				'increaseSoldCount',
				warehouseId,
				productId,
				count
		);
		return this._factory(warehouseProduct);
	}
	
	public async decreaseSoldCount(
			warehouseId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		const warehouseProduct = await this.router.run<IWarehouseProduct>(
				'decreaseSoldCount',
				warehouseId,
				productId,
				count
		);
		return this._factory(warehouseProduct);
	}
	
	public async increaseViewsCount(
			warehouseId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		const warehouseProduct = await this.router.run<IWarehouseProduct>(
				'increaseViewsCount',
				warehouseId,
				productId,
				count
		);
		return this._factory(warehouseProduct);
	}
	
	public async decreaseViewsCount(
			warehouseId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		const warehouseProduct = await this.router.run<IWarehouseProduct>(
				'decreaseViewsCount',
				warehouseId,
				productId,
				count
		);
		return this._factory(warehouseProduct);
	}
	
	public async increaseLikesCount(
			warehouseId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		const warehouseProduct = await this.router.run<IWarehouseProduct>(
				'increaseLikesCount',
				warehouseId,
				productId,
				count
		);
		return this._factory(warehouseProduct);
	}
	
	public async decreaseLikesCount(
			warehouseId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		const warehouseProduct = await this.router.run<IWarehouseProduct>(
				'decreaseLikesCount',
				warehouseId,
				productId,
				count
		);
		return this._factory(warehouseProduct);
	}
	
	getTopProducts(
			warehouseId: string,
			quantity: number
	): Observable<WarehouseProduct[]>
	{
		return this.router
		           .runAndObserve<IWarehouseProduct[]>(
				           'getTopProducts',
				           warehouseId,
				           quantity
		           )
		           .pipe(
				           map((warehouseProducts) =>
						               _.map(warehouseProducts, (warehouseProduct) =>
								               this._factory(warehouseProduct)
						               )
				           )
		           );
	}
	
	protected _factory(warehouseProduct: IWarehouseProduct)
	{
		return warehouseProduct == null
		       ? null
		       : new WarehouseProduct(warehouseProduct);
	}
}
