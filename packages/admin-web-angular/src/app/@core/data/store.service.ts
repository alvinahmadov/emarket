import Admin          from '@modules/server.common/entities/Admin';
import Customer       from '@modules/server.common/entities/Customer';
import { Injectable } from '@angular/core';

@Injectable()
export class Store
{
	get token(): string | null
	{
		return localStorage.getItem('token') || null;
	}
	
	set token(token: string)
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
	
	get adminId(): Admin['id'] | null
	{
		return localStorage.getItem('_adminId') || null;
	}
	
	set adminId(id: Admin['id'] | null)
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
	
	get userId(): Customer['id'] | null
	{
		return localStorage.getItem('_simUserId') || null;
	}
	
	set userId(id: Customer['id'] | null)
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
	
	get locale(): string
	{
		return localStorage.getItem('_locale');
	}
	
	set locale(locale: string)
	{
		if(locale)
			localStorage.setItem('_locale', locale)
	}
	
	get theme()
	{
		return localStorage.getItem('theme')
	}
	
	set theme(theme)
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
	
	get currency(): string
	{
		return localStorage.getItem('_curreny');
	}
	
	set currency(code: string)
	{
		localStorage.setItem('_curreny', code);
	}
	
	get maintenanceMode(): string | null
	{
		return localStorage.getItem('maintenanceMode') || null;
	}
	
	get serverConnection()
	{
		return localStorage.getItem('serverConnection');
	}
	
	set serverConnection(val: string)
	{
		localStorage.setItem('serverConnection', val);
	}
	
	get adminPasswordReset()
	{
		return localStorage.getItem('adminPasswordReset');
	}
	
	set adminPasswordReset(val: string)
	{
		localStorage.setItem('adminPasswordReset', val);
	}
	
	get fakeDataGenerator()
	{
		return localStorage.getItem('fakeDataGenerator');
	}
	
	set fakeDataGenerator(val: string)
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
