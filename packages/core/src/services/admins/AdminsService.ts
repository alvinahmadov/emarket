import Logger                              from 'bunyan';
import { inject, injectable }              from 'inversify';
import { Observable }                      from 'rxjs';
import { first, map, switchMap }           from 'rxjs/operators';
import { Repository }                      from 'typeorm';
import {
	asyncListener,
	observableListener,
	routerName
}                                          from '@pyro/io';
import { DBService }                       from '@pyro/db-server';
import { IAdminFindInput }                 from '@modules/server.common/interfaces/IAdmin';
import IAdminRouter,
{
	IAdminLoginResponse,
	IAdminRegistrationInput
}                                          from '@modules/server.common/routers/IAdminRouter';
import Admin                               from '@modules/server.common/entities/Admin';
import IService                            from '../IService';
import { AuthService, AuthServiceFactory } from '../auth';
import { createLogger }                    from '../../helpers/Log';
import { env }                             from '../../env';

/**
 * Users (not customers!) management service
 * In most cases such users are Administrators, which need to get access into Admin or Mechant app
 */
@injectable()
@routerName('admin')
export class AdminsService extends DBService<Admin> implements IAdminRouter, IService
{
	readonly DBObject: any = Admin;
	
	protected readonly log: Logger = createLogger({ name: 'adminService' });
	
	private readonly authService: AuthService<Admin>;
	
	constructor(
			@inject('Factory<AuthService>')
					authServiceFactory: AuthServiceFactory,
			// TypeORM Repository - temporary here, will be moved into DBService later
			@inject('AdminRepository')
			private readonly _adminRepository: Repository<Admin>
	)
	{
		super();
		
		_adminRepository
				.count()
				.then((c) =>
				      {
					      console.log('Admins count: ' + c);
				      })
				.catch((e) =>
				       {
					       console.log(e);
				       });
		
		this.authService = authServiceFactory({
			                                      role:       'admin',
			                                      Entity:     Admin,
			                                      saltRounds: env.ADMIN_PASSWORD_BCRYPT_SALT_ROUNDS
		                                      });
	}
	
	@observableListener()
	get(id: Admin['id']): Observable<Admin>
	{
		return super.get(id)
		            .pipe(
				            map(async(admin: Admin) =>
				                {
					                await this.throwIfNotExists(id);
					                return admin;
				                }),
				            switchMap((admin: Promise<Admin>) => admin)
		            );
	}
	
	@asyncListener()
	async getByEmail(email: Admin['email']): Promise<Admin | null>
	{
		return super.findOne({ email, isDeleted: { $eq: false } });
	}
	
	@asyncListener()
	async register(input: IAdminRegistrationInput): Promise<Admin>
	{
		return await this.create({
			                         ...input.admin,
			                         ...(input.password
			                             ? { hash: await this.authService.getPasswordHash(input.password) }
			                             : {}
			                         )
		                         });
	}
	
	@asyncListener()
	async updatePassword(
			id: Admin['id'],
			password: { current: string; new: string }
	): Promise<void>
	{
		await this.throwIfNotExists(id);
		await this.authService.updatePassword(id, password);
	}
	
	@asyncListener()
	async login(
			email: string,
			password: string
	): Promise<IAdminLoginResponse | null>
	{
		let res = null;
		const admin = await this.getByEmail(email);
		
		if(admin)
		{
			res = await this.authService.login({ email }, password);
		}
		
		if(!res)
		{
			return null;
		}
		
		return {
			admin: res.entity,
			token: res.token
		};
	}
	
	@asyncListener()
	async isAuthenticated(token: string): Promise<boolean>
	{
		return this.authService.isAuthenticated(token);
	}
	
	@asyncListener()
	async updateById(
			id: Admin['id'],
			updateObject: Partial<Admin>
	): Promise<Admin>
	{
		await this.throwIfNotExists(id);
		return super.update(id, updateObject);
	}
	
	@asyncListener()
	async findAdmin(adminFindInput: IAdminFindInput): Promise<Admin | null>
	{
		return this.findOne(adminFindInput);
	}
	
	@asyncListener()
	async getAdmins(): Promise<Admin[]>
	{
		return this.find({ role: "admin" });
	}
	
	async throwIfNotExists(adminId: string): Promise<void>
	{
		const admin: Admin = await super.get(adminId)
		                                .pipe(first())
		                                .toPromise();
		
		if(!admin || admin.isDeleted)
		{
			throw Error(`Admin with id '${adminId}' does not exists!`);
		}
	}
}
