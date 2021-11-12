import { UseGuards }                 from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { first }                     from 'rxjs/operators';
import IEnterByCode                  from '@modules/server.common/interfaces/IEnterByCode';
import IEnterByLocation              from '@modules/server.common/interfaces/IEnterByLocation';
import IPagingOptions                from '@modules/server.common/interfaces/IPagingOptions';
import {
	IInviteCreateInput,
	IInviteIdInput,
	IInvitesFindInput,
	IInviteUpdateInput
}                                    from '@modules/server.common/routers/IInviteRouter';
import Invite                        from '@modules/server.common/entities/Invite';
import { FakeDataGuard }             from '../../auth/guards/fake-data.guard';
import { InvitesRequestsService }    from '../../services/invites';
import { InvitesService }            from '../../services/invites/InvitesService';
import { FakeInvitesService }        from '../../services/fake-data/FakeInvitesService';

@Resolver('Invite')
export class InviteResolver
{
	constructor(
			private readonly _invitesService: InvitesService,
			private readonly _inviteRequestsService: InvitesRequestsService
	)
	{}
	
	@Query()
	@UseGuards(FakeDataGuard)
	public async generate1000InvitesConnectedToInviteRequests(
			_,
			{ defaultLng, defaultLat }: { defaultLng: number; defaultLat: number }
	): Promise<void>
	{
		return this.generateInvitesConnectedToInviteRequests(
				_,
				{ defaultLat, defaultLng }
		);
	}
	
	@Query()
	@UseGuards(FakeDataGuard)
	public async generateInvitesConnectedToInviteRequests(
			_,
			{ qty, defaultLng, defaultLat }: { qty?: number, defaultLng: number; defaultLat: number }
	): Promise<void>
	{
		if(!qty)
			qty = 1000;
		
		const fakeInvitesService = new FakeInvitesService();
		const {
			      invitesRequestsToCreate,
			      invitesToCreate
		      } = await fakeInvitesService.generateInvitesConnectedToInviteRequests(
				qty,
				defaultLng,
				defaultLat
		)
		
		await this._invitesService
		          .Model
		          .insertMany(invitesToCreate);
		await this._inviteRequestsService
		          .Model
		          .insertMany(
				          invitesRequestsToCreate
		          );
	}
	
	@Query('invite')
	public async getInvite(_, { id }: IInviteIdInput): Promise<Invite>
	{
		return this._invitesService
		           .get(id)
		           .pipe(first())
		           .toPromise();
	}
	
	@Query('getInviteByCode')
	public async getInviteByCode(
			_,
			{ info }: { info: IEnterByCode }
	): Promise<Invite>
	{
		return this._invitesService
		           .getByCode(info)
		           .pipe(first())
		           .toPromise();
	}
	
	@Query('getInviteByLocation')
	public async getInviteByLocation(
			_,
			{ info }: { info: IEnterByLocation }
	): Promise<Invite>
	{
		return this._invitesService
		           .getByLocation(info)
		           .pipe(first())
		           .toPromise();
	}
	
	@Query('invites')
	public async getInvites(
			_,
			{ findInput, pagingOptions = {} }:
					{ findInput: IInvitesFindInput, pagingOptions: IPagingOptions }
	): Promise<Invite[]>
	{
		if(!pagingOptions || (pagingOptions && !pagingOptions['sort']))
		{
			pagingOptions['sort'] = { field: '_createdAt', sortBy: 'desc' };
		}
		
		const invites = await this._invitesService
		                          .getInvites(
				                          findInput,
				                          pagingOptions
		                          );
		
		return invites.map((i) => new Invite(i));
	}
	
	@Query()
	public async getCountOfInvites(): Promise<number>
	{
		return this._invitesService
		           .Model
		           .find({ isDeleted: { $eq: false } })
		           .countDocuments()
		           .exec();
	}
	
	@Mutation()
	public async createInvite(
			_,
			{ createInput }: IInviteCreateInput
	): Promise<Invite>
	{
		return this._invitesService.create(createInput);
	}
	
	@Mutation()
	public async updateInvite(
			_,
			{ id, updateInput }: IInviteUpdateInput
	): Promise<Invite>
	{
		await this._invitesService.throwIfNotExists(id);
		return this._invitesService.update(id, updateInput);
	}
	
	@Mutation()
	public async removeInvite(_, { id }: IInviteIdInput): Promise<void>
	{
		await this._invitesService.throwIfNotExists(id);
		return this._invitesService.remove(id);
	}
	
	@Mutation()
	public async removeInvitesByIds(_, { ids }: { ids: string[] }): Promise<void>
	{
		const invites = await this._invitesService.find({
			                                                _id:       { $in: ids },
			                                                isDeleted: { $eq: false }
		                                                });
		
		const invitesIds = invites.map((d) => d.id);
		
		return this._invitesService.removeMultipleByIds(invitesIds);
	}
}
