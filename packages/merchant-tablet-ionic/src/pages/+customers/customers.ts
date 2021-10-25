import { Observable, forkJoin, Subject } from 'rxjs';
import { takeUntil }                     from 'rxjs/operators';
import 'rxjs/add/operator/takeUntil';
import { LocalDataSource }               from 'ng2-smart-table';
import { Component, OnDestroy }          from '@angular/core';
import { ModalController }               from '@ionic/angular';
import { TranslateService }              from '@ngx-translate/core';
import Customer                          from '@modules/server.common/entities/Customer';
import Order                             from '@modules/server.common/entities/Order';
import { IOrderCreateInput }             from '@modules/server.common/routers/IWarehouseOrdersRouter';
import { WarehouseOrdersRouter }         from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { CustomerAddrPopupPage }         from './customer-addr-popup/customer-addr-popup';
import { UserMutationComponent }         from '../../@shared/user/mutation/user-mutation.component';
import { StorageService }                from '../../services/storage.service';
import { WarehouseOrdersService }        from '../../services/warehouse-orders.service';
import { OrdersService }                 from '../../services/orders.service';
import { AddressComponent }              from '../../components/users-table/address';
import { EmailComponent }                from '../../components/users-table/email';
import { ImageUserComponent }            from '../../components/users-table/image';
import { OrdersComponent }               from '../../components/users-table/orders';
import { UserPhoneComponent }            from '../../components/users-table/phone';
import { TotalComponent }                from '../../components/users-table/total';
import { ConfirmDeletePopupPage }        from '../../components/confirm-delete-popup/confirm-delete-popup';

@Component({
	           selector:    'page-customers',
	           styleUrls:   ['./customers.scss'],
	           templateUrl: './customers.html',
           })
export class CustomersPage implements OnDestroy
{
	public orders: Order[];
	public customers: Customer[];
	public showNoDeliveryIcon: boolean;
	public settingsSmartTable: object;
	public sourceSmartTable = new LocalDataSource();
	
	private _ngDestroy$ = new Subject<void>();
	private orders$: any;
	
	constructor(
			private warehouseOrdersRouter: WarehouseOrdersRouter,
			private readonly _modalCtrl: ModalController,
			private readonly _translateService: TranslateService,
			private readonly ordersService: OrdersService,
			private readonly warehouseOrdersService: WarehouseOrdersService,
			private readonly storageService: StorageService
	)
	{
		this.loadCustomers();
		this._loadSettingsSmartTable();
	}
	
	public ngOnDestroy(): void
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	public get warehouseId(): string
	{
		return localStorage.getItem('_warehouseId');
	}
	
	public getUserName(customer: Customer): string
	{
		if(customer)
			return customer.fullName.trim();
		return "";
	}
	
	public async ionViewCanEnter(): Promise<boolean>
	{
		const isLogged = await this.storageService.isLogged();
		
		return this.storageService.maintenanceMode === null && isLogged;
	}
	
	public ionViewWillLeave(): void
	{
		if(this.orders$)
		{
			this.orders$.unsubscribe();
		}
	}
	
	public getOrdersCount(customerId: string): number
	{
		return this.orders.filter((o: Order) => o.customer.id === customerId).length;
	}
	
	public getTotalPrice(customerId: string): number
	{
		const orders = this.orders
		                   .filter((o: Order) => o.isPaid)
		                   .filter((o: Order) => o.customer.id === customerId);
		let totalPrice = 0;
		if(orders.length > 0)
		{
			totalPrice = orders
					.map((o: Order) => o.totalPrice)
					.reduce((a, b) => a + b);
		}
		return totalPrice;
	}
	
	public async showCustomerMutationModal(customer?: Customer): Promise<void>
	{
		const modal = await this._modalCtrl.create({
			                                           component:      UserMutationComponent,
			                                           componentProps: { customer },
			                                           cssClass:       'customer-add-wrapper',
		                                           });
		
		await modal.present();
		
		const res = await modal.onDidDismiss();
		const customerId = res.data;
		if(customerId)
		{
			const orderCreateInput: IOrderCreateInput = {
				warehouseId: this.warehouseId,
				customerId:  customerId,
				products:    [],
			};
			
			await this.warehouseOrdersRouter.create(orderCreateInput);
		}
	}
	
	public async showAddress(e): Promise<void>
	{
		const modal = await this._modalCtrl.create({
			                                           component:      CustomerAddrPopupPage,
			                                           componentProps: { user: e.data.user },
			                                           cssClass:       'customer-address-popup',
		                                           });
		await modal.present();
	}
	
	public async deleteCustomer(e): Promise<void>
	{
		const modal = await this._modalCtrl.create({
			                                           component:      ConfirmDeletePopupPage,
			                                           componentProps: { data: e.data },
			                                           cssClass:       'confirm-delete-wrapper',
		                                           });
		
		await modal.present();
		
		const res = await modal.onDidDismiss();
		if(res.data)
		{
			const customerId = e.data.customer.id;
			const storeId = this.warehouseId;
			
			await this.warehouseOrdersService.removeCustomerOrders(storeId, customerId);
		}
	}
	
	public async editCustomer(e): Promise<void>
	{
		const customer = e.data.customer;
		await this.showCustomerMutationModal(customer);
	}
	
	private loadCustomers(): void
	{
		const loadData = (usersInfo) =>
		{
			const usersVM = usersInfo.map(
					(userInfo: {
						customer: Customer;
						ordersCount: number;
						totalPrice: number;
					}) =>
					{
						return {
							image:     userInfo.customer.avatar,
							username:  userInfo.customer.username,
							customer:  userInfo.customer,
							phone:     userInfo.customer.phone,
							addresses: userInfo.customer.geoLocation.city,
							orders:    userInfo.ordersCount,
							total:     userInfo.totalPrice,
						};
					}
			);
			
			this.sourceSmartTable.load(usersVM);
		};
		
		this.ordersService
		    .getOrderedUsersInfo(this.warehouseId)
		    .pipe(takeUntil(this._ngDestroy$))
		    .subscribe(
				    (
						    userInfo: Array<{
							    customer: Customer;
							    ordersCount: number;
							    totalPrice: number;
						    }>
				    ) =>
				    {
					    userInfo.length === 0
					    ? (this.showNoDeliveryIcon = true)
					    : (this.showNoDeliveryIcon = false);
					
					    loadData(userInfo);
				    }
		    );
	}
	
	private _loadSettingsSmartTable(): void
	{
		const columnTitlePrefix = 'CUSTOMERS_VIEW.';
		const getTranslate = (name: string): Observable<string> =>
				this._translateService.get(columnTitlePrefix + name);
		
		forkJoin(
				getTranslate('IMAGE'),
				getTranslate('NAME'),
				getTranslate('FULLNAME'),
				getTranslate('PHONE_NUMBER'),
				getTranslate('ADDRESSES'),
				getTranslate('ORDERS'),
				getTranslate('TOTAL'),
				getTranslate('E_MAIL')
		)
				.pipe(takeUntil(this._ngDestroy$))
				.subscribe(
						([image, username, fullName, phone, addresses, orders, total, email]) =>
						{
							this.settingsSmartTable = {
								mode:    'external',
								edit:    {
									editButtonContent: '<i class="fa fa-edit"></i>',
									confirmEdit:       true,
								},
								delete:  {
									deleteButtonContent: '<i class="fa fa-trash"></i>',
									confirmDelete:       true,
								},
								actions: {
									custom: [
										{
											name:  'track',
											title: '<i class="fa fa-map-marker"></i>',
										},
									],
								},
								columns: {
									image:     {
										title:           image,
										type:            'custom',
										renderComponent: ImageUserComponent,
										filter:          false,
									},
									username:  { title: username },
									fullName:  { title: fullName },
									phone:     {
										title:           phone,
										type:            'custom',
										renderComponent: UserPhoneComponent,
									},
									addresses: {
										title:           addresses,
										type:            'custom',
										renderComponent: AddressComponent,
									},
									orders:    {
										title:           orders,
										class:           'text-center',
										type:            'custom',
										renderComponent: OrdersComponent,
									},
									total:     {
										title:           total,
										class:           'text-center',
										type:            'custom',
										renderComponent: TotalComponent,
									},
									email:     {
										title:           email,
										class:           'text-center',
										filter:          false,
										type:            'custom',
										renderComponent: EmailComponent,
									},
								},
								pager:   {
									display: true,
									perPage: 14,
								},
							};
						}
				);
	}
}
