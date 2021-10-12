import { UseGuards }                 from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { ExtractJwt }                from 'passport-jwt';
import { first }                     from 'rxjs/operators';
import { IAdminFindInput }           from '@modules/server.common/interfaces/IAdmin';
import {
	IAdminRegistrationInput,
	IAdminLoginResponse
}                                    from '@modules/server.common/routers/IAdminRouter';
import Admin                         from '@modules/server.common/entities/Admin';
import { env }                       from '../../env';
import { AdminsService }             from '../../services/admins';
import { GqlAdminGuard }             from '../../auth/guards/gql.guard';

@Resolver('Admin')
export class AdminResolver
{
	constructor(private readonly _adminsService: AdminsService) {}
	
	@Query('admin')
	@UseGuards(GqlAdminGuard)
	async getAdmin(_, { id }: { id: string }): Promise<Admin>
	{
		return this._adminsService
		           .get(id)
		           .pipe(first())
		           .toPromise();
	}
	
	@Query('adminByEmail')
	@UseGuards(GqlAdminGuard)
	async getByEmail(_, { email }: { email: string }): Promise<Admin>
	{
		return this._adminsService.getByEmail(email);
	}
	
	@Query('adminSearch')
	async findAdmin(_, { findInput }: { findInput: IAdminFindInput })
	{
		return this._adminsService.findAdmin(findInput)
	}
	
	@Mutation()
	async registerAdmin(
			_,
			{ registerInput }: { registerInput: IAdminRegistrationInput }
	): Promise<Admin>
	{
		return this._adminsService.register(registerInput);
	}
	
	@Mutation()
	async adminLogin(
			_,
			{ email, password }: { email: string; password: string }
	): Promise<IAdminLoginResponse>
	{
		return this._adminsService.login(email, password);
	}
	
	@Query()
	async adminAuthenticated(_, __, context: any): Promise<boolean>
	{
		return this._adminsService.isAuthenticated(
				ExtractJwt.fromAuthHeaderAsBearerToken()(context.req)
		);
	}
	
	@Mutation()
	@UseGuards(GqlAdminGuard)
	async updateAdmin(
			_,
			{ id, updateInput }: { id: string; updateInput }
	): Promise<Admin>
	{
		await this._adminsService.throwIfNotExists(id);
		return this._adminsService.update(id, updateInput);
	}
	
	@Mutation()
	@UseGuards(GqlAdminGuard)
	async updateAdminPassword(
			_,
			{
				id,
				password
			}: { id: Admin['id']; password: { current: string; new: string } }
	): Promise<void>
	{
		if(!env.ADMIN_PASSWORD_RESET)
		{
			throw new Error('Admin password cannot be changed');
		}
		
		return this._adminsService.updatePassword(id, password);
	}
}
