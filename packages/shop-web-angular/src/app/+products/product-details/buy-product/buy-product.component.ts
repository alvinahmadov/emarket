import { Component, Input }      from '@angular/core';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import IWarehouse                from '@modules/server.common/interfaces/IWarehouse';
import IWarehouseProduct         from '@modules/server.common/interfaces/IWarehouseProduct';
import ICustomer                 from '@modules/server.common/interfaces/ICustomer';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { ILocaleMember }         from '@modules/server.common/interfaces/ILocale';
import { StorageService }        from 'app/services/storage';

@Component({
	           selector: 'taggroup-remove-modal',
	           templateUrl: './buy-product.component.html',
           })
export class BuyProductComponent
{
	@Input()
	public warehouse: IWarehouse;
	@Input()
	public warehouseProduct: IWarehouseProduct;
	@Input()
	public user: ICustomer;
	
	constructor(
			// private readonly activeModal: NgbActiveModal,
			private readonly warehouseOrdersRouter: WarehouseOrdersRouter,
			private readonly _productLocalesService: ProductLocalesService,
			private readonly storage: StorageService
	)
	{}
	
	async createOrder()
	{
		await this.warehouseOrdersRouter.createByProductType(
				this.user._id.toString(),
				this.warehouse._id.toString(),
				this.warehouseProduct._id.toString(),
				this.storage.deliveryType
		);
	}
	
	public localeTranslate(member: ILocaleMember[])
	{
		return this._productLocalesService.getTranslate(member);
	}
}
