import { Injectable }     from '@angular/core';
import { first }          from 'rxjs/operators';
import { CustomerRouter } from '@modules/client.common.angular2/routers/customer-router.service';

export interface Statistics
{
	__rtg: number;
	__hsn: boolean;
}

export const storageKeys = {
	customerId:           {
		name:  "_cstmrId",
		value: ""
	},
	stats:                {
		name:  "_stcs",
		value: { __hsn: 0, __rtg: 0 }
	},
	locale:               {
		name:  "_locale",
		value: "ru-RU"
	},
	currency:             {
		name:  "_currency",
		value: "RUB"
	},
	inviteSystem:         {
		name:  "_inviteSystem",
		value: ""
	},
	inviteRequestId:      {
		name:  "_inviteRequestId",
		value: ""
	},
	registrationSystem:   {
		name:  "_registrationSystem",
		value: ""
	},
	buyProductId:         {
		name:  "_buyProductId",
		value: ""
	},
	merchantId:           {
		name:  "_merchantId",
		value: ""
	},
	maintenanceMode:      {
		name:  "maintenanceMode",
		value: false
	},
	token:                {
		name:  "token",
		value: ""
	},
	deliveryType:         {
		name:  "deliveryType",
		value: ""
	},
	productListViewSpace: {
		name:  "productListViewSpace",
		value: ""
	},
	productListViewType:  {
		name:  "productListViewType",
		value: ""
	},
	productViewType:      {
		name:  "productViewType",
		value: ""
	},
	serverConnection:     {
		name:  "serverConnection",
		value: ""
	},
	locbar:               {
		name:  "locbar",
		value: ""
	}
	
}

@Injectable({
	            providedIn: 'root',
            })
export class StorageService
{
	constructor(private readonly customerRouter: CustomerRouter) {}
	
	public get customerId(): string | null
	{
		return localStorage.getItem(storageKeys.customerId.name) || null;
	}
	
	public set customerId(id: string | null)
	{
		if(id == null)
		{
			localStorage.removeItem(storageKeys.customerId.name);
		}
		else
		{
			localStorage.setItem(storageKeys.customerId.name, id);
		}
	}
	
	public get hasSeen(): boolean
	{
		if(this.stats)
		{
			return this.stats.__hsn;
		}
		return false;
	}
	
	public set hasSeen(value: boolean)
	{
		if(this.stats)
		{
			let stats = this.stats;
			stats.__hsn = value;
			this.stats = stats;
		}
		else
		{
			this.stats = { __hsn: false, __rtg: 0 };
		}
	}
	
	public get languageCode(): string
	{
		return localStorage.getItem(storageKeys.locale.name) || null;
	}
	
	public set languageCode(code: string)
	{
		if(code == null)
		{
			localStorage.removeItem(storageKeys.locale.name);
		}
		else
		{
			localStorage.setItem(storageKeys.locale.name, code);
		}
	}
	
	public get defaultCurrency(): string
	{
		return localStorage.getItem(storageKeys.currency.name)
		       ?? storageKeys.currency.value;
	}
	
	public set defaultCurrency(currency: string)
	{
		if(!currency)
		{
			localStorage.removeItem(storageKeys.currency.name);
		}
		else
		{
			localStorage.setItem(storageKeys.currency.name, currency);
		}
	}
	
	public get inviteSystem(): boolean
	{
		return localStorage.getItem(storageKeys.inviteSystem.name) === 'enabled';
	}
	
	public set inviteSystem(isEndabled: boolean)
	{
		localStorage.setItem(storageKeys.inviteSystem.name, isEndabled ? 'enabled' : 'disabled');
	}
	
	public get inviteRequestId(): string | null
	{
		return localStorage.getItem(storageKeys.inviteRequestId.name) || null;
	}
	
	public set inviteRequestId(id: string | null)
	{
		if(id == null)
		{
			localStorage.removeItem(storageKeys.inviteRequestId.name);
		}
		else
		{
			localStorage.setItem(storageKeys.inviteRequestId.name, id);
		}
	}
	
	public get registrationSystem(): string
	{
		return localStorage.getItem(storageKeys.registrationSystem.name);
	}
	
	public set registrationSystem(registrationRequiredOnStart: string)
	{
		localStorage.setItem(
				storageKeys.registrationSystem.name,
				registrationRequiredOnStart
		);
	}
	
	public get buyProductId(): string
	{
		return localStorage.getItem(storageKeys.buyProductId.name);
	}
	
	public set buyProductId(warehouseProductId: string)
	{
		localStorage.setItem(storageKeys.buyProductId.name, warehouseProductId);
	}
	
	public get merchantId(): string
	{
		return localStorage.getItem(storageKeys.merchantId.name);
	}
	
	public set merchantId(merchantId: string)
	{
		localStorage.setItem(storageKeys.merchantId.name, merchantId);
	}
	
	public get maintenanceMode(): string | null
	{
		return localStorage.getItem(storageKeys.maintenanceMode.name) || null;
	}
	
	public get token(): string | null
	{
		return localStorage.getItem(storageKeys.token.name) || null;
	}
	
	public set token(token: string)
	{
		if(token == null)
		{
			localStorage.removeItem(storageKeys.token.name);
		}
		else
		{
			localStorage.setItem(storageKeys.token.name, token);
		}
	}
	
	public get deliveryType(): number
	{
		return Number(localStorage.getItem(storageKeys.deliveryType.name));
	}
	
	public set deliveryType(deliveryType: number)
	{
		localStorage.setItem(storageKeys.deliveryType.name, deliveryType.toString());
	}
	
	public get productListViewSpace(): string
	{
		return localStorage.getItem(storageKeys.productListViewSpace.name);
	}
	
	public set productListViewSpace(productListViewSpace: string)
	{
		localStorage.setItem(storageKeys.productListViewSpace.name, productListViewSpace);
	}
	
	public get productListViewType(): string
	{
		return localStorage.getItem(storageKeys.productListViewType.name);
	}
	
	public set productListViewType(productListViewType: string)
	{
		localStorage.setItem(storageKeys.productListViewType.name, productListViewType);
	}
	
	public get productViewType(): string
	{
		return localStorage.getItem(storageKeys.productViewType.name);
	}
	
	public set productViewType(productViewType: string)
	{
		localStorage.setItem(storageKeys.productViewType.name, productViewType);
	}
	
	public get serverConnection()
	{
		return localStorage.getItem(storageKeys.serverConnection.name);
	}
	
	public set serverConnection(val: string)
	{
		localStorage.setItem(storageKeys.serverConnection.name, val);
	}
	
	public set isLocationSearchBarVisible(value: boolean | null)
	{
		if(value === null || value == false)
		{
			localStorage.setItem(storageKeys.locbar.name, '0');
		}
		else
		{
			localStorage.setItem(storageKeys.locbar.name, '1');
		}
	}
	
	public get isLocationSearchBarVisible(): boolean
	{
		return localStorage.getItem(storageKeys.locbar.name) === '1';
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
		localStorage.removeItem(storageKeys.maintenanceMode.name);
	}
	
	public clear()
	{
		localStorage.clear();
	}
	
	protected get stats(): Statistics
	{
		const stats = localStorage.getItem(storageKeys.stats.name);
		
		if(stats)
			return <Statistics>JSON.parse(stats);
		
		return null;
	}
	
	protected set stats(value: Statistics)
	{
		if(value)
		{
			localStorage.setItem(storageKeys.stats.name, JSON.stringify(value));
		}
		else
		{
			localStorage.setItem(storageKeys.stats.name, JSON.stringify({ __hsn: 0, __rtg: 0 }));
		}
	}
}
