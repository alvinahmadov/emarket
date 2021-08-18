import { Injectable }            from '@angular/core';
import IWarehouse                from '@modules/server.common/interfaces/IWarehouse';
import Warehouse                 from '@modules/server.common/entities/Warehouse';
import IWarehouseAuthRouter,
{
	IWarehouseLoginResponse,
	IWarehouseRegistrationInput,
}                                from '@modules/server.common/routers/IWarehouseAuthRouter';
import { Router, RouterFactory } from '../lib/router';

@Injectable()
export class WarehouseAuthRouter implements IWarehouseAuthRouter
{
	private readonly router: Router;
	
	constructor(routerFactory: RouterFactory)
	{
		this.router = routerFactory.create('warehouse-auth');
	}
	
	async login(
			username: string,
			password: string
	): Promise<IWarehouseLoginResponse | null>
	{
		const res = await this.router.run<IWarehouseLoginResponse | null>(
				'login',
				username,
				password
		);
		
		if(res == null)
		{
			return null;
		}
		else
		{
			return {
				token: res.token,
				warehouse: this._warehouseFactory(res.warehouse),
			};
		}
	}
	
	async register(input: IWarehouseRegistrationInput): Promise<Warehouse>
	{
		const warehouse = await this.router.run<IWarehouse>('register', input);
		return this._warehouseFactory(warehouse);
	}
	
	async updatePassword(
			id: string,
			password: { current?: string; new: string }
	): Promise<void>
	{
		await this.router.run('updatePassword', id, password);
	}
	
	protected _warehouseFactory(warehouse: IWarehouse)
	{
		return warehouse == null ? null : new Warehouse(warehouse);
	}
}
