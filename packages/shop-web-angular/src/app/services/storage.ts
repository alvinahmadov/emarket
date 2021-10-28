import { Injectable }     from '@angular/core';
import { first }          from 'rxjs/operators';
import { CustomerRouter } from '@modules/client.common.angular2/routers/customer-router.service';

@Injectable({
	            providedIn: 'root',
            })
export class StorageService
{
	constructor(private readonly customerRouter: CustomerRouter) {}
	
	public get customerId(): string | null
	{
		return localStorage.getItem('_cstmrId') || null;
	}
	
	public set customerId(id: string | null)
	{
		if(id == null)
		{
			localStorage.removeItem('_cstmrId');
		}
		else
		{
			localStorage.setItem('_cstmrId', id);
		}
	}
	
	public get languageCode(): string
	{
		return localStorage.getItem('_languageCode') || null;
	}
	
	public set languageCode(code: string)
	{
		if(code == null)
		{
			localStorage.removeItem('_locale');
		}
		else
		{
			localStorage.setItem('_locale', code);
		}
	}
	
	public get defaultCurrency(): string
	{
		return localStorage.getItem('_currency') ?? 'RUB';
	}
	
	public set defaultCurrency(currency: string)
	{
		if(!currency)
		{
			localStorage.removeItem('_currency');
		} else
		{
			localStorage.setItem('_currency', currency);
		}
	}
	
	public get inviteSystem(): boolean
	{
		return localStorage.getItem('_inviteSystem') === 'enabled';
	}
	
	public set inviteSystem(isEndabled: boolean)
	{
		localStorage.setItem('_inviteSystem', isEndabled ? 'enabled' : 'disabled');
	}
	
	public get inviteRequestId(): string | null
	{
		return localStorage.getItem('_inviteRequestId') || null;
	}
	
	public set inviteRequestId(id: string | null)
	{
		if(id == null)
		{
			localStorage.removeItem('_inviteRequestId');
		}
		else
		{
			localStorage.setItem('_inviteRequestId', id);
		}
	}
	
	public get registrationSystem(): string
	{
		return localStorage.getItem('_registrationSystem');
	}
	
	public set registrationSystem(registrationRequiredOnStart: string)
	{
		localStorage.setItem(
				'_registrationSystem',
				registrationRequiredOnStart
		);
	}
	
	public get buyProductId(): string
	{
		return localStorage.getItem('_buyProductId');
	}
	
	public set buyProductId(warehouseProductId: string)
	{
		localStorage.setItem('_buyProductId', warehouseProductId);
	}
	
	public get merchantId(): string
	{
		return localStorage.getItem('_merchantId');
	}
	
	public set merchantId(merchantId: string)
	{
		localStorage.setItem('_merchantId', merchantId);
	}
	
	public get maintenanceMode(): string | null
	{
		return localStorage.getItem('maintenanceMode') || null;
	}
	
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
	
	public get deliveryType(): number
	{
		return Number(localStorage.getItem('deliveryType'));
	}
	
	public set deliveryType(deliveryType: number)
	{
		localStorage.setItem('deliveryType', deliveryType.toString());
	}
	
	public get productListViewSpace(): string
	{
		return localStorage.getItem('productListViewSpace');
	}
	
	public set productListViewSpace(productListViewSpace: string)
	{
		localStorage.setItem('productListViewSpace', productListViewSpace);
	}
	
	public get productListViewType(): string
	{
		return localStorage.getItem('productListViewType');
	}
	
	public set productListViewType(productListViewType: string)
	{
		localStorage.setItem('productListViewType', productListViewType);
	}
	
	public get productViewType(): string
	{
		return localStorage.getItem('productViewType');
	}
	
	public set productViewType(productViewType: string)
	{
		localStorage.setItem('productViewType', productViewType);
	}
	
	public get serverConnection()
	{
		return localStorage.getItem('serverConnection');
	}
	
	public set serverConnection(val: string)
	{
		localStorage.setItem('serverConnection', val);
	}
	
	public isLogged()
	{
		const customerId = this.customerId;
		
		if(customerId)
		{
			try
			{
				this.customerRouter
				    .get(customerId)
				    .pipe(first());
				return true;
			} catch(error)
			{
				this.customerId = null;
				console.error(error.message);
			}
		}
		
		console.warn(`Customer with id '${customerId}' does not exists!"`);
		return false;
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
