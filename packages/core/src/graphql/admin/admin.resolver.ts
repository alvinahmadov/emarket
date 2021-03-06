import { UseGuards }                 from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { ExtractJwt }                from 'passport-jwt';
import { first }                     from 'rxjs/operators';
import { IAdminFindInput }           from '@modules/server.common/interfaces/IAdmin';
import {
	IAdminLoginResponse,
	IAdminRegistrationInput,
	IAdminIdInput,
	IAdminEmailInput,
	IAdminLoginInput,
	IAdminUpdateInput,
	IAdminPasswordUpdateInput
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
	public async getAdmin(_, { id }: IAdminIdInput): Promise<Admin>
	{
		return this._adminsService
		           .get(id)
		           .pipe(first())
		           .toPromise();
	}
	
	@Query('adminByEmail')
	@UseGuards(GqlAdminGuard)
	public async getByEmail(_, { email }: IAdminEmailInput): Promise<Admin>
	{
		return this._adminsService.getByEmail(email);
	}
	
	@Query('adminSearch')
	public async findAdmin(_, { findInput }: { findInput?: IAdminFindInput }): Promise<Admin | null>
	{
		return this._adminsService.findAdmin(findInput);
	}
	
	@Mutation()
	public async registerAdmin(
			_,
			{ registerInput }: { registerInput: IAdminRegistrationInput }
	): Promise<Admin>
	{
		return this._adminsService.register(registerInput);
	}
	
	@Mutation()
	public async adminLogin(
			_,
			{ authInfo, password, expiresIn }: IAdminLoginInput
	): Promise<IAdminLoginResponse>
	{
		return this._adminsService.login(authInfo, password, expiresIn);
	}
	
	@Query()
	public async adminAuthenticated(_, __, context: any): Promise<boolean>
	{
		return this._adminsService.isAuthenticated(
				ExtractJwt.fromAuthHeaderAsBearerToken()(context.req)
		);
	}
	
	@Mutation()
	@UseGuards(GqlAdminGuard)
	public async updateAdmin(
			_,
			{ id, updateInput }: IAdminUpdateInput
	): Promise<Admin>
	{
		await this._adminsService.throwIfNotExists(id);
		return this._adminsService.update(id, updateInput);
	}
	
	@Mutation()
	@UseGuards(GqlAdminGuard)
	public async updateAdminPassword(
			_,
			{ id, password }: IAdminPasswordUpdateInput
	): Promise<void>
	{
		if(!env.ADMIN_PASSWORD_RESET)
		{
			throw new Error('Admin password cannot be changed');
		}
		
		return this._adminsService.updatePassword(id, password);
	}
}
