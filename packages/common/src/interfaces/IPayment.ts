import PaymentGateways                               from '../enums/PaymentGateways';
import { DBCreateObject, DBRawObject, PyroObjectId } from '@pyro/db';

export interface IPaymentCreateObject extends DBCreateObject
{
	paymentGateway: PaymentGateways;
	customerId: string;
	customData: any;
}

interface IPayment extends DBRawObject,
                           IPaymentCreateObject
{
	_id: PyroObjectId;
	_createdAt: Date | string;
	_updatedAt: Date | string;
}

export default IPayment;
