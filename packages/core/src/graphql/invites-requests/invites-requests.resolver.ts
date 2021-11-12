import { UseGuards }                  from '@nestjs/common';
import { Resolver, Query, Mutation }  from '@nestjs/graphql';
import { first }                      from 'rxjs/operators';
import { IInviteRequestCreateObject } from '@modules/server.common/interfaces/IInviteRequest';
import Invite                         from '@modules/server.common/entities/Invite';
import InviteRequest                  from '@modules/server.common/entities/InviteRequest';
import { FakeDataGuard }              from '../../auth/guards/fake-data.guard';
import { InvitesRequestsService }     from '../../services/invites';

@Resolver('Invite-request')
export class InviteRequestResolver
{
	constructor(
			private readonly _invitesRequestsService: InvitesRequestsService
	)
	{}
	
	@Query()
	@UseGuards(FakeDataGuard)
	public async generate1000InviteRequests(
			_,
			{ defaultLng, defaultLat }: { defaultLng: number; defaultLat: number }
	): Promise<void>
	{
		await this._invitesRequestsService.generate1000InviteRequests(
				defaultLng,
				defaultLat
		);
	}
	
	@Query('inviteRequest')
	public async getInviteRequest(_, { id }: { id: string }): Promise<InviteRequest>
	{
		return this._invitesRequestsService.get(id).pipe(first()).toPromise();
	}
	
	@Query('notifyAboutLaunch')
	public async notifyAboutLaunch(
			_,
			{
				devicesIds,
				invite
			}: {
				invite: Invite;
				devicesIds: string[];
			}
	): Promise<void>
	{
		return this._invitesRequestsService.notifyAboutLaunch(
				invite,
				devicesIds
		);
	}
	
	@Query('invitesRequests')
	public async getInvitesRequests(_, { findInput, invited, pagingOptions = {} }): Promise<InviteRequest[]>
	{
		if(!pagingOptions || (pagingOptions && !pagingOptions['sort']))
		{
			pagingOptions['sort'] = { field: '_createdAt', sortBy: 'asc' };
		}
		
		const invitesRequests = await this._invitesRequestsService.getInvitesRequests(
				findInput,
				invited,
				pagingOptions
		);
		
		return invitesRequests.map((i) => new InviteRequest(i));
	}
	
	@Query()
	public async getCountOfInvitesRequests(_, { invited }): Promise<number>
	{
		const findObj = { isDeleted: { $eq: false } };
		
		if(!invited)
		{
			findObj['isInvited'] = { $eq: false };
		}
		
		return this._invitesRequestsService.Model.find(findObj)
		           .countDocuments()
		           .exec();
	}
	
	@Mutation()
	public async createInviteRequest(
			_,
			{ createInput }: { createInput: IInviteRequestCreateObject }
	): Promise<InviteRequest>
	{
		return this._invitesRequestsService.create(createInput);
	}
	
	@Mutation()
	public async updateInviteRequest(
			_,
			{ id, updateInput }: { id: string; updateInput }
	): Promise<InviteRequest>
	{
		await this._invitesRequestsService.throwIfNotExists(id);
		return this._invitesRequestsService.update(id, updateInput);
	}
	
	@Mutation()
	public async removeInviteRequest(_, { id }: { id: string }): Promise<void>
	{
		await this._invitesRequestsService.throwIfNotExists(id);
		return this._invitesRequestsService.remove(id);
	}
	
	@Mutation()
	public async removeInvitesRequestsByIds(_, { ids }: { ids: string[] }): Promise<void>
	{
		const inviteRequests = await this._invitesRequestsService.find({
			                                                               _id:       { $in: ids },
			                                                               isDeleted: { $eq: false }
		                                                               });
		
		const inviteRequestsIds = inviteRequests.map((d) => d.id);
		
		return this._invitesRequestsService.removeMultipleByIds(
				inviteRequestsIds
		);
	}
}
