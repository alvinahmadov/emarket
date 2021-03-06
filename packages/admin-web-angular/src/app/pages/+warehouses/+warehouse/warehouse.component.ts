import {
	Component,
	OnDestroy,
	AfterViewInit,
	ViewChild,
	OnChanges,
}                                          from '@angular/core';
import { DatePipe }                        from '@angular/common';
import { NgbModal, NgbModalRef }           from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router }          from '@angular/router';
import { ToasterService }                  from 'angular2-toaster';
import { LocalDataSource }                 from 'ng2-smart-table';
import { TranslateService }                from '@ngx-translate/core';
import { Subject, forkJoin, Observable }   from 'rxjs';
import { takeUntil, first }                from 'rxjs/operators';
import { ILocaleMember }                   from '@modules/server.common/interfaces/ILocale';
import Order                               from '@modules/server.common/entities/Order';
import Warehouse                           from '@modules/server.common/entities/Warehouse';
import WarehouseProduct                    from '@modules/server.common/entities/WarehouseProduct';
import { ProductLocalesService }           from '@modules/client.common.angular2/locale/product-locales.service';
import { WarehouseRouter }                 from '@modules/client.common.angular2/routers/warehouse-router.service';
import {
	ordersFilter,
	OrdersFilterModes,
}                                          from '@app/pages/ordersFilter/ordersFilter';
import { WarehouseOrdersService }          from '@app/@core/data/warehouseOrders.service';
import { WarehouseProductCreateComponent } from '@app/@shared/warehouse-product/warehouse-product-create';
import { ElapsedComponent }                from '@app/@shared/render-component/warehouse-table/elapsed/elapsed.component';
import { RedirectOrderComponent }          from '@app/@shared/render-component/customer-orders-table/redirect-order.component';
import { StatusComponent }                 from '@app/@shared/render-component/warehouse-table/status/status.component';
import { ProductsTableComponent }          from './products-table/products-table.component';
import { WarehouseSelectViewComponent }    from './warehouse-select-view/warehouse-select-view.component';
import { WarehouseOrderComponent }         from './+warehouse-order/warehouse-order.component';

const perPage = 3;

@Component({
	           selector:    'ea-warehouse',
	           templateUrl: './warehouse.component.html',
	           styleUrls:   ['./warehouse.component.scss'],
           })
export class WarehouseComponent implements OnDestroy, AfterViewInit, OnChanges
{
	@ViewChild('productsTable')
	public productsTable: ProductsTableComponent;
	@ViewChild('warehouseSelectView')
	public warehouseSelectView: WarehouseSelectViewComponent;
	public filterMode: OrdersFilterModes = 'all';
	public orders: Order[] = [];
	public allOrders: Order[] = [];
	public loading: boolean;
	public selectedWarehouse: Warehouse;
	public selectedOrder: Order;
	public settingsSmartTable: object;
	public sourceSmartTable: LocalDataSource = new LocalDataSource();
	public warehouses: Warehouse[];
	public warehouse: Warehouse;
	protected topWarehouseProducts: WarehouseProduct[];
	protected warehouseID: string;
	protected timers: string[] = [];
	protected isSelectedOrderActionsAvailable: boolean = true;
	private ngDestroy$ = new Subject<void>();
	private dataCount: number;
	private $storeOrders;
	private page: number = 1;
	
	constructor(
			private readonly modalService: NgbModal,
			private warehouseRouter: WarehouseRouter,
			private translate: TranslateService,
			private readonly _route: ActivatedRoute,
			private readonly _toasterService: ToasterService,
			private _productLocalesService: ProductLocalesService,
			private readonly _router: Router,
			private _translateService: TranslateService,
			private warehouseOrdersService: WarehouseOrdersService
	)
	{
		this._loadTableSettings();
		this._loadWarehouses();
		this._listenForEntityLocaleTranslate();
	}
	
	public ngAfterViewInit()
	{
		this.loadSmartTableTranslates();
		this._smartTableChange();
	}
	
	public ngOnChanges() {}
	
	public ngOnDestroy()
	{
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
	
	public openWarehouseOrderCreateModal()
	{
		const modalRef: NgbModalRef = this.modalService.open(
				WarehouseOrderComponent,
				{
					size:        'xl',
					container:   'nb-layout',
					windowClass: 'ng-custom',
					backdrop:    'static',
				}
		);
		
		(modalRef.componentInstance as WarehouseOrderComponent).orderFinishedEmitter
		                                                       .pipe(takeUntil(this.ngDestroy$))
		                                                       .subscribe(() =>
		                                                                  {
			                                                                  modalRef.close();
		                                                                  });
	}
	
	public switchLanguage(language: string)
	{
		this.translate.use(language);
	}
	
	public async filterOrders(mode)
	{
		this.selectedOrder = null;
		this.page = 1;
		await this._getWarehouseOrders(this.warehouseID, this.page, mode);
		this.sourceSmartTable.setPage(1);
		this.filterMode = mode;
	}
	
	public getOrders(): Order[]
	{
		this.orders = ordersFilter(this.allOrders, this.filterMode);
		return this.orders;
	}
	
	public selectWarehouseEvent(warehouse)
	{
		this._router.navigate([`/stores/${warehouse.id}`]);
		this.selectedOrder = null;
		this.warehouse = warehouse;
		this.warehouseID = warehouse.id;
		
		this._getWarehouseOrders(warehouse.id, this.page, this.filterMode);
		this._loadTableSettings();
		
		this.selectedWarehouse = warehouse;
		
		if(this.productsTable)
		{
			this.productsTable.loadDataSmartTable(warehouse.id);
		}
	}
	
	public loadSmartTableTranslates()
	{
		this._translateService
		    .onLangChange
		    .subscribe(() => this._loadTableSettings());
	}
	
	public selectOrder(warehouseOrderProducts)
	{
		this.selectedOrder =
				this.selectedOrder === warehouseOrderProducts.data
				? null
				: warehouseOrderProducts.data;
	}
	
	public openAddProductTypeModel()
	{
		const activeModal = this.modalService.open(
				WarehouseProductCreateComponent,
				{
					size:        'lg',
					container:   'nb-layout',
					backdrop:    'static',
					windowClass: 'ng-custom',
				}
		);
		const modalComponent: WarehouseProductCreateComponent =
				      activeModal.componentInstance;
		modalComponent.warehouseId = this.warehouseID;
		modalComponent.selectedWarehouse = this.selectedWarehouse;
	}
	
	protected localeTranslate(member: ILocaleMember[])
	{
		return this._productLocalesService.getTranslate(member);
	}
	
	private _loadWarehouses()
	{
		this.warehouseRouter
		    .getAll()
		    .pipe(takeUntil(this.ngDestroy$))
		    .subscribe((w: Warehouse[]) =>
		               {
			               this.warehouses = w;
			               this._selectWarehouseIfIdExist();
		               });
	}
	
	private async _getWarehouseOrders(
			id: string,
			page   = 1,
			status = this.filterMode
	)
	{
		if(this.$storeOrders)
		{
			await this.$storeOrders.unsubscribe();
		}
		this.$storeOrders = this.warehouseOrdersService
		                        .getStoreOrdersTableData(
				                        id,
				                        {
					                        skip:  perPage * (page - 1),
					                        limit: perPage,
				                        },
				                        status
		                        )
		                        .pipe(takeUntil(this.ngDestroy$))
		                        .subscribe(async(res) =>
		                                   {
			                                   const orders = res.orders;
			                                   await this._loadDataCount(id, status);
			
			                                   this.allOrders = orders;
			                                   const data = this._setupDataForSmartTable(orders);
			                                   const ordersData = new Array(this.dataCount);
			
			                                   ordersData.splice(perPage * (page - 1), perPage, ...data);
			
			                                   await this.sourceSmartTable.load(ordersData);
		                                   });
	}
	
	private _loadTableSettings()
	{
		const columnTitlePrefix = 'WAREHOUSE_VIEW.';
		const getTranslate = (name: string): Observable<string | any> =>
				this._translateService.get(columnTitlePrefix + name);
		
		forkJoin(
				this._translateService.get('Id'),
				getTranslate('ORDER_NUMBER'),
				getTranslate('PRODUCTS'),
				getTranslate('WAREHOUSE_STATUS'),
				getTranslate('CARRIER_STATUS'),
				getTranslate('PAID'),
				getTranslate('CANCELLED'),
				getTranslate('CREATED'),
				getTranslate('ELAPSED')
		)
				.pipe(takeUntil(this.ngDestroy$))
				.subscribe(
						([
							 id,
							 orderNumber,
							 product,
							 status,
							 carrier,
							 paid,
							 cancelled,
							 created,
							 elapsed,
						 ]) =>
						{
							this.settingsSmartTable = {
								actions: false,
								columns: {
									orderNumber:       {
										title:           orderNumber,
										type:            'custom',
										renderComponent: RedirectOrderComponent,
										width:           '100px',
									},
									product:           { title: product, type: 'html' },
									status:            {
										title: status,
										type:  'html',
										width: '100px',
									},
									carrierStatusHtml: {
										title: carrier,
										type:  'html',
										width: '100px',
									},
									paid:              {
										title:                   paid,
										type:                    'custom',
										renderComponent:         StatusComponent,
										onComponentInitFunction: async(
												instance: StatusComponent
										) =>
										                         {
											                         instance.text = paid;
											                         instance.checkOrderField = 'isPaid';
										                         },
										width:                   '100px',
									},
									cancelled:         {
										title:                   cancelled,
										type:                    'custom',
										renderComponent:         StatusComponent,
										onComponentInitFunction: async(
												instance: StatusComponent
										) =>
										                         {
											                         instance.text = cancelled;
											                         instance.checkOrderField = 'isCancelled';
										                         },
										width:                   '100px',
									},
									created:           { title: created, type: 'string' },
									elapsed:           {
										title:           elapsed,
										filter:          false,
										type:            'custom',
										renderComponent: ElapsedComponent,
									},
								},
								pager:   {
									display: true,
									perPage,
								},
							};
						}
				);
	}
	
	private _setupDataForSmartTable(orders: Order[])
	{
		const data = [];
		
		orders.forEach((order) =>
		               {
			               const raw: Date = new Date(<any>order._createdAt);
			               const formatted: string = new DatePipe('en-EN').transform(
					               raw,
					               'dd-MMM-yyyy hh:mm:ss'
			               );
			
			               const columnTitlePrefix = 'STATUS_TEXT.';
			               const getTranslate = (name: string): Observable<string | any> =>
					               this._translateService.get(columnTitlePrefix + name);
			
			               forkJoin(
					               this._translateService.get('Id'),
					               getTranslate(order.warehouseStatusText),
					               getTranslate(order.carrierStatusText),
					               getTranslate('CARRIER'),
					               getTranslate('PAID'),
					               getTranslate('CANCELLED'),
					               getTranslate('CREATED'),
					               getTranslate('ELAPSED')
			               )
					               .pipe(takeUntil(this.ngDestroy$))
					               .subscribe(
							               ([
								                id,
								                warehouseStatusText,
								                carrierStatusText,
								                carrier,
								                paid,
								                cancelled,
								                created,
								                elapsed,
							                ]) =>
							               {
								               data.push({
									                         id:                  order.id,
									                         products:            order.products,
									                         orderNumber:         order.orderNumber,
									                         warehouseStatusText: order.warehouseStatusText,
									                         carrierStatusText:   order.carrierStatusText,
									                         createdAt:           order.createdAt,
									                         warehouseStatus:     order.warehouseStatus,
									                         carrier:             order.carrier,
									                         carrierStatus:       order.carrierStatus,
									                         isPaid:              order.isPaid,
									                         isCancelled:         order.isCancelled,
									                         product:             order.products.length
									                                              ? `
							<div>
								<img width="32" height="32" src="${this.localeTranslate(
													                         order.products[0].product.images
											                         )}" />
								<p class="d-inline-block">
									${this.localeTranslate(order.products[0].product.title)}
									<span class="badge badge-pill badge-secondary">${order.products[0].count}</span>
								</p>
							</div>
						`
									                                              : '',
									                         status:              `<div class="badge badge-secondary">${warehouseStatusText}</div>`,
									                         carrierStatusHtml:   `<div class="badge badge-secondary">${carrierStatusText}</div>`,
									                         created:             formatted,
									                         orderType:           order.orderType,
									                         order,
								                         });
							               }
					               );
		               });
		
		return data;
	}
	
	private _listenForEntityLocaleTranslate()
	{
		this.translate.onLangChange.subscribe(() =>
		                                      {
			                                      const data = this._setupDataForSmartTable(this.getOrders());
			                                      this.sourceSmartTable.load(data);
		                                      });
	}
	
	private async _selectWarehouseIfIdExist()
	{
		const p = await this._route.params.pipe(first()).toPromise();
		const warehouseId = p.id;
		if(warehouseId !== undefined)
		{
			const warehouse = this.warehouses.find((w) => w.id === p.id);
			if(warehouse !== undefined)
			{
				this.selectWarehouseEvent(warehouse as Warehouse);
			}
			else
			{
				this._toasterService.pop(
						`warning`,
						`Warehouse with id '${warehouseId}' is not active now!`
				);
			}
		}
	}
	
	private async _smartTableChange()
	{
		this.sourceSmartTable
		    .onChanged()
		    .pipe(takeUntil(this.ngDestroy$))
		    .subscribe(async(event) =>
		               {
			               if(event.action === 'page')
			               {
				               const page = event.paging.page;
				               this.page = page;
				               this._getWarehouseOrders(
						               this.warehouseID,
						               page,
						               (status = this.filterMode)
				               );
			               }
		               });
	}
	
	private async _loadDataCount(id, status)
	{
		this.dataCount = await this.warehouseOrdersService.getCountOfStoreOrders(
				id,
				status
		);
	}
}
