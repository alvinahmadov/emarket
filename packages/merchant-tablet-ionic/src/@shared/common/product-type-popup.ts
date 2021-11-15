import { ComponentRef }                      from '@ionic/core';
import { ModalController }                   from '@ionic/angular';
import { first }                             from 'rxjs/operators';
import { IProductImage }                     from '@modules/server.common/interfaces/IProduct';
import Warehouse                             from '@modules/server.common/entities/Warehouse';
import { WarehouseRouter }                   from '@modules/client.common.angular2/routers/warehouse-router.service';
import { StorageService }                    from 'services/storage.service';
import { environment }                       from 'environments/environment';

class ProductTypePopup
{
	public readonly OK: string = 'OK';
	public readonly CANCEL: string = 'CANCEL';
	public readonly SELECT_CATEGORIES: string = 'SELECT_CATEGORIES';
	public readonly PREFIX: string = 'WAREHOUSE_VIEW.SELECT_POP_UP.';
	
	protected locale: string;
	public selectedProductCategories: string[] = [];
	public hasImage: boolean;
	protected imagesData: IProductImage[];
	
	public productDelivery: boolean;
	public productTakeaway: boolean;
	
	public readonly descriptionMaxLength = 255;
	public readonly locales: string[] = environment.AVAILABLE_LOCALES.split('|');
	protected static cssClass = "mutation-product-images-modal";
	
	public isAvailable: boolean;
	
	protected constructor(
			protected modalController: ModalController,
			protected storageService: StorageService
	)
	{}
	
	public get warehouseId()
	{
		return this.storageService.warehouseId;
	}
	
	public get isBrowser()
	{
		return this.storageService.platform === 'browser';
	}
	
	protected async createModal<T extends ComponentRef>(
			images: IProductImage[],
			component: T,
			cssClass: string
	)
	{
		return await this.modalController.create({
			                                         component:       component,
			                                         componentProps:  {
				                                         images,
			                                         },
			                                         backdropDismiss: false,
			                                         cssClass:        cssClass,
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
		}
		
		return warehouse;
	}
}

export default ProductTypePopup
