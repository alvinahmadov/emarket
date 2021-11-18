import { Observable }                            from 'rxjs';
import { map }                                   from 'rxjs/operators';
import { Injectable }                            from '@angular/core';
import IAdmin                                    from '@modules/server.common/interfaces/IAdmin';
import Admin                                     from '@modules/server.common/entities/Admin';
import IAdminRouter,
{ IAdminLoginResponse, IAdminRegistrationInput } from '@modules/server.common/routers/IAdminRouter';
import { Router, RouterFactory }                 from '../lib/router';

@Injectable()
export class AdminRouter implements IAdminRouter
{
	private readonly router: Router;
	
	constructor(routerFactory: RouterFactory)
	{
		this.router = routerFactory.create('admin');
	}
	
	public get(id: Admin['id']): Observable<Admin | null>
	{
		return this.router
		           .runAndObserve<IAdmin>('get', id)
		           .pipe(map((admin) => this._adminFactory(admin)));
	}
	
	public login(authInfo: string, password: string, expiresIn?: string | number): Promise<IAdminLoginResponse | null>
	{
		return this.router.run<IAdminLoginResponse>('register', authInfo, password, expiresIn);
	}
	
	public register(input: IAdminRegistrationInput): Promise<Admin>
	{
		return Promise.reject("Method not allowed");
	}
	
	public updateById(id: Admin['id'], updateObject: Partial<IAdmin>): Promise<Admin>
	{
		return Promise.reject("Method not allowed");
	}
	
	protected _adminFactory(admin: IAdmin)
	{
		return admin == null ? null : new Admin(admin);
	}
}
