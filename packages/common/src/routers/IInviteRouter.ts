import { Observable }   from 'rxjs';
import { CreateObject } from '@pyro/db/db-create-object';
import IEnterByLocation from '../interfaces/IEnterByLocation';
import IEnterByCode     from '../interfaces/IEnterByCode';
import IStreetLocation  from '../interfaces/IStreetLocation';
import {
	IInviteCreateObject,
	IInviteUpdateObject
}                       from '../interfaces/IInvite';
import Invite           from '../entities/Invite';

export interface IInvitesFindInput
{
	code?: string;
	apartment?: string
	// TODO: GeoLocation
}

export interface IInviteIdInput
{
	id: string;
}

export interface IInviteUpdateInput extends IInviteIdInput
{
	updateInput: IInviteUpdateObject;
}

export interface IInviteCreateInput
{
	createInput: IInviteCreateObject;
}

interface IInviteRouter
{
	get(id: Invite['id']): Observable<Invite | null>;
	
	getInvitedStreetLocations(): Observable<IStreetLocation[]>;
	
	getByLocation(info: IEnterByLocation): Observable<Invite | null>;
	
	getByCode(info: IEnterByCode): Observable<Invite | null>;
	
	create(inviteCreateObject: CreateObject<Invite>): Promise<Invite>;
	
	getInvitesSettings(): Promise<{ isEnabled: boolean }>;
}

export default IInviteRouter;
