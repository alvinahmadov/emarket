import { Injectable }          from '@angular/core';
import { TranslateService }    from '@ngx-translate/core';
import Customer                from '@modules/server.common/entities/Customer';
import Device                  from '@modules/server.common/entities/Device';
import Warehouse               from '@modules/server.common/entities/Warehouse';
import { WarehouseRouter }     from '@modules/client.common.angular2/routers/warehouse-router.service';
import { WarehouseAuthRouter } from '@modules/client.common.angular2/routers/warehouse-auth-router.service';

@Injectable()
export class StorageService
{
	constructor(
			private readonly translate: TranslateService,
			private readonly warehouseRouter: WarehouseRouter,
			private readonly warehouseAuthRouter: WarehouseAuthRouter
	)
	{}
	
	public get token(): string | null
	{
		
		return localStorage.getItem('token') || null;
	}
	
	public set token(token: string)
	{
		if(token == null)
		{
			localStorage.removeItem('token');
		}
		else
		{
			localStorage.setItem('token', token);
		}
	}
	
	public get warehouseId(): string | null
	{
		return localStorage.getItem('_warehouseId') || null;
	}
	
	public set warehouseId(id: Warehouse['id'] | null)
	{
		if(id == null)
		{
			localStorage.removeItem('_warehouseId');
		}
		else
		{
			localStorage.setItem('_warehouseId', id);
		}
	}
	
	public get merchantId(): string | null
	{
		return localStorage.getItem('_merchantId') || null;
	}
	
	public set merchantId(id: Customer['id'] | null)
	{
		if(id == null)
		{
			localStorage.removeItem('_merchantId');
		}
		else
		{
			localStorage.setItem('_merchantId', id);
		}
	}
	
	public get deviceId(): string | null
	{
		return localStorage.getItem('_deviceId') || null;
	}
	
	public set deviceId(id: Device['id'] | null)
	{
		if(id == null)
		{
			localStorage.removeItem('_deviceId');
		}
		else
		{
			localStorage.setItem('_deviceId', id);
		}
	}
	
	public get platform(): string | null
	{
		return localStorage.getItem('_platform') || null;
	}
	
	public set platform(type: string | null)
	{
		if(type == null)
		{
			localStorage.removeItem('_platform');
		}
		else
		{
			localStorage.setItem('_platform', type);
		}
	}
	
	public get locale(): string
	{
		return localStorage.getItem('_locale') || null;
	}
	
	public set locale(language: string)
	{
		if(language == null)
		{
			localStorage.removeItem('_locale');
		}
		else
		{
			localStorage.setItem('_locale', language);
		}
		
		this.translate.use(language);
	}
	
	public get maintenanceMode(): string | null
	{
		return localStorage.getItem('maintenanceMode') || null;
	}
	
	public get serverConnection()
	{
		return localStorage.getItem('serverConnection');
	}
	
	public set serverConnection(val: string)
	{
		localStorage.setItem('serverConnection', val);
	}
	
	public async isLogged()
	{
		return this.warehouseAuthRouter.isAuthenticated(this.token);
	}
	
	public clearMaintenanceMode()
	{
		localStorage.removeItem('maintenanceMode');
	}
	
	public clear()
	{
		localStorage.clear();
	}
}
