import { ModelName, DBObject, Types, Schema } from '@pyro/db';
import { Entity, Column }                     from 'typeorm';
import ICurrency, { ICurrencyCreateObject }   from '../interfaces/ICurrency';

/**
 * @class Currency
 * @extends {DBObject<ICurrency, ICurrencyCreateObject>}
 * @implements {ICurrency}
 */
@ModelName('Currency')
@Entity({ name: 'currencies' })
class Currency extends DBObject<ICurrency, ICurrencyCreateObject>
		implements ICurrency
{
	/**
	 * Currency Code
	 *
	 * @type {string}
	 * @memberof Currency
	 */
	@Schema({ type: String, unique: true, length: 3 })
	@Column()
	code: string;
	
	@Schema({ type: String, unique: true, required: false })
	@Column()
	name: string;
	
	@Types.String('')
	@Column()
	sign: string;
	
	@Types.String('after')
	@Column()
	order: string;
	
	/**
	 * Is Currency removed completely from the system
	 *
	 * @type {boolean}
	 * @memberof Currency
	 */
	@Types.Boolean(false)
	@Column()
	isDeleted: boolean;
}

export default Currency;
