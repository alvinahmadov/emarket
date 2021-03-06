import { CreateObject } from '@pyro/db/db-create-object';
import Warehouse        from '../entities/Warehouse';

export interface IWarehouseRegistrationInput
{
	warehouse: CreateObject<Warehouse>;
	password: string;
}

export interface IWarehouseLoginResponse
{
	warehouse: Warehouse;
	token: string;
}

interface IWarehouseAuthRouter
{
	register(input: IWarehouseRegistrationInput): Promise<Warehouse>;
	
	login(
			username: string,
			password: string
	): Promise<IWarehouseLoginResponse | null>;
	
	isAuthenticated(token: string): Promise<boolean>;
	
	updatePassword(
			id: Warehouse['id'],
			password: { current?: string; new: string }
	): Promise<void>;
}

export default IWarehouseAuthRouter;
