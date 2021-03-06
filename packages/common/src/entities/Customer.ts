import { Entity, Column }                   from 'typeorm';
import GeoLocation                          from './GeoLocation';
import {
	DBObject,
	getSchema,
	ModelName,
	Schema,
	Types
}                                           from '../@pyro/db';
import ICustomer, { ICustomerCreateObject } from '../interfaces/ICustomer';
import Role                                 from '../enums/Role';

export const avatar = "https://res.cloudinary.com/alvindre/image/upload/v1636330324/placeholders/avatar.jpg";

/**
 * Customer who make orders
 *
 * @class Customer
 * @extends {DBObject<ICustomer, ICustomerCreateObject>}
 * @implements {ICustomer}
 */
@ModelName('Customer')
@Entity({ name: 'customers' })
class Customer extends DBObject<ICustomer, ICustomerCreateObject> implements ICustomer
{
	/**
	 * User Name
	 *
	 * @type {string}
	 * @memberof User
	 */
	@Schema({ type: String, required: true })
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
		        required: true,
		        sparse:   true,
		        unique:   true
	        })
	@Column()
	email: string;
	
	/**
	 * Password hash
	 *
	 * @type {string}
	 * @memberof User
	 */
	@Schema({
		        type:     String,
		        required: false,
		        select:   false
	        })
	@Column()
	hash?: string;
	
	/**
	 * Customer Image (Photo/Avatar) URL
	 * (optional)
	 *
	 * @type {string}
	 * @memberof User
	 */
	@Schema({ type: String, required: false, default: avatar })
	@Column()
	avatar: string;
	
	/**
	 * First Name
	 *
	 * @type {string}
	 * @memberof User
	 */
	@Schema({ type: String, required: false })
	@Column()
	firstName?: string;
	
	/**
	 * Last Name
	 *
	 * @type {string}
	 * @memberof User
	 */
	@Schema({ type: String, required: false })
	@Column()
	lastName?: string;
	
	@Schema({
		        type:     String,
		        default:  'customer',
		        required: false
	        })
	@Column()
	role?: Role;
	
	/**
	 * Current customer location (customer address, last known location of the customer)
	 *
	 * @type {GeoLocation}
	 * @memberof User
	 */
	@Schema(getSchema(GeoLocation))
	geoLocation: GeoLocation;
	
	/**
	 * Apartment (stored separately from geolocation/address for efficiency)
	 *
	 * @type {string}
	 * @memberof User
	 */
	@Schema({ type: String, required: false, default: "" })
	@Column()
	apartment: string;
	
	/**
	 * CustomerId in the Stripe payment gateway (if customer added to Stripe, optional)
	 *
	 * @type {string}
	 * @memberof User
	 */
	@Schema({ type: String, required: false })
	@Column()
	stripeCustomerId?: string;
	
	/**
	 * IDs of customer mobile devices / browser (see Device entity)
	 *
	 * @type {string[]}
	 * @memberof User
	 */
	@Schema([String])
	devicesIds: string[];
	
	/**
	 * IDs of customer in social networks / OAuth providers
	 *
	 * @type {string[]}
	 * @memberof User
	 */
	@Schema([String])
	socialIds: string[];
	
	/**
	 * Customer Primary Phone Number
	 *
	 * @type {string}
	 * @memberof User
	 */
	@Schema(String)
	@Column()
	phone?: string;
	
	/**
	 * Is customer completed registration
	 *
	 * @type {boolean}
	 * @memberof User
	 */
	@Schema(Boolean)
	@Column()
	isRegistrationCompleted: boolean;
	
	/**
	 * Is customer banned
	 *
	 * @type {boolean}
	 * @memberof User
	 */
	@Types.Boolean(false)
	@Column()
	isBanned: boolean;
	
	@Types.Boolean(false)
	@Column()
	isDeleted: boolean;
	
	constructor(customer: ICustomer)
	{
		super(customer);
		
		if(customer && customer.geoLocation)
		{
			this.geoLocation = new GeoLocation(customer.geoLocation);
		}
	}
	
	/**
	 * Get full name of customer or username if none provided
	 *
	 * @readonly
	 * @memberof User
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
	
	/**
	 * Get full address of customer (including apartment)
	 * Note: does not include country
	 *
	 * @readonly
	 * @memberof User
	 */
	get fullAddress(): string
	{
		const city = this.geoLocation?.city
		             ? `${this.geoLocation.city}, `
		             : "";
		const streetAddress = this.geoLocation?.streetAddress
		                      ? `${this.geoLocation.streetAddress} `
		                      : "";
		const apartment = this.apartment
		                  ? `${this.apartment}/`
		                  : "";
		const house = this.geoLocation?.house
		              ? this.geoLocation.house
		              : "";
		
		return (
				`${city}${streetAddress}${apartment}${house}`
		);
	}
}

export default Customer;
