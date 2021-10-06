import { Column }                                 from 'typeorm';
import GeoLocation                                from './GeoLocation';
import { DBObject, getSchema, ModelName, Schema } from '../@pyro/db';
import ICustomerOrder,
{ ICustomerOrderCreateObject }                    from '../interfaces/ICustomerOrder';

/**
 * Store information about Customer inside (embeded into) Order
 * The data is usually copied from the Customer record in DB right after order created
 *
 * @class CustomerOrder
 * @extends {DBObject<ICustomerOrder, ICustomerOrderCreateObject>}
 * @implements {ICustomerOrder}
 */
@ModelName('CustomerOrder')
class CustomerOrder extends DBObject<ICustomerOrder, ICustomerOrderCreateObject>
		implements ICustomerOrder
{
	/**
	 * Username
	 *
	 * @type {string}
	 * @memberof UserOrder
	 */
	@Schema({ type: String, required: false })
	@Column()
	username: string;
	
	/**
	 * Primary Email Address
	 *
	 * @type {string}
	 * @memberof UserOrder
	 */
	@Schema({
		        type:     String,
		        required: false,
		        sparse:   true
	        })
	@Column()
	email: string;
	
	/**
	 * First Name
	 *
	 * @type {string}
	 * @memberof UserOrder
	 */
	@Schema({ type: String, required: false })
	@Column()
	firstName?: string;
	
	/**
	 * Last Name
	 *
	 * @type {string}
	 * @memberof UserOrder
	 */
	@Schema({ type: String, required: false })
	@Column()
	lastName?: string;
	
	/**
	 * Customer Image (Photo/Avatar) URL
	 * (optional)
	 *
	 * @type {string}
	 * @memberof UserOrder
	 */
	@Schema({ type: String, required: false })
	@Column()
	avatar: string;
	
	/**
	 * Password Hash
	 *
	 * @type {string}
	 * @memberof UserOrder
	 */
	@Schema({ type: String, required: false, select: false })
	@Column()
	hash?: string;
	
	/**
	 * Current customer location (customer address, last known location of the customer)
	 *
	 * @type {GeoLocation}
	 * @memberof UserOrder
	 */
	@Schema(getSchema(GeoLocation))
	geoLocation: GeoLocation;
	
	/**
	 * Apartment (stored separately from geolocation/address for efficiency)
	 *
	 * @type {string}
	 * @memberof UserOrder
	 */
	@Schema(String)
	@Column()
	apartment: string;
	
	/**
	 * CustomerId in the Stripe payment gateway (if customer added to Stripe, optional)
	 *
	 * @type {string}
	 * @memberof UserOrder
	 */
	@Schema({ type: String, required: false })
	@Column()
	stripeCustomerId?: string;
	
	/**
	 * IDs of customer mobile devices / browser
	 *
	 * @type {string[]}
	 * @memberof UserOrder
	 */
	@Schema([String])
	devicesIds: string[];
	
	/**
	 * IDs of customer in social networks / OAuth providers
	 *
	 * @type {string[]}
	 * @memberof UserOrder
	 */
	@Schema([String])
	socialIds: string[];
	
	/**
	 * Customer Primary Phone Number
	 *
	 * @type {string}
	 * @memberof UserOrder
	 */
	@Schema(String)
	@Column()
	phone?: string;
	
	/**
	 * Is customer completed registration
	 *
	 * @type {boolean}
	 * @memberof UserOrder
	 */
	@Schema(Boolean)
	@Column()
	isRegistrationCompleted: boolean;
	
	constructor(userOrder: ICustomerOrder)
	{
		super(userOrder);
		
		if(userOrder && userOrder.geoLocation)
		{
			this.geoLocation = new GeoLocation(userOrder.geoLocation);
		}
	}
	
	/**
	 * Get full address of customer (including apartment)
	 * Note: does not include country
	 *
	 * @readonly
	 * @memberof UserOrder
	 */
	get fullAddress(): string
	{
		return (
				`${this.geoLocation.city}, ${this.geoLocation.streetAddress} ` +
				`${this.geoLocation.house} ${this.apartment ? '/' + this.apartment : ''}`
		);
	}
	
	/**
	 * Get full name of customer
	 *
	 * @readonly
	 * @memberof UserOrder
	 */
	get fullName(): string
	{
		if(this.firstName)
		{
			if(this.lastName)
				return `${this.firstName} ${this.lastName}`;
			
			return this.firstName;
		}
		return `${this.username}`;
	}
}

export default CustomerOrder;
