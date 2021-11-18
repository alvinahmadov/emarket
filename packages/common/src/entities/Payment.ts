import { ModelName, DBObject, Types, Schema } from '@pyro/db';
import IPayment, {
	IPaymentCreateObject
}                                             from '../interfaces/IPayment';
import PaymentGateways                        from '../enums/PaymentGateways';
import { Column }                             from 'typeorm';

/**
 * Stores type of payment gateway and configuration object for such payment gateway
 *
 * @class Payment
 * @extends {DBObject<IPaymentGateway, IPaymentGatewayCreateObject>}
 * @implements {IPaymentGateway}
 */
@ModelName('Payment')
class Payment
		extends DBObject<IPayment, IPaymentCreateObject>
		implements IPayment
{
	/**
	 * Type of the payment gateway
	 *
	 * @type {PaymentGateways}
	 * @memberof Payment
	 */
	@Types.Number()
	@Column()
	paymentGateway: PaymentGateways;
	
	/**
	 * Id of the customer
	 *
	 * @type {string}
	 * @memberof Payment
	 */
	@Types.String()
	@Column()
	customerId: string;
	
	/**
	 * Custom data object needed by payment 3rd party services.
	 *
	 * Note: this field has no concrete type, because different payment systems
	 * may have different fields in the custom object
	 *
	 * @type {Object}
	 * @memberof Payment
	 */
	@Schema({ type: Object })
	@Column()
	customData: any;
}

export default Payment;
