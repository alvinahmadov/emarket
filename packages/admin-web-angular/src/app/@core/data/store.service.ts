import Admin          from '@modules/server.common/entities/Admin';
import Customer       from '@modules/server.common/entities/Customer';
import { Injectable } from '@angular/core';

@Injectable()
export class StorageService
{
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
	
	public get adminId(): Admin['id'] | null
	{
		return localStorage.getItem('_adminId') || null;
	}
	
	public set adminId(id: Admin['id'] | null)
	{
		if(id == null)
		{
			localStorage.removeItem('_adminId');
		}
		else
		{
			localStorage.setItem('_adminId', id);
		}
	}
	
	public get userId(): Customer['id'] | null
	{
		return localStorage.getItem('_simUserId') || null;
	}
	
	public set userId(id: Customer['id'] | null)
	{
		if(id == null)
		{
			localStorage.removeItem('_simUserId');
		}
		else
		{
			localStorage.setItem('_simUserId', id);
		}
	}
	
	public get locale(): string | null
	{
		return localStorage.getItem('_locale');
	}
	
	public set locale(locale: string)
	{
		if(locale)
			localStorage.setItem('_locale', locale)
	}
	
	public get theme(): string | null
	{
		return localStorage.getItem('theme')
	}
	
	public set theme(theme)
	{
		if(!theme)
		{
			localStorage.removeItem('theme');
		}
		else
		{
			localStorage.setItem('theme', theme)
		}
	}
	
	public get currency(): string | null
	{
		return localStorage.getItem('_curreny');
	}
	
	public set currency(code: string)
	{
		localStorage.setItem('_curreny', code);
	}
	
	public get maintenanceMode(): string | null
	{
		return localStorage.getItem('maintenanceMode') || null;
	}
	
	public get serverConnection(): string | null
	{
		return localStorage.getItem('serverConnection');
	}
	
	public set serverConnection(val: string)
	{
		localStorage.setItem('serverConnection', val);
	}
	
	public get adminPasswordReset(): string | null
	{
		return localStorage.getItem('adminPasswordReset');
	}
	
	public set adminPasswordReset(val: string)
	{
		localStorage.setItem('adminPasswordReset', val);
	}
	
	public get fakeDataGenerator(): string | null
	{
		return localStorage.getItem('fakeDataGenerator');
	}
	
	public set fakeDataGenerator(val: string)
	{
		localStorage.setItem('fakeDataGenerator', val);
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
