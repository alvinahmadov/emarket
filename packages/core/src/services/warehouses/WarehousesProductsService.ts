import Logger                     from 'bunyan';
import { injectable }             from 'inversify';
import _                          from 'lodash';
import { Types }                  from 'mongoose'
import { Observable, of }         from 'rxjs';
import { exhaustMap, first, map } from 'rxjs/operators';
import { _throw }                 from 'rxjs/observable/throw';
import {
	asyncListener, observableListener,
	routerName, serialization
}                                 from '@pyro/io';
import { ExistenceEventType }     from '@pyro/db-server';
import IWarehouseProduct,
{ IWarehouseProductCreateObject } from '@modules/server.common/interfaces/IWarehouseProduct';
import IProduct                   from '@modules/server.common/interfaces/IProduct';
import IPagingOptions             from '@modules/server.common/interfaces/IPagingOptions';
import IWarehouse                 from '@modules/server.common/interfaces/IWarehouse';
import IComment                   from '@modules/server.common/interfaces/IComment';
import IWarehouseProductsRouter   from '@modules/server.common/routers/IWarehouseProductsRouter';
import DeliveryType               from '@modules/server.common/enums/DeliveryType';
import WarehouseProduct           from '@modules/server.common/entities/WarehouseProduct';
import Comment                    from '@modules/server.common/entities/Comment';
import Warehouse                  from '@modules/server.common/entities/Warehouse';
import { WarehousesService }      from './WarehousesService';
import IService                   from '../IService';
import { createLogger }           from '../../helpers/Log';
// import AsyncLock                  from 'async-lock'

const noGetProductTypeMessage = `There should be true at least one of the two - "isCarrierRequired" or "isTakeaway"!`;

type CountOpType = "sold" | "likes" | "views" | "qty";

// const lock = new AsyncLock();

/**
 * Warehouses Products Service
 *
 * @export
 * @class WarehousesProductsService
 * @implements {IWarehouseProductsRouter}
 * @implements {IService}
 *
 * Handles client requests on warehouse product
 */
@injectable()
@routerName('warehouse-products')
export class WarehousesProductsService
		implements IWarehouseProductsRouter, IService
{
	protected readonly log: Logger = createLogger({
		                                              name: 'warehouseProductsService'
	                                              });
	
	constructor(
			private readonly warehousesService: WarehousesService
	)
	{}
	
	/**
	 * Get all products for given warehouse (not only available, but all assigned)
	 *
	 * @param {string} warehouseId
	 * @param {boolean} [fullProducts=true] if true, include full products details
	 * @returns {Observable<WarehouseProduct[]>}
	 * @memberof WarehousesProductsService
	 */
	@observableListener()
	public get(
			warehouseId: string,
			fullProducts: boolean = true
	): Observable<WarehouseProduct[]>
	{
		return this.warehousesService
		           .get(warehouseId, fullProducts)
		           .pipe(
				           exhaustMap((warehouse) =>
				                      {
					                      if(warehouse === null)
					                      {
						                      return _throw(
								                      new Error(
										                      `Warehouse with the id ${warehouseId} doesn't exist`
								                      )
						                      );
					                      }
					                      else
					                      {
						                      return of(warehouse);
					                      }
				                      }),
				           map((warehouse) => warehouse.products)
		           );
	}
	
	@asyncListener()
	public async getProductsWithPagination(
			warehouseId: string,
			pagingOptions: IPagingOptions
	): Promise<WarehouseProduct[]>
	{
		const allProducts = await this.get(warehouseId)
		                              .pipe(first())
		                              .toPromise();
		
		const products = [...allProducts];
		
		if(pagingOptions.limit && pagingOptions.skip)
		{
			return products
					.slice(pagingOptions.skip)
					.slice(0, pagingOptions.limit)
					.sort((a, b) => b.soldCount - a.soldCount);
		}
		else if(pagingOptions.limit)
		{
			return products
					.slice(0, pagingOptions.limit)
					.sort((a, b) => b.soldCount - a.soldCount);
		}
		else if(pagingOptions.skip)
		{
			return products
					.slice(pagingOptions.skip)
					.sort((a, b) => b.soldCount - a.soldCount);
		}
		
		return products.sort((a, b) => b.soldCount - a.soldCount);
	}
	
	@asyncListener()
	public async getProductsCount(warehouseId: string)
	{
		const allProducts = await this.get(warehouseId)
		                              .pipe(first())
		                              .toPromise();
		
		return allProducts.length;
	}
	
	/**
	 * Get products for given warehouse which available for purchase
	 *
	 * @param {string} warehouseId
	 * @returns {Observable<WarehouseProduct[]>}
	 * @memberof WarehousesProductsService
	 */
	@observableListener()
	public getAvailable(warehouseId: string): Observable<WarehouseProduct[]>
	{
		return this.get(warehouseId)
		           .pipe(
				           map((warehouseProducts) =>
						               _.filter(
								               warehouseProducts,
								               (warehouseProduct) =>
										               warehouseProduct.count > 0 &&
										               warehouseProduct.isProductAvailable === true
						               )
				           )
		           );
	}
	
	/**
	 * Add products to warehouse
	 * TODO: should "merge" products, not just add them!
	 * By merge I mean increase qty if product already in warehouse or add new product if it's not.
	 * We also should think what to do with prices?
	 * Is it possible to have 2 same products but come with different price?
	 * Or we should merge products and use latest price?
	 *
	 * @param {string} warehouseId
	 * @param {IWarehouseProductCreateObject[]} products
	 * @param {boolean} [triggerChange=true]
	 * @returns {Promise<WarehouseProduct[]>}
	 * @memberof WarehousesProductsService
	 */
	@asyncListener()
	public async add(
			warehouseId: string,
			products: IWarehouseProductCreateObject[],
			triggerChange: boolean = true
	): Promise<WarehouseProduct[]>
	{
		// TODO: use atomic operations (e.g.:findAndModify) or 2 phase commit
		// see http://blog.ocliw.com/2012/11/25/mongoose-add-to-an-existing-array/
		
		this.log.info('Adding products ' + JSON.stringify(products));
		
		// products not populated!
		let warehouse = await this._getWarehouse(warehouseId, false);
		
		const lastValue = _.clone(warehouse);
		
		// In practice to make it more reliable, we should go one by one, i.e. one product a time
		// and each time execute atomic operation on each product.
		// Say if product already there, we want to increase count using atomic operation by given value in the storage.
		// etc
		
		let newProds: IWarehouseProductCreateObject[];
		
		if(warehouse.products && warehouse.products.length > 0)
		{
			newProds = _.clone(warehouse.products);
			
			_.each(products, (product) =>
			{
				if(!product.isDeliveryRequired && !product.isTakeaway)
				{
					product.isDeliveryRequired = true;
				}
				const existed = _.find(
						newProds,
						(newProd) =>
								(newProd.product as string) ===
								(product.product as string)
				);
				
				if(
						typeof existed === 'undefined' ||
						existed === undefined ||
						existed == null
				)
				{
					newProds.push(product); // if no such product existed yet, we add it
				}
				else
				{
					// if product with same id already exists, we should increase his qty
					if(existed.count && product.count)
					{
						existed.count += product.count;
					}
					else
					{
						existed.count = product.count;
					}
					// should we merge price here? What if new products come with new price,
					// should we make "average" price in warehouse or use latest price instead?
				}
			});
		}
		else
		{
			newProds = products;
		}
		
		try
		{
			warehouse = new Warehouse(
					(await this.warehousesService.Model.findByIdAndUpdate(
							           warehouseId,
							           {
								           $set: { products: newProds }
							           },
							           { new: true }
					           )
					           .populate('products.product')
					           .lean()
					           .exec()) as IWarehouse
			);
		} catch(error)
		{
			this.log.error(error);
			throw error;
		}
		
		if(triggerChange)
		{
			this.warehousesService
			    .existence
			    .next({
				          id: warehouse.id,
				          value: warehouse,
				          lastValue: lastValue,
				          type: ExistenceEventType.Updated
			          });
		}
		
		const newProdsIds = _.map(newProds, (warehouseProduct) =>
		{
			if(typeof warehouseProduct.product === 'string')
			{
				return warehouseProduct.product as string;
			}
			else
			{
				return (warehouseProduct.product as IProduct)._id.toString();
			}
		});
		
		return _.filter(warehouse.products, (warehouseProduct) =>
		{
			return _.includes(newProdsIds, warehouseProduct.productId);
		});
	}
	
	/**
	 * Remove products from warehouse
	 *
	 * @param {string} warehouseId
	 * @param {string[]} productsIds
	 * @returns {Promise<WarehouseProduct[]>}
	 * @memberof WarehousesProductsService
	 */
	@asyncListener()
	public async remove(warehouseId: string, productsIds: string[]): Promise<WarehouseProduct[]>
	{
		this.log.info('Removing products ' + productsIds);
		
		const warehouse = await this._getWarehouse(warehouseId, true);
		warehouse.products = warehouse.products.filter((p) =>
		                                               {
			                                               if(!p.product['_id'])
			                                               {
				                                               return false;
			                                               }
			
			                                               const productId = p.product['id'];
			                                               return !productsIds.includes(productId);
		                                               });
		await this.warehousesService.save(warehouse);
		
		return warehouse.products;
	}
	
	/**
	 * Update warehouse product
	 *
	 * @param {string} warehouseId
	 * @param {WarehouseProduct} _updatedWarehouseProduct
	 * @returns {Promise<WarehouseProduct>}
	 * @memberof WarehousesProductsService
	 */
	@asyncListener()
	public async update(
			warehouseId: string,
			@serialization((u: IWarehouseProduct) => new WarehouseProduct(u))
					_updatedWarehouseProduct: WarehouseProduct
	): Promise<WarehouseProduct>
	{
		await this.warehousesService.throwIfNotExists(warehouseId);
		if(
				!_updatedWarehouseProduct.isDeliveryRequired &&
				!_updatedWarehouseProduct.isTakeaway
		)
		{
			throw new Error(noGetProductTypeMessage);
		}
		
		const updatedWarehouseProduct = _.clone(_updatedWarehouseProduct);
		updatedWarehouseProduct.product = updatedWarehouseProduct.productId;
		
		const updatedWarehouse = (
				await this.warehousesService.updateMultiple(
						{
							_id: new Types.ObjectId(warehouseId),
							'products._id': updatedWarehouseProduct._id
						},
						{
							'products.$': updatedWarehouseProduct
						}
				)
		)[0];
		
		return _.find(
				updatedWarehouse.products,
				(warehouseProduct) =>
						warehouseProduct.productId === updatedWarehouseProduct.productId
		) as WarehouseProduct;
	}
	
	/**
	 * Increase inventory of given product using existed product price by given count
	 * If no such product exists in warehouse yet, do nothing
	 *
	 * @param {string} warehouseId
	 * @param {string} productId
	 * @param {number} count
	 * @returns {Promise<WarehouseProduct>}
	 * @memberof WarehousesProductsService
	 */
	@asyncListener()
	public async increaseCount(
			warehouseId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		return this._changeCount(warehouseId, productId, count);
	}
	
	/**
	 * Increase sold qty of given product by given count
	 * If no such product exists in warehouse yet, do nothing
	 *
	 * @param {string} warehouseId
	 * @param {string} productId
	 * @param {number} count
	 * @returns {Promise<WarehouseProduct>}
	 * @memberof WarehousesProductsService
	 */
	@asyncListener()
	public async increaseSoldCount(
			warehouseId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		return this._changeCount(warehouseId, productId, count, "sold");
	}
	
	/**
	 * Increase views counter of given product by given count
	 * It increased on every unique product view by single customer
	 * If no such product exists in warehouse yet, do nothing
	 *
	 * @param {string} warehouseId
	 * @param {string} productId
	 * @param {number} count
	 * @returns {Promise<WarehouseProduct>}
	 * @memberof WarehousesProductsService
	 */
	@asyncListener()
	public async increaseViewsCount(
			warehouseId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		return this._changeCount(warehouseId, productId, count, "views");
	}
	
	/**
	 * Increase likes counter of given product by given count
	 * It increased when customer presses like on product details
	 * If no such product exists in warehouse yet, do nothing
	 *
	 * @param {string} warehouseId
	 * @param {string} productId
	 * @param {number} count
	 * @returns {Promise<WarehouseProduct>}
	 * @memberof WarehousesProductsService
	 */
	@asyncListener()
	public async increaseLikesCount(
			warehouseId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		return this._changeCount(warehouseId, productId, count, "likes");
	}
	
	/**
	 * Removes products from warehouse (called during sell of the product)
	 * Always cause change notification to be send to the clients
	 *
	 * @param {string} warehouseId
	 * @param {string} productId
	 * @param {number} count how many to remove
	 * @returns {Promise<WarehouseProduct>}
	 * @memberof WarehousesProductsService
	 */
	@asyncListener()
	public async decreaseCount(
			warehouseId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		return this._changeCount(warehouseId, productId, -count);
	}
	
	/**
	 * Decrease product's sold count from warehouse (called during the order cancel)
	 *
	 * @param {string} warehouseId
	 * @param {string} productId
	 * @param {number} count
	 * @returns {Promise<WarehouseProduct>}
	 * @memberof WarehousesProductsService
	 */
	@asyncListener()
	public async decreaseSoldCount(
			warehouseId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		return this._changeCount(warehouseId, productId, -count, "sold");
	}
	
	/**
	 * Decrease product's views count from warehouse (called when merchant is banned)
	 *
	 * @param {string} warehouseId
	 * @param {string} productId
	 * @param {number} count
	 * @returns {Promise<WarehouseProduct>}
	 * @memberof WarehousesProductsService
	 */
	@asyncListener()
	public async decreaseViewsCount(
			warehouseId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		return this._changeCount(warehouseId, productId, -count, "views");
	}
	
	/**
	 * Decrease products likes count from warehouse (called when merchant is banned)
	 *
	 * @param {string} warehouseId
	 * @param {string} productId
	 * @param {number} count
	 *
	 * @throws {Error} When warehouse with warehouseId or product with productId not found.
	 *
	 * @returns {Promise<WarehouseProduct>}
	 * @memberof WarehousesProductsService
	 */
	@asyncListener()
	public async decreaseLikesCount(
			warehouseId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		return this._changeCount(warehouseId, productId, -count, "likes");
	}
	
	/**
	 * Add comment from customer on the product's page
	 *
	 * @param {string} warehouseId
	 * @param {string} productId
	 * @param {IComment} comment
	 *
	 * @throws {Error} When warehouse with warehouseId or product with productId not found.
	 *
	 * @returns {Promise<WarehouseProduct>}
	 * @memberof WarehousesProductsService
	 */
	@asyncListener()
	public async addComment(
			warehouseId: string,
			productId: string,
			@serialization((c: IComment) => new Comment(c))
					comment: Comment
	): Promise<void>
	{
		const warehouse = await this._getWarehouse(warehouseId);
		const warehouseProduct = this._getProduct(productId, warehouse);
		
		if(!warehouseProduct.comments)
			warehouseProduct.comments = [];
		
		warehouseProduct.comments.push(comment);
		
		await this.update(warehouseId, warehouseProduct);
	}
	
	/**
	 * Remove comment from customer on the product's page
	 *
	 * @param {string} warehouseId
	 * @param {string} productId to which product should be added
	 * @param {string} commentId Id of comment
	 *
	 * @throws {Error} When warehouse with warehouseId or product with productId not found.
	 *
	 * @returns {Promise<void>}
	 * @memberof WarehousesProductsService
	 */
	@asyncListener()
	public async removeComment(
			warehouseId: string,
			productId: string,
			commentId: string
	): Promise<void>
	{
		const warehouse = await this._getWarehouse(warehouseId);
		const warehouseProduct = this._getProduct(productId, warehouse);
		warehouseProduct.comments = _.filter(
				warehouseProduct.comments,
				comment => comment.id !== commentId
		);
		_.forEach(warehouseProduct.comments, (comment, index) =>
		{
			if(comment.id === commentId)
			{
				warehouseProduct.comments.splice(index, 1);
			}
		})
		
		await this.update(warehouseId, warehouseProduct);
	}
	
	/**
	 * Change price for the product
	 *
	 * @param {string} warehouseId
	 * @param {string} productId which product price should be changed
	 * @param {number} price new price
	 * @returns {Promise<WarehouseProduct>}
	 * @memberof WarehousesProductsService
	 */
	@asyncListener()
	public async changePrice(
			warehouseId: string,
			productId: string,
			price: number
	): Promise<WarehouseProduct>
	{
		// TODO: Some global distributed lock should be apply here
		// so we can't change product price on 2 separate servers at the same time?
		
		const warehouse = await this._getWarehouse(warehouseId, false);
		
		this.log.info(
				'Change product price requested in warehouse: ' +
				JSON.stringify(warehouse) +
				' for product id: ' +
				productId
		);
		
		const product = _.find(
				warehouse.products,
				(p) => p.productId === productId
		);
		
		this._isValidProduct(warehouseId, productId, product);
		
		this.log.info(
				`Product price before: ${product.price} and we want to change it to: ${price}`
		);
		
		if(price >= 0)
			product.price = price;
		return this.update(warehouseId, product);
	}
	
	/**
	 * Get Top sold products from given Warehouse
	 *
	 * @param {string} warehouseId warehouse from which to return products
	 * @param {number} quantity how many products to return
	 * @returns {Observable<WarehouseProduct[]>}
	 * @memberof WarehousesProductsService
	 */
	@observableListener()
	public getTopProducts(warehouseId: string, quantity: number): Observable<WarehouseProduct[]>
	{
		return this.get(warehouseId)
		           .pipe(
				           map((warehouseProducts) =>
				               {
					               let topProducts = _.filter(
							               warehouseProducts,
							               (warehouseProduct) => warehouseProduct.soldCount > 0
					               );
					
					               topProducts = _.orderBy(
							               topProducts,
							               ['soldCount'],
							               ['desc']
					               );
					
					               return _.take(topProducts, quantity);
				               })
		           );
	}
	
	@observableListener()
	public getProduct(
			warehouseId: string,
			warehouseProductId: string
	): Observable<WarehouseProduct>
	{
		return this.warehousesService
		           .get(warehouseId, true)
		           .pipe(
				           exhaustMap((warehouse) =>
				                      {
					                      if(warehouse === null)
					                      {
						                      return _throw(
								                      new Error(
										                      `Warehouse with the id ${warehouseId} doesn't exist`
								                      )
						                      );
					                      }
					                      else
					                      {
						                      return of(warehouse);
					                      }
				                      }),
				           map((warehouse) =>
						               warehouse.products.find((p) => p.id === warehouseProductId)
				           )
		           );
	}
	
	/**
	 * Changes availability of the product
	 *
	 * @param {string} warehouseId Id of warehouse containing product
	 * @param {string} productId Id of product of warehouse to apply change
	 * @param {boolean} isAvailable Value to change
	 *
	 * @returns {Promise<WarehouseProduct>} Updated warehouse promise
	 * */
	@asyncListener()
	public async changeProductAvailability(
			warehouseId: string,
			productId: string,
			isAvailable: boolean
	): Promise<WarehouseProduct>
	{
		const warehouse = await this._getWarehouse(warehouseId);
		const existedProduct = this._getProduct(productId, warehouse);
		existedProduct.isProductAvailable = isAvailable;
		return this.update(warehouseId, existedProduct);
	}
	
	/**
	 * Changes value of isTakeaway for product
	 *
	 * @param {string} warehouseId Id of warehouse containing product
	 * @param {string} productId Id of product of warehouse to apply change
	 * @param {boolean} isTakeaway Value to change
	 *
	 * @returns {Promise<WarehouseProduct>} Updated warehouse promise
	 * */
	@asyncListener()
	public async changeProductTakeaway(
			warehouseId: string,
			productId: string,
			isTakeaway: boolean
	): Promise<WarehouseProduct>
	{
		return this._changeProductDeliveryType(
				warehouseId,
				productId,
				DeliveryType.Takeaway,
				isTakeaway
		);
	}
	
	/**
	 * Changes value of isDeliveryRequired for product
	 *
	 * @param {string} warehouseId Id of warehouse containing product
	 * @param {string} productId Id of product of warehouse to apply change
	 * @param {boolean} isDelivery Value to change
	 *
	 * @returns {Promise<WarehouseProduct>} Updated warehouse promise
	 * */
	@asyncListener()
	public async changeProductDelivery(
			warehouseId: string,
			productId: string,
			isDelivery: boolean
	): Promise<WarehouseProduct>
	{
		return this._changeProductDeliveryType(
				warehouseId,
				productId,
				DeliveryType.Delivery,
				isDelivery
		);
	}
	
	/**
	 * Searches for warehouse and checks if it is valid.
	 *
	 * @param {string} warehouseId Id of warehouse to get.
	 * @param {boolean} fullProducts Populate with product details.
	 *
	 * @throws {Error} When warehouse with warehouseId not found.
	 *
	 * @returns {Warehouse | null}
	 * @memberOf {WarehousesProductsService}
	 * */
	protected async _getWarehouse(
			warehouseId: string,
			fullProducts: boolean = true
	): Promise<Warehouse | null>
	{
		const warehouse = await this.warehousesService
		                            .get(warehouseId, fullProducts)
		                            .pipe(first())
		                            .toPromise();
		
		this._isValidWarehouse(warehouseId, warehouse);
		
		return warehouse;
	}
	
	/**
	 * Searches for product and checks if it is valid.
	 *
	 * @param {string} productId Id of product of warehouse to check for validity.
	 * @param {Warehouse} warehouse Warehouse containing product.
	 *
	 * @throws {Error} When product with productId not found.
	 * @memberOf {WarehousesProductsService}
	 * */
	protected _getProduct(productId: string, warehouse: Warehouse): WarehouseProduct | null
	{
		this._isValidWarehouse(warehouse.id, warehouse);
		const warehouseProduct = _.find(
				warehouse.products,
				(product) => product.productId === productId
		);
		
		this._isValidProduct(warehouse.id, productId, warehouseProduct);
		return warehouseProduct
	}
	
	/**
	 * Applies delivery type change for product
	 *
	 * @param {string} warehouseId
	 * @param {string} productId
	 * @param {DeliveryType} deliveryType
	 * @param {boolean} value Value of type change
	 *
	 * @throws {Error} If wrong type specified
	 *
	 * @returns {Promise<WarehouseProduct>} Updated warehouse promise
	 * */
	protected async _changeProductDeliveryType(
			warehouseId: string,
			productId: string,
			deliveryType: DeliveryType,
			value: boolean
	): Promise<WarehouseProduct>
	{
		const warehouse = await this._getWarehouse(warehouseId);
		const warehouseProduct = this._getProduct(productId, warehouse);
		
		this.log.info(
				'Change product delivery type requested in warehouse: ' +
				JSON.stringify(warehouse) +
				' for product id: ' + productId + ' to ' + deliveryType.toString()
		);
		
		switch(deliveryType)
		{
			case DeliveryType.Takeaway:
				warehouseProduct.isTakeaway = value;
				break;
			case DeliveryType.Delivery:
				warehouseProduct.isDeliveryRequired = value;
				break;
			default:
			{
				const error = new Error(`Invalid delivery type: ${deliveryType}`);
				
				this.log.error(error);
				
				throw error;
			}
		}
		
		return this.update(warehouseId, warehouseProduct);
	}
	
	/**
	 * Increases or decreases number of product's
	 * quantity/sold/views/likes count in warehouse
	 *
	 * @param {string} warehouseId Id of warehouse to update products
	 * @param {string} productId Id of product to change count
	 * @param {number} count Count to change, for increase must be positive value
	 * @param {CountOpType} opType Type of change to apply on product in warehouse.
	 * Available: qty, sold, likes, views. Default: qty
	 *
	 * @returns {Promise<WarehouseProduct>} Updated warehouse promise
	 * */
	protected async _changeCount(
			warehouseId: string,
			productId: string,
			count: number,
			opType: CountOpType = "qty"
	): Promise<WarehouseProduct>
	{
		// TODO: Some global distributed lock should be apply here so we can't change product (sold) count on 2 separate servers at the same time!
		
		const warehouse = await this._getWarehouse(warehouseId);
		const warehouseProduct = this._getProduct(productId, warehouse);
		
		// check only for negative values
		const countCheck = (currentCount, changeCount): void =>
		{
			this.log.info(
					`Remove requested in warehouse: ${
							JSON.stringify(warehouse)
					} for product id: ${productId}`
			);
			
			if(currentCount < Math.abs(changeCount))
			{
				const error = new Error(`Request to remove more (${changeCount}) than available (${currentCount})`);
				this.log.error({ err: error, changeCount });
				throw error;
			}
			
			let op = count > 0 ? 'increase' : 'decrease';
			this.log.info(
					`Product ${opType !== "qty" ? opType : ''} count before ${op}: ${
							currentCount
					} and we want to ${op} ${Math.abs(changeCount)}`
			);
		};
		
		if(!count)
			return warehouseProduct;
		
		switch(opType)
		{
			case "qty":
			{
				if(count < 0)
					countCheck(warehouseProduct.count, count);
				warehouseProduct.count += count;
			}
				break;
			case "sold":
			{
				if(count < 0)
					countCheck(warehouseProduct.soldCount, count);
				warehouseProduct.soldCount += count;
			}
				break;
			case "views":
			{
				if(count < 0)
					countCheck(warehouseProduct.viewsCount, count);
				warehouseProduct.viewsCount += count;
			}
				break;
			case "likes":
			{
				if(count < 0)
					countCheck(warehouseProduct.likesCount, count);
				warehouseProduct.likesCount += count;
			}
		}
		
		return this.update(warehouseId, warehouseProduct);
	}
	
	/**
	 * Null check for warehouse
	 *
	 * @param {string} warehouseId
	 * @param {Warehouse} warehouse
	 *
	 * @throws {Error}
	 * */
	private _isValidWarehouse(warehouseId: string, warehouse: Warehouse): void
	{
		if(!warehouse)
		{
			const error = new Error(`Warehouse with the id ${warehouseId} doesn't exist`);
			this.log.error(error);
			throw error;
		}
	}
	
	/**
	 * Null check for warehouse product
	 *
	 * @param {string} warehouseId
	 * @param {string} productId
	 * @param {WarehouseProduct} warehouseProduct
	 *
	 * @throws {Error}
	 *
	 * */
	private _isValidProduct(
			warehouseId: string,
			productId: string,
			warehouseProduct: WarehouseProduct | null
	): void
	{
		if(!warehouseProduct)
		{
			const error = new Error(
					`There is no such an product with the id ${productId} in the warehouse with the id ${warehouseId}`
			);
			this.log.error(error);
			throw error;
		}
	}
}
