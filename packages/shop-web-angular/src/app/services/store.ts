import { Injectable }     from '@angular/core';
import { first }          from 'rxjs/operators';
import { CustomerRouter } from '@modules/client.common.angular2/routers/customer-router.service';

@Injectable({
	            providedIn: 'root',
            })
export class Store
{
	constructor(private readonly userRouter: CustomerRouter) {}
	
	get userId(): string | null
	{
		return localStorage.getItem('_userId') || null;
	}
	
	set userId(id: string | null)
	{
		if(id == null)
		{
			localStorage.removeItem('_userId');
		}
		else
		{
			localStorage.setItem('_userId', id);
		}
	}
	
	get languageCode(): string
	{
		return localStorage.getItem('_languageCode') || null;
	}
	
	set languageCode(code: string)
	{
		if(code == null)
		{
			localStorage.removeItem('_languageCode');
		}
		else
		{
			localStorage.setItem('_languageCode', code);
		}
	}
	
	get inviteSystem(): boolean
	{
		return localStorage.getItem('_inviteSystem') === 'enabled';
	}
	
	set inviteSystem(isEndabled: boolean)
	{
		const inviteSystem = isEndabled ? 'enabled' : 'disabled';
		localStorage.setItem('_inviteSystem', inviteSystem);
	}
	
	get registrationSystem(): string
	{
		return localStorage.getItem('_registrationSystem');
	}
	
	set registrationSystem(registrationRequiredOnStart: string)
	{
		localStorage.setItem(
				'_registrationSystem',
				registrationRequiredOnStart
		);
	}
	
	get buyProductId(): string
	{
		return localStorage.getItem('_buyProductId');
	}
	
	set buyProductId(warehouseProductId: string)
	{
		localStorage.setItem('_buyProductId', warehouseProductId);
	}
	
	get merchantId(): string
	{
		return localStorage.getItem('_merchantId');
	}
	
	set merchantId(merchantId: string)
	{
		localStorage.setItem('_merchantId', merchantId);
	}
	
	get maintenanceMode(): string | null
	{
		return localStorage.getItem('maintenanceMode') || null;
	}
	
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
	
	get deliveryType(): number
	{
		return Number(localStorage.getItem('deliveryType'));
	}
	
	set deliveryType(deliveryType: number)
	{
		localStorage.setItem('deliveryType', deliveryType.toString());
	}
	
	get productListViewSpace(): string
	{
		return localStorage.getItem('productListViewSpace');
	}
	
	set productListViewSpace(productListViewSpace: string)
	{
		localStorage.setItem('productListViewSpace', productListViewSpace);
	}
	
	get productListViewType(): string
	{
		return localStorage.getItem('productListViewType');
	}
	
	set productListViewType(productListViewType: string)
	{
		localStorage.setItem('productListViewType', productListViewType);
	}
	
	get productViewType(): string
	{
		return localStorage.getItem('productViewType');
	}
	
	set productViewType(productViewType: string)
	{
		localStorage.setItem('productViewType', productViewType);
	}
	
	get serverConnection()
	{
		return localStorage.getItem('serverConnection');
	}
	
	set serverConnection(val: string)
	{
		localStorage.setItem('serverConnection', val);
	}
	
	isLogged()
	{
		const userId = this.userId;
		
		if(userId)
		{
			try
			{
				this.userRouter
				    .get(userId)
				    .pipe(first());
				return true;
			} catch(error)
			{
				this.userId = null;
				console.error(error.message);
			}
		}
		
		console.warn(`User with id '${userId}' does not exists!"`);
		return false;
	}
	
	clearMaintenanceMode()
	{
		localStorage.removeItem('maintenanceMode');
	}
	
	clear()
	{
		localStorage.clear();
	}
}
