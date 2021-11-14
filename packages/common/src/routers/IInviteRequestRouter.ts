import { Observable }   from 'rxjs';
import { CreateObject } from '../@pyro/db/db-create-object';
import Invite           from '../entities/Invite';
import InviteRequest    from '../entities/InviteRequest';

export interface IInviteRequesGenerateInput
{
	qty?: number;
	defaultLng: number;
	defaultLat: number;
}

export interface IInviteRequestIdInput
{
	id: string;
}

export interface INotifyAboutInput
{
	invite: Invite;
	devicesIds: string[];
}

interface IInviteRequestRouter
{
	get(id: InviteRequest['id']): Observable<InviteRequest | null>;
	
	create(inviteRequest: CreateObject<InviteRequest>): Promise<InviteRequest>;
}

export default IInviteRequestRouter;
