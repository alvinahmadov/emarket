import Carrier          from '../entities/Carrier';
import { CreateObject } from '@pyro/db/db-create-object';

export interface ICarrierRegistrationInput
{
	carrier: CreateObject<Carrier>;
	password: string;
}

export interface ICarrierLoginResponse
{
	carrier: Carrier;
	token: string;
}

interface ICarrierAuthRouter
{
	login(
			username: string,
			password: string
	): Promise<ICarrierLoginResponse | null>;
	
	register(input: ICarrierRegistrationInput): Promise<Carrier>;
	
	updatePassword(
			id: Carrier['id'],
			password: { current?: string; new: string }
	): Promise<void>;
}

export default ICarrierAuthRouter;
