import { Observable }   from 'rxjs';
import { CreateObject } from '@pyro/db/db-create-object';
import { UpdateObject } from '@pyro/db/db-update-object';
import IAdmin           from '../interfaces/IAdmin';
import Admin            from '../entities/Admin';

export interface IAdminLoginResponse
{
	admin: Admin;
	token: string;
}

export interface IAdminIdInput
{
	id: Admin['id'];
}

export interface IAdminEmailInput
{
	email: string;
}

export interface IAdminLoginInput
{
	authInfo: string;
	password: string;
	expiresIn?: string | number;
}

export interface IAdminRegistrationInput
{
	admin: CreateObject<Admin>;
	password?: string;
}

export interface IAdminUpdateInput extends IAdminIdInput
{
	updateInput: UpdateObject<Admin>;
}

interface IPasswordUpdateInput
{
	current: string;
	new: string;
}

export interface IAdminPasswordUpdateInput extends IAdminIdInput
{
	password: IPasswordUpdateInput;
}

interface IAdminRouter
{
	get(id: Admin['id']): Observable<Admin | null>;
	
	register(input: IAdminRegistrationInput): Promise<Admin>;
	
	login(authInfo: string, password: string, expiresIn?: string | number): Promise<IAdminLoginResponse | null>;
	
	updateById(id: Admin['id'], updateObject: Partial<IAdmin>): Promise<Admin>;
}

export default IAdminRouter;
