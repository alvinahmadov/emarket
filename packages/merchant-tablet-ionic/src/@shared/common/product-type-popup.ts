import { ModalController } from "@ionic/angular";
import { IProductImage }   from "@modules/server.common/interfaces/IProduct";
import { ComponentRef }    from "@ionic/core";
import Warehouse           from "@modules/server.common/entities/Warehouse";
import { first }           from "rxjs/operators";
import { WarehouseRouter } from "@modules/client.common.angular2/routers/warehouse-router.service";

abstract class ProductTypePopup
{
	warehouseName: string;
	
	protected constructor(
			protected modalController: ModalController
	)
	{}
	
	get warehouseId()
	{
		return localStorage.getItem('_warehouseId');
	}
	
	protected async createModal<T extends ComponentRef>(
			images: IProductImage[],
			component: T,
			cssClass: string
	)
	{
		return await this.modalController.create({
			                                         component: component,
			                                         componentProps: {
				                                         images,
			                                         },
			                                         backdropDismiss: false,
			                                         cssClass: cssClass,
		                                         });
	}
	
	protected async getWarehouse(warehouseRouter: WarehouseRouter): Promise<Warehouse | null>
	{
		let warehouse: Promise<Warehouse>;
		
		if(this.warehouseId)
		{
			warehouse = warehouseRouter.get(this.warehouseId, false)
			                           .pipe(first())
			                           .toPromise();
			if(warehouse)
			{
				this.warehouseName = (await warehouse).name;
			}
		}
		
		return warehouse;
	}
}

export default ProductTypePopup
