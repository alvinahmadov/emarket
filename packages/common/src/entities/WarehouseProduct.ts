import { Column }                             from 'typeorm';
import { DBObject, ModelName, Schema, Types } from '@pyro/db';
import IProduct                               from '../interfaces/IProduct';
import IWarehouseProduct,
{
	IProductRating,
	IProductPromotion,
	IWarehouseProductCreateObject
}                                             from '../interfaces/IWarehouseProduct';
import Comment                                from './Comment';
import Product                                from './Product';

/**
 * Represent Warehouse (Merchant) inventory item (some product / service) for sale
 * Each warehouse may have some qty of items of some product and price can change for all of
 * them only (i.e. say price decrease every 1 min for 1$ but for all 4 products in warehouse)
 * In MongoDB stored as sub-documents inside Warehouse document (not as a separate collection)
 *
 * @class WarehouseProduct
 * @extends {DBObject<IWarehouseProduct, IWarehouseProductCreateObject>}
 * @implements {IWarehouseProduct}
 */
@ModelName('WarehouseProduct')
class WarehouseProduct
		extends DBObject<IWarehouseProduct, IWarehouseProductCreateObject>
		implements IWarehouseProduct
{
	/**
	 * Current Price of product (real-time)
	 * Note: some warehouses may have different prices for the same product
	 * compared to other warehouses.  It is especially true, when prices go down/up in some
	 * warehouses more quickly compared to others etc
	 *
	 * @type {number}
	 * @memberof WarehouseProduct
	 */
	@Types.Number()
	@Column()
	price: number;
	
	/**
	 * Start price for product.
	 * Initially equals to the value from price field, but over the time price can go down/up,
	 * while initialPrice will always remain the same.
	 * We calculate % of discount using price and initialPrice values
	 *
	 * @type {number}
	 * @memberof WarehouseProduct
	 */
	@Types.Number()
	@Column()
	initialPrice: number;
	
	/**
	 * How many products available currently for purchase
	 *
	 * @type {number}
	 * @memberof WarehouseProduct
	 */
	@Types.Number(0)
	@Column()
	count: number;
	
	/**
	 * How many products are sold
	 *
	 * @type {number}
	 * @memberof WarehouseProduct
	 */
	@Types.Number(0)
	@Column()
	soldCount: number;
	
	/**
	 * How many views product have
	 *
	 * @type {number}
	 * @memberof WarehouseProduct
	 */
	@Types.Number(0)
	@Column()
	viewsCount: number;
	
	/**
	 * Rate of product from customer
	 *
	 * @type {number}
	 * @memberof WarehouseProduct
	 */
	@Schema({ type: Array })
	rating: IProductRating[];
	
	@Column()
	promotion: IProductPromotion;
	
	/**
	 * Ref to Product
	 *
	 * @type {(Product | string)}
	 * @memberof WarehouseProduct
	 */
	@Types.Ref(Product)
	product: Product | string;
	
	/**
	 * Comments
	 * */
	@Schema({ type: Array })
	comments?: Comment[];
	
	/**
	 * Is product(s) require manufacturing
	 *
	 * @type {boolean}
	 * @memberof WarehouseProduct
	 */
	@Column()
	@Types.Boolean(true)
	isManufacturing: boolean;
	
	/**
	 * Is product(s) become available only when carrier found
	 *
	 * @type {boolean}
	 * @memberof WarehouseProduct
	 */
	@Column()
	@Types.Boolean(true)
	isCarrierRequired: boolean;
	
	/**
	 * Is product(s) require delivery to customer or available for pickup
	 *
	 * @type {boolean}
	 * @memberof WarehouseProduct
	 */
	@Column()
	@Types.Boolean(true)
	isDeliveryRequired: boolean;
	
	/**
	 * Is product available for purchase
	 *
	 * @type {boolean}
	 * @memberof WarehouseProduct
	 */
	@Column()
	@Types.Boolean(true)
	isProductAvailable: boolean;
	
	@Schema({ required: false, type: Boolean })
	@Column()
	isTakeaway?: boolean;
	
	/**
	 * Min delivery time (in minutes)
	 *
	 * @type {number}
	 * @memberof WarehouseProduct
	 */
	@Schema({ required: false, type: Number })
	@Column()
	deliveryTimeMin?: number;
	
	/**
	 * Max delivery time (in minutes)
	 *
	 * @type {number}
	 * @memberof WarehouseProduct
	 */
	@Schema({ required: false, type: Number })
	@Column()
	deliveryTimeMax?: number;
	
	constructor(warehouseProduct: IWarehouseProduct)
	{
		super(warehouseProduct);
		
		if(typeof warehouseProduct.product !== 'string')
		{
			this.product = new Product(warehouseProduct.product as IProduct);
			
			if(!warehouseProduct.promotion)
			{
				this.promotion = {
					active:    false,
					requested: false
				}
			}
		}
	}
	
	/**
	 * Get ProductId
	 *
	 * @readonly
	 * @type {string}
	 * @memberof WarehouseProduct
	 */
	public get productId(): string
	{
		if(typeof this.product === 'string')
		{
			return this.product as string;
		}
		else
		{
			return (this.product as Product).id;
		}
	}
}

export type WithPopulatedProduct = WarehouseProduct & { product: Product };

export default WarehouseProduct;
