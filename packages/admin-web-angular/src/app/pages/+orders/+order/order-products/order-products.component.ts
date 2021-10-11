import { Component, Input, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { Router }                                         from '@angular/router';
import { NgbModal }                                       from '@ng-bootstrap/ng-bootstrap';
import { TranslateService }                               from '@ngx-translate/core';
import { ToasterService }                                 from 'angular2-toaster';
import { LocalDataSource }                                from 'ng2-smart-table';
import { Subject, forkJoin, Observable }                  from 'rxjs';
import { first, takeUntil }                               from 'rxjs/operators';
import Order                                              from '@modules/server.common/entities/Order';
import OrderProduct                                       from '@modules/server.common/entities/OrderProduct';
import Product                                            from '@modules/server.common/entities/Product';
import OrderCarrierStatus                                 from '@modules/server.common/enums/OrderCarrierStatus';
import OrderWarehouseStatus                               from '@modules/server.common/enums/OrderWarehouseStatus';
import { ProductLocalesService }                          from '@modules/client.common.angular2/locale/product-locales.service';
import { OrderRouter }                                    from '@modules/client.common.angular2/routers/order-router.service';
import { WarehouseOrdersRouter }                          from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { ConfimationModalComponent }                      from '@app/@shared/confirmation-modal/confirmation-modal.component';
import { StoreOrderProductAmountComponent }               from '@app/@shared/render-component/store-products-table/store-order-product-amount/store-order-product-amount.component';
import { ProductTitleRedirectComponent }                  from '@app/@shared/render-component/product-title-redirect/product-title-redirect.component';
import { StoreProductPriceComponent }                     from '@app/@shared/render-component/store-products-table/store-product-price.component';
import { StoreProductImageComponent }                     from '@app/@shared/render-component/store-products-table/store-product-image/store-product-image.component';
import { WarehouseOrderModalComponent }                   from '@app/@shared/warehouse/+warehouse-order-modal/warehouse-order-modal.component';

interface OrderProductsViewModel
{
	price: string;
	qty: string;
	product: Product;
	image: string;
}

@Component({
	           selector:    'ea-order-products',
	           styleUrls:   ['/order-products.component.scss'],
	           templateUrl: './order-products.component.html',
           })
export class OrderProductsComponent implements OnInit, OnChanges, OnDestroy
{
	public selectedProducts: OrderProductsViewModel[] = [];
	
	public sourceSmartTable: LocalDataSource = new LocalDataSource();
	public settingsSmartTable: object;
	public modalTitle: string;
	public actionBtnText: string;
	public toastSuccMsg: string;
	public toastErrMsg: string;
	public loading: boolean;
	@Input()
	public order: Order;
	private _ngDestroy$ = new Subject<void>();
	
	constructor(
			private readonly _productLocalesService: ProductLocalesService,
			private readonly warehouseOrdersRouter: WarehouseOrdersRouter,
			private readonly modalService: NgbModal,
			private readonly orderRouter: OrderRouter,
			private readonly _translateService: TranslateService,
			private readonly router: Router,
			private readonly _toasterService: ToasterService
	)
	{
		this._loadSmartTableSettings();
	}
	
	public get givenToCarrier()
	{
		return OrderWarehouseStatus.GivenToCarrier;
	}
	
	public get deliveryCompleted()
	{
		return OrderCarrierStatus.DeliveryCompleted;
	}
	
	public ngOnInit(): void
	{
		this.loadDataSmartTable();
		this._applyTranslationOnSmartTable();
	}
	
	public ngOnChanges(): void
	{
		this.loadDataSmartTable();
	}
	
	public ngOnDestroy()
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	public async loadDataSmartTable()
	{
		const loadData = () =>
		{
			if(this.order)
			{
				const productsVM = this.order.products.map(
						(product: OrderProduct) =>
						{
							return {
								id:                product.product.id,
								price:             product.price,
								qty:               product.count,
								product:           product.product,
								image:             this._productLocalesService.getTranslate(
										product.product['images']
								),
								disableImg:        true,
								orderId:           this.order.id,
								orderWarehouseId:  this.order.warehouseId,
								warehouseProducts: this.order.warehouse['products'],
							};
						}
				);
				
				this.sourceSmartTable.load(productsVM);
			}
		};
		
		loadData();
	}
	
	public selectProductTmp(ev)
	{
		this.selectedProducts = ev.selected;
	}
	
	public addProductsModalTranslates()
	{
		const columnTitlePrefix = 'ORDER_VIEW.ORDER_PRODUCT_INFO.';
		const getTranslatedWords = (name: string): Observable<string | any> =>
				this._translateService.get(columnTitlePrefix + name);
		
		forkJoin(
				getTranslatedWords('ADD_PRODUCTS_MODAL'),
				getTranslatedWords('ADD'),
				getTranslatedWords('SUCCESS_TOAST'),
				getTranslatedWords('ERROR_TOAST')
		)
				.pipe(takeUntil(this._ngDestroy$))
				.subscribe(([addProduct, add, successToast, errorToast]) =>
				           {
					           this.actionBtnText = add;
					           this.modalTitle = addProduct;
					           this.toastSuccMsg = successToast;
					           this.toastErrMsg = errorToast;
				           });
	}
	
	public async addProducts()
	{
		if(this.order)
		{
			const componentRef = this.modalService.open(
					WarehouseOrderModalComponent,
					{
						size:        'lg',
						container:   'nb-layout',
						windowClass: 'ng-custom',
						backdrop:    'static',
					}
			);
			const instance: WarehouseOrderModalComponent =
					      componentRef.componentInstance;
			
			instance.warehouseId = this.order.warehouseId;
			instance.modalTitle = this.modalTitle;
			instance.actionBtnText = this.actionBtnText;
			
			const products = await instance.makeOrderEmitter
			                               .pipe(first())
			                               .toPromise();
			
			this.orderRouter
			    .addProducts(this.order.id, products, this.order.warehouseId)
			    .then(() =>
			          {
				          this._toasterService.pop(
						          `success`,
						          `${this.toastSuccMsg}!`
				          );
			          })
			    .catch(() =>
			           {
				           this._toasterService.pop(`error`, `${this.toastErrMsg}!`);
			           });
			
			componentRef.close();
		}
	}
	
	public async removeSelectedProducts()
	{
		const productsIds = this.selectedProducts.map((res) => res['id']);
		if(this.order && productsIds.length > 0)
		{
			try
			{
				this.loading = true;
				const order = await this.orderRouter.removeProducts(
						this.order.id,
						productsIds
				);
				
				this.selectedProducts = [];
				this.loading = false;
				this._toasterService.pop(
						`success`,
						`Selected products are deleted!`
				);
			} catch(error)
			{
				this.loading = false;
				this._toasterService.pop('error', `Error: "${error.message}"`);
			}
		}
	}
	
	public async cancelOrder()
	{
		const activeModal = this.modalService.open(ConfimationModalComponent, {
			size:      'sm',
			container: 'nb-layout',
			backdrop:  'static',
		});
		const modalComponent: ConfimationModalComponent =
				      activeModal.componentInstance;
		
		await modalComponent.confirmEvent
		                    .pipe(takeUntil(modalComponent.ngDestroy$))
		                    .subscribe(() =>
		                               {
			                               if(this.order)
			                               {
				                               try
				                               {
					                               this.loading = true;
					                               this.warehouseOrdersRouter.cancel(
							                               this.order.id
					                               );
					                               this.loading = false;
					                               this._toasterService.pop(
							                               `success`,
							                               `Order is canceled!`
					                               );
				                               } catch(error)
				                               {
					                               this.loading = false;
					                               this._toasterService.pop(
							                               'error',
							                               `Error: "${error.message}"`
					                               );
				                               }
				                               // const res = await this.warehouseOrdersRouter.cancel(this.order.id);
			                               }
			                               modalComponent.cancel();
		                               });
	}
	
	private _loadSmartTableSettings()
	{
		const columnTitlePrefix = 'ORDER_VIEW.ORDER_PRODUCT_INFO.SMART_TABLE.';
		const getTranslate = (name: string): Observable<string | any> =>
				this._translateService.get(columnTitlePrefix + name);
		
		forkJoin(
				this._translateService.get('Id'),
				getTranslate('IMAGE'),
				getTranslate('NAME'),
				getTranslate('QTY'),
				getTranslate('PRICE'),
				getTranslate('COMMENT')
		)
				.pipe(takeUntil(this._ngDestroy$))
				.subscribe(([id, image, name, qty, price, comment]) =>
				           {
					           this.settingsSmartTable = {
						           actions:    false,
						           selectMode: 'multi',
						           columns:    {
							           name:    {
								           title:           name,
								           renderComponent: ProductTitleRedirectComponent,
								           type:            'custom',
							           },
							           qty:     {
								           title:           qty,
								           class:           'text-center',
								           type:            'custom',
								           width:           '15%',
								           renderComponent: StoreOrderProductAmountComponent,
							           },
							           price:   {
								           title:           price,
								           type:            'custom',
								           width:           '20%',
								           renderComponent: StoreProductPriceComponent,
							           },
							           comment: {
								           title: comment,
								           width: '15%',
							           },
							           image:   {
								           title:           image,
								           type:            'custom',
								           class:           'text-center',
								           renderComponent: StoreProductImageComponent,
								           filter:          false,
							           },
						           },
						           pager:      {
							           display: true,
							           perPage: 5,
						           },
					           };
				           });
	}
	
	private _applyTranslationOnSmartTable()
	{
		this.addProductsModalTranslates();
		this._translateService.onLangChange.subscribe(() =>
		                                              {
			                                              this._loadSmartTableSettings();
			                                              this.addProductsModalTranslates();
		                                              });
	}
}
