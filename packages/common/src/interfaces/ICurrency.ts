import { DBCreateObject, DBRawObject, PyroObjectId } from '@pyro/db';

export interface ICurrencyCreateObject extends DBCreateObject
{
	code: string;
	name?: string;
	sign?: string;
	order?: string;
	isDeleted?: boolean;
}

interface ICurrency extends ICurrencyCreateObject, DBRawObject
{
	_id: PyroObjectId;
	isDeleted: boolean;
}

export default ICurrency;
