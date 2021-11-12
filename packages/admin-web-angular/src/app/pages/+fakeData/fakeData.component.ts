import { Component, OnDestroy, OnInit }             from '@angular/core';
import _                                            from 'lodash';
import faker                                        from 'faker';
import { Subject }                                  from 'rxjs';
import { first, takeUntil }                         from 'rxjs/operators';
import { ToasterService }                           from 'angular2-toaster';
import { IProductsCategory, IProductsCategoryName } from '@modules/server.common/interfaces/IProductsCategory';
import { IWarehouseProductCreateObject }            from '@modules/server.common/interfaces/IWarehouseProduct';
import { ICarrierRegistrationInput }                from '@modules/server.common/routers/ICarrierRouter';
import { CountryAbbreviations }                     from '@modules/server.common/data/abbreviation-to-country';
import { getCurrency }                              from '@modules/server.common/data/currencies';
import Carrier                                      from '@modules/server.common/entities/Carrier';
import Customer                                     from '@modules/server.common/entities/Customer';
import Invite                                       from '@modules/server.common/entities/Invite';
import Order                                        from '@modules/server.common/entities/Order';
import Product                                      from '@modules/server.common/entities/Product';
import ProductsCategory                             from '@modules/server.common/entities/ProductsCategory';
import Warehouse                                    from '@modules/server.common/entities/Warehouse';
import FakeDataUtils                                from '@modules/server.common/utilities/fake-data';
import { CarrierRouter }                            from '@modules/client.common.angular2/routers/carrier-router.service';
import { CustomerRouter }                           from '@modules/client.common.angular2/routers/customer-router.service';
import { CustomerAuthRouter }                       from '@modules/client.common.angular2/routers/customer-auth-router.service';
import { InviteRouter }                             from '@modules/client.common.angular2/routers/invite-router.service';
import { OrderRouter }                              from '@modules/client.common.angular2/routers/order-router.service';
import { ProductRouter }                            from '@modules/client.common.angular2/routers/product-router.service';
import { WarehouseRouter }                          from '@modules/client.common.angular2/routers/warehouse-router.service';
import { WarehouseAuthRouter }                      from '@modules/client.common.angular2/routers/warehouse-auth-router.service';
import { WarehouseOrdersRouter }                    from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { WarehouseProductsRouter }                  from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import { FakeDataBtnState }                         from '@app/models/FakeDataBtnState';
import FakeDataCarriers                             from '@app/@core/data/fakeDataServices/carriers';
import FakeDataUsers                                from '@app/@core/data/fakeDataServices/customers';
import FakeDataInvites                              from '@app/@core/data/fakeDataServices/invites';
import FakeDataProducts                             from '@app/@core/data/fakeDataServices/products';
import FakeDataProductsCategories                   from '@app/@core/data/fakeDataServices/productsCategories';
import FakeDataWarehouses                           from '@app/@core/data/fakeDataServices/warehouses';
import FakeDataWarehousesProducts                   from '@app/@core/data/fakeDataServices/warehousesProducts';
import { CarriersService }                          from '@app/@core/data/carriers.service';
import { CurrenciesService }                        from '@app/@core/data/currencies.service';
import { CustomersService }                         from '@app/@core/data/customers.service';
import { DataService }                              from '@app/@core/data/data.service';
import { InvitesService }                           from '@app/@core/data/invites.service';
import { InvitesRequestsService }                   from '@app/@core/data/invites-requests.service';
import { OrdersService }                            from '@app/@core/data/orders.service';
import { ProductsCategoryService }                  from '@app/@core/data/productsCategory.service';
import { WarehousesService }                        from '@app/@core/data/warehouses.service';
import { NotifyService }                            from '@app/@core/services/notify/notify.service';
import { environment }                              from 'environments/environment';

const NEED_DEFAULT_SETTINGS_MESSAGE =
		      "Can't generate fake data without DEFAULT_LONGITUDE and DEFAULT_LATITUDE";

const qty = environment.FAKE_CUSTOMERS_COUNT;
const lng = environment.DEFAULT_LONGITUDE;
const lat = environment.DEFAULT_LATITUDE;

@Component({
	           selector:    'ea-fake-data',
	           styleUrls:   ['./fakeData.component.scss'],
	           templateUrl: './fakeData.component.html',
           })
export class FakeDataComponent implements OnInit, OnDestroy
{
	invite: Invite | null = null;
	peperoniAndMushroomPizzaProduct: Product;
	sushiAndCaviarMixProduct: Product;
	sushiMixProduct: Product;
	pastaProduct: Product;
	sushiBoxProduct: Product;
	peperoniAndTomatoPizzaProduct: Product;
	warehouse1: Warehouse;
	warehouse2: Warehouse;
	warehouse3: Warehouse;
	customer: Customer;
	order1: Order;
	order2: Order;
	includeHardcodedData: boolean = false;
	
	public loading: FakeDataBtnState;
	isBtnDisabled: FakeDataBtnState;
	
	private _existingWarehouses: Warehouse[] = [];
	private _ngDestroy$ = new Subject<void>();
	private _hardcodedCarrierIds: string[] = [];
	// PRODUCT CATEGORIES
	private _productCategories: Array<IProductsCategory> = [];
	private _hardcodedWarehouses: Warehouse[] = [];
	
	constructor(
			protected fakeDataWarehousesProducts: FakeDataWarehousesProducts,
			protected fakeDataWarehouses: FakeDataWarehouses,
			protected fakeDataInvites: FakeDataInvites,
			protected fakeDataUsers: FakeDataUsers,
			protected fakeDataCarriers: FakeDataCarriers,
			protected fakeDataProducts: FakeDataProducts,
			protected carrierRouter: CarrierRouter,
			protected customerRouter: CustomerRouter,
			protected customerAuthRouter: CustomerAuthRouter,
			protected inviteRouter: InviteRouter,
			protected orderRouter: OrderRouter,
			protected productRouter: ProductRouter,
			protected toasterService: ToasterService,
			protected warehouseRouter: WarehouseRouter,
			protected warehouseAuthRouter: WarehouseAuthRouter,
			protected warehouseOrdersRouter: WarehouseOrdersRouter,
			protected warehouseProductsRouter: WarehouseProductsRouter,
			private readonly _carriersService: CarriersService,
			private readonly _warehousesService: WarehousesService,
			private readonly _dataService: DataService,
			private readonly _productsCategoriesService: ProductsCategoryService,
			private readonly _ordersService: OrdersService,
			private readonly _invitesService: InvitesService,
			private readonly _inviteRequestsService: InvitesRequestsService,
			private readonly _notifyService: NotifyService,
			private readonly _customersService: CustomersService,
			private readonly _currenciesService: CurrenciesService,
			private readonly _fakeDataProductsCategories: FakeDataProductsCategories,
	)
	{
		this._setupButtonStatuses();
		this._setupButtonLoading();
	}
	
	// noinspection JSUnusedLocalSymbols
	private get _hasProducts()
	{
		return (
				this.peperoniAndMushroomPizzaProduct &&
				this.sushiAndCaviarMixProduct &&
				this.sushiMixProduct &&
				this.pastaProduct &&
				this.sushiBoxProduct &&
				this.peperoniAndTomatoPizzaProduct
		);
	}
	
	private get _notify()
	{
		const showMessage = (message: string) =>
				this._notifyService.success(message);
		const errror = (message: string) => this._notifyService.error(message);
		
		return {
			invite:                       (id) =>
					                              showMessage(`Invite with id "${id}" created successfully`),
			customer:                     (id) =>
					                              showMessage(`User with id "${id}" created successfully`),
			carrier:                      (id) =>
					                              showMessage(`Carrier with id "${id}" created successfully`),
			product:                      (id) =>
					                              showMessage(`Product with id "${id}" created successfully`),
			warehouse:                    (id) =>
					                              showMessage(`Warehouse with id "${id}" created successfully`),
			warehouseAddProducts:         (id) =>
					                              showMessage(
							                              `Warehouse with id "${id}" added products successfully`
					                              ),
			geoLocation:                  (id) =>
					                              showMessage(`Warehouse with id "${id}" update geo location`),
			order:                        (id) =>
					                              showMessage(`Order with id "${id}" created successfully`),
			confirmOrder:                 (id) =>
					                              showMessage(`Order with id "${id}" confirmed`),
			clearAll:                     () => showMessage('All data was removed from database'),
			generateRandomOrdersPerStore: (storeId, ordersCount) =>
					                              showMessage(
							                              `Store with id "${storeId}" has new ${ordersCount} orders.`
					                              ),
			errorGenerate:                (msg) => errror(msg),
		};
	}
	
	ngOnInit()
	{
		this._listenForExistingWarehouses();
	}
	
	async callAll()
	{
		this.isBtnDisabled.all = true;
		this.loading.all = true;
		
		if(!this.includeHardcodedData)
		{
			await this._generateCurrencies();
		}
		
		await this.createInvite1();
		await this.createInvite2();
		await this.createInvite3();
		await this.createInvite4();
		await this._generateInvitesConnectedToInviteRequests();
		await this._generateInviteRequests();
		await this.createUser();
		await this.createCarrier1();
		await this.createCarrier2();
		await this.createCarrier3();
		await this._generateProducts();
		await this.createWarehouse1();
		await this.createWarehouse2();
		await this.createWarehouse3();
		await this.createWarehouse1Products();
		await this.createWarehouse2Products();
		await this.createWarehouse3Products();
		await this.updateWarehouse1GeoLocation();
		await this.createOrder1();
		await this.createOrder2();
		await this.confirmOrder1();
		await this.confirmOrder2();
		await this._generate1000Customers();
		
		if(this.includeHardcodedData === true)
		{
			await this.generateHardcoded();
		}
		
		await this.generate100CustomersStoresCarriers();
		await this._generageRangeCustomers(300);
		await this.generateRandomOrdersPerStore();
		
		await this._generate1000Customers();
		
		if(this.includeHardcodedData === false)
		{
			await this._generateRandomOrdersPerCarrier();
		}
		
		this.isBtnDisabled.all = false;
		this.loading.all = false;
	}
	
	async generate100CustomersStoresCarriers()
	{
		await this._generateCustomerEntities();
	}
	
	async generateHardcoded()
	{
		this.loading.hardcoded = true;
		this.isBtnDisabled.hardcoded = true;
		
		await this._generateCurrencies();
		
		await this._createHardcodedInvites();
		await this._createHardcodedWarehouses();
		await this._generateProducts();
		await this._createWarehouseProductsForHardcodedWarehouses();
		await this._createHardcodedCarriers();
		
		await this._generateRandomOrdersPerCarrier();
		
		this.loading.hardcoded = false;
		this.isBtnDisabled.hardcoded = false;
	}
	
	async clearAll()
	{
		if(window.confirm('Are you sure?'))
		{
			this.isBtnDisabled.clearAll = true;
			this.loading.clearAll = true;
			await this._dataService.clearAll();
			this.isBtnDisabled.clearAll = false;
			this.loading.clearAll = false;
			
			this._notify.clearAll();
		}
	}
	
	async createInvite1()
	{
		this.loading.invite1 = true;
		this.isBtnDisabled.invite1 = true;
		await this._createInvite();
		this.loading.invite1 = false;
		this.isBtnDisabled.invite1 = false;
	}
	
	async createInvite2()
	{
		this.loading.invite2 = true;
		this.isBtnDisabled.invite2 = true;
		await this._createInvite();
		this.loading.invite2 = false;
		this.isBtnDisabled.invite2 = false;
	}
	
	async createInvite3()
	{
		this.loading.invite3 = true;
		this.isBtnDisabled.invite3 = true;
		await this._createInvite();
		this.loading.invite3 = false;
		this.isBtnDisabled.invite3 = false;
	}
	
	async createInvite4()
	{
		this.loading.invite4 = true;
		this.isBtnDisabled.invite4 = true;
		await this._createInvite();
		this.loading.invite4 = false;
		this.isBtnDisabled.invite4 = false;
	}
	
	async generate100Customers()
	{
		this.loading.users100 = true;
		this.isBtnDisabled.users100 = true;
		
		let userNumber = 1;
		
		const create = async() =>
		{
			const userRegisterInput = this.fakeDataUsers.getUserRegistrationInput();
			const customer: Customer = await this.customerAuthRouter.register(
					userRegisterInput
			);
			this._notify.customer(customer.id);
			
			if(userNumber <= 100)
			{
				userNumber += 1;
				await create();
			}
		};
		
		await create();
		this.loading.users100 = false;
		this.isBtnDisabled.users100 = false;
	}
	
	async createUser()
	{
		this.isBtnDisabled.user = true;
		this.loading.user = true;
		
		if(this.invite === null)
		{
			await this._createInvite();
		}
		
		const firstName = faker.name.firstName();
		const lastName = faker.name.lastName();
		const username = faker.internet.userName(firstName, lastName);
		const email = faker.internet.email(firstName, lastName, 'emarket');
		const avatar = FakeDataUtils.getFakeImg(300, 300, 12, firstName + ' ' + lastName);
		this.customer = await this.customerAuthRouter.register({
			                                                       user:     {
				                                                       username:    username,
				                                                       firstName:   firstName,
				                                                       lastName:    lastName,
				                                                       role:        "customer",
				                                                       avatar:      avatar,
				                                                       email:       email,
				                                                       geoLocation: this.invite.geoLocation,
				                                                       apartment:   this.invite.apartment,
			                                                       },
			                                                       password: '123456'
		                                                       });
		
		this.isBtnDisabled.user = false;
		this.loading.user = false;
		this._notify.customer(this.customer.id);
	}
	
	async createCarrier1()
	{
		this.isBtnDisabled.carrier1 = true;
		this.loading.carrier1 = true;
		
		await this._createCarrier();
		this.loading.carrier1 = false;
		
		this.isBtnDisabled.carrier1 = false;
	}
	
	async createCarrier2()
	{
		this.loading.carrier2 = true;
		this.isBtnDisabled.carrier2 = true;
		
		await this._createCarrier();
		this.loading.carrier2 = false;
		this.isBtnDisabled.carrier2 = false;
	}
	
	async createCarrier3()
	{
		this.loading.carrier3 = true;
		this.isBtnDisabled.carrier3 = true;
		
		await this._createCarrier();
		this.loading.carrier3 = false;
		this.isBtnDisabled.carrier3 = false;
	}
	
	async generate100Carriers()
	{
		this.loading.carriers100 = true;
		this.isBtnDisabled.carriers100 = true;
		
		await this._generate100Carriers();
		
		this.loading.carriers100 = false;
		this.isBtnDisabled.carriers100 = false;
	}
	
	async createPeperoniAndMushroomPizzaProduct(
			categories: IProductsCategory[] = []
	)
	{
		this.isBtnDisabled.product1 = true;
		this.loading.product1 = true;
		
		const productCreateObject = await this.fakeDataProducts.getPeperoniAndMushroomPizzaCreateObject(
				categories
		);
		
		this.peperoniAndMushroomPizzaProduct = await this.productRouter.create(
				productCreateObject
		);
		
		this.isBtnDisabled.product1 = false;
		this.loading.product1 = false;
		
		this._notify.product(this.peperoniAndMushroomPizzaProduct.id);
	}
	
	async createSushiAndCaviarMixProduct(categories: IProductsCategory[] = [])
	{
		this.isBtnDisabled.product2 = true;
		this.loading.product2 = true;
		
		const productCreateObject = await this.fakeDataProducts.getSushiAndCaviarMixCreateObject(
				categories
		);
		this.sushiAndCaviarMixProduct = await this.productRouter.create(
				productCreateObject
		);
		
		this.isBtnDisabled.product2 = false;
		this.loading.product2 = false;
		this._notify.product(this.sushiAndCaviarMixProduct.id);
	}
	
	async createSushiMixProduct(categories: IProductsCategory[] = [])
	{
		this.isBtnDisabled.product3 = true;
		this.loading.product3 = true;
		
		const productCreateObject = await this.fakeDataProducts.getSushiMixCreateObject(
				categories
		);
		this.sushiMixProduct = await this.productRouter.create(
				productCreateObject
		);
		
		this.isBtnDisabled.product3 = false;
		this.loading.product3 = false;
		this._notify.product(this.sushiMixProduct.id);
	}
	
	async createPastaProduct(categories: IProductsCategory[] = [])
	{
		this.isBtnDisabled.product4 = true;
		this.loading.product4 = true;
		
		const productCreateObject = await this.fakeDataProducts.getPastaCreateObject(
				categories
		);
		this.pastaProduct = await this.productRouter.create(
				productCreateObject
		);
		
		this.isBtnDisabled.product4 = false;
		this.loading.product4 = false;
		this._notify.product(this.pastaProduct.id);
	}
	
	async createSushiBoxProduct(categories: IProductsCategory[] = [])
	{
		this.isBtnDisabled.product5 = true;
		this.loading.product5 = true;
		
		const productCreateObject = await this.fakeDataProducts.getSushiBoxCreateObject(
				categories
		);
		this.sushiBoxProduct = await this.productRouter.create(
				productCreateObject
		);
		
		this.isBtnDisabled.product5 = false;
		this.loading.product5 = false;
		this._notify.product(this.sushiBoxProduct.id);
	}
	
	async createPeperoniAndTomatoPizzaProduct(categories: IProductsCategory[] = [])
	{
		this.isBtnDisabled.product6 = true;
		this.loading.product6 = true;
		
		const productCreateObject = await this.fakeDataProducts.getPeperoniAndTomatoPizzaCreateObject(
				categories
		);
		this.peperoniAndTomatoPizzaProduct = await this.productRouter.create(
				productCreateObject
		);
		
		this.isBtnDisabled.product6 = false;
		this.loading.product6 = false;
		this._notify.product(this.peperoniAndTomatoPizzaProduct.id);
	}
	
	async generate100Warehouses()
	{
		this.isBtnDisabled.warehouse100 = true;
		this.loading.warehouse100 = true;
		
		let warehouseCount = 0;
		
		const create = async() =>
		{
			const warehouseRegisterInput = this.fakeDataWarehouses.registrationInputs.generate();
			const warehouse: Warehouse = await this.warehouseAuthRouter.register(
					warehouseRegisterInput
			);
			
			this._notify.warehouse(warehouse.id);
			if(warehouseCount <= 100)
			{
				warehouseCount += 1;
				await create();
			}
		};
		
		await create();
		
		this.isBtnDisabled.warehouse100 = false;
		this.loading.warehouse100 = false;
	}
	
	async createWarehouse1()
	{
		this.isBtnDisabled.warehouse1 = true;
		this.loading.warehouse1 = true;
		this.warehouse1 = await this._createWarehouseWithCarrier();
		this.isBtnDisabled.warehouse1 = false;
		this.loading.warehouse1 = false;
	}
	
	async createWarehouse2()
	{
		this.isBtnDisabled.warehouse2 = true;
		this.loading.warehouse2 = true;
		this.warehouse2 = await this._createWarehouseWithCarrier();
		this.isBtnDisabled.warehouse2 = false;
		this.loading.warehouse2 = false;
	}
	
	async createWarehouse3()
	{
		this.isBtnDisabled.warehouse3 = true;
		this.loading.warehouse3 = true;
		this.warehouse3 = await this._createWarehouseWithCarrier();
		this.isBtnDisabled.warehouse3 = false;
		this.loading.warehouse3 = false;
	}
	
	async createWarehouse1Products()
	{
		this.isBtnDisabled.warehouseProduct1 = true;
		this.loading.warehouseProduct1 = true;
		
		const products: Product[] = [
			this.peperoniAndMushroomPizzaProduct,
			this.sushiAndCaviarMixProduct,
			this.sushiMixProduct,
			this.pastaProduct,
			this.sushiBoxProduct,
			this.peperoniAndTomatoPizzaProduct,
		];
		await this._createWarehouseProducts(
				this.warehouse1.id,
				products.map((p) => p.id)
		);
		
		this.isBtnDisabled.warehouseProduct1 = false;
		this.loading.warehouseProduct1 = false;
	}
	
	async createWarehouse2Products()
	{
		this.isBtnDisabled.warehouseProduct2 = true;
		this.loading.warehouseProduct2 = true;
		
		const products: Product[] = [
			this.peperoniAndMushroomPizzaProduct,
			this.sushiAndCaviarMixProduct,
			this.sushiMixProduct,
		];
		await this._createWarehouseProducts(
				this.warehouse2.id,
				products.map((p) => p.id)
		);
		
		this.isBtnDisabled.warehouseProduct2 = false;
		this.loading.warehouseProduct2 = false;
	}
	
	async createWarehouse3Products()
	{
		this.isBtnDisabled.warehouseProduct3 = true;
		this.loading.warehouseProduct3 = true;
		
		await this._createWarehouseProducts(this.warehouse3.id, [
			this.sushiBoxProduct.id,
		]);
		
		this.isBtnDisabled.warehouseProduct3 = false;
		this.loading.warehouseProduct3 = false;
	}
	
	async updateWarehouse1GeoLocation()
	{
		this.isBtnDisabled.warehouseGeoLocation = true;
		this.loading.warehouseGeoLocation = true;
		
		const newGeoLocation = this.fakeDataWarehouses.getRandomGeoLocation();
		await this.warehouseRouter.updateGeoLocation(
				this.warehouse1.id,
				newGeoLocation
		);
		
		this.isBtnDisabled.warehouseGeoLocation = false;
		this.loading.warehouseGeoLocation = false;
		this._notify.geoLocation(this.warehouse1.id);
	}
	
	async createOrder1()
	{
		this.isBtnDisabled.createOrder1 = true;
		this.loading.createOrder1 = true;
		
		this.order1 = await this._createOrder(
				this.customer.id,
				this.warehouse1.id,
				this.peperoniAndMushroomPizzaProduct.id
		);
		
		this.isBtnDisabled.createOrder1 = false;
		this.loading.createOrder1 = false;
	}
	
	async confirmOrder1()
	{
		this.isBtnDisabled.confirmOrder1 = true;
		this.loading.confirmOrder1 = true;
		
		await this.orderRouter.confirm(this.order1.id);
		
		this.isBtnDisabled.confirmOrder1 = false;
		this.loading.confirmOrder1 = false;
		this._notify.confirmOrder(this.order1.id);
	}
	
	async createOrder2()
	{
		this.isBtnDisabled.createOrder2 = true;
		this.loading.createOrder2 = true;
		
		this.order2 = await this._createOrder(
				this.customer.id,
				this.warehouse1.id,
				this.sushiBoxProduct.id
		);
		
		this.isBtnDisabled.createOrder2 = false;
		this.loading.createOrder2 = false;
	}
	
	async confirmOrder2()
	{
		this.isBtnDisabled.confirmOrder2 = true;
		this.loading.confirmOrder2 = true;
		
		await this.orderRouter.confirm(this.order2.id);
		
		this.isBtnDisabled.confirmOrder2 = false;
		this.loading.confirmOrder2 = false;
		this._notify.confirmOrder(this.order2.id);
	}
	
	async generateRandomOrdersPerStore(ordersLimit: number = 1000)
	{
		this.isBtnDisabled.create1000Orders = true;
		this.loading.create1000Orders = true;
		
		let stores: Warehouse[] = await this._warehousesService
		                                    .getAllStores()
		                                    .toPromise();
		
		for(let store of stores)
		{
			let storeId = store.id;
			let storeCreatedAt = new Date(store._createdAt);
			
			const response = await this._ordersService
			                           .generateRandomOrdersCurrentStore(
					                           storeId,
					                           storeCreatedAt,
					                           ordersLimit
			                           )
			                           .toPromise();
			
			if(response.error)
			{
				this._notify.errorGenerate(response.message);
			}
			else
			{
				this._notify.generateRandomOrdersPerStore(storeId, ordersLimit);
			}
		}
		
		this.isBtnDisabled.create1000Orders = false;
		this.loading.create1000Orders = false;
	}
	
	ngOnDestroy()
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	private async _createOrder(
			customerId: string,
			warehouseId: string,
			productId: string
	): Promise<Order>
	{
		const order: Order = await this.warehouseOrdersRouter.createByProductType(
				customerId,
				warehouseId,
				productId
		);
		
		this._notify.order(order.id);
		
		return order;
	}
	
	private _setupButtonLoading()
	{
		this.isBtnDisabled = new FakeDataBtnState();
	}
	
	private _setupButtonStatuses()
	{
		this.loading = new FakeDataBtnState();
	}
	
	private async _generate1000Customers()
	{
		if(lng && lat)
		{
			const response = await this._customersService
			                           .generateCustomCustomers(qty, lng, lat)
			                           .toPromise();
			
			if(!response.success)
			{
				this._notify.errorGenerate(response.message);
			}
		}
		else
		{
			console.warn(NEED_DEFAULT_SETTINGS_MESSAGE);
		}
	}
	
	private async _generateInviteRequests()
	{
		if(lng && lat)
		{
			await this._inviteRequestsService
			          .generateInviteRequests(lng, lat, qty)
			          .toPromise();
		}
		else
		{
			console.warn(NEED_DEFAULT_SETTINGS_MESSAGE);
		}
	}
	
	private async _generateInvitesConnectedToInviteRequests()
	{
		if(lng && lat)
		{
			await this._invitesService
			          .generateInvitesConnectedToInviteRequests(lng, lat, qty)
			          .toPromise();
		}
		else
		{
			console.warn(NEED_DEFAULT_SETTINGS_MESSAGE);
		}
	}
	
	private async _generateRandomOrdersPerCarrier()
	{
		await this._generateActiveAndAvailableOrdersPerCarrier();
		await this._generatePastOrdersPerCarrier();
	}
	
	private async _generateActiveAndAvailableOrdersPerCarrier()
	{
		await this._ordersService
		          .generateActiveAndAvailableOrdersPerCarrier()
		          .toPromise();
	}
	
	private async _generatePastOrdersPerCarrier()
	{
		await this._ordersService.generatePastOrdersPerCarrier().toPromise();
	}
	
	private async _generageRangeCustomers(count: number)
	{
		for(let i = 0; i < count; i += 1)
		{
			await this._createRandomUser();
		}
	}
	
	private async _createHardcodedInvites()
	{
		for(const objKey of ['a', 'b', 'c', 'd'])
		{
			const objToCreate = this.fakeDataInvites.getHardcodedCreateObject[
					objKey
					];
			
			const createdObject = await this.inviteRouter.create(objToCreate);
			
			this._notify.invite(createdObject.id);
		}
	}
	
	private async _createInvite()
	{
		const inviteCreateObject = this.fakeDataInvites.getCreateObject();
		
		this.invite = await this.inviteRouter.create(inviteCreateObject);
		
		this._notify.invite(this.invite.id);
	}
	
	private async _isUserEmailExists(email: string): Promise<boolean>
	{
		return this._customersService.isCustomerEmailExists(email);
	}
	
	private async _createHardcodedCarriers()
	{
		for(const objKey of ['josh', 'tom', 'mike'])
		{
			const objToRegister = this.fakeDataCarriers.registrationInputs[
					objKey
					];
			
			if(
					await this._isCarrierUsernameExists(
							objToRegister.carrier.username
					)
			)
			{
				return;
			}
			
			const createdObject = await this.carrierRouter.register(
					objToRegister
			);
			
			const carrierId = createdObject.id;
			
			this._hardcodedCarrierIds.push(carrierId);
			this._notify.carrier(carrierId);
		}
		
		await this._generageRangeCustomers(15);
		await this._addOrdersToTake();
		await this._addTakenOrders();
	}
	
	private async _addOrdersToTake()
	{
		if(this._hardcodedCarrierIds.length > 0)
		{
			await this._ordersService.addOrdersToTake().toPromise();
		}
	}
	
	private async _addTakenOrders()
	{
		if(this._hardcodedCarrierIds.length > 0)
		{
			await this._ordersService
			          .addTakenOrders(this._hardcodedCarrierIds)
			          .toPromise();
		}
	}
	
	private async _createCarrier(): Promise<Carrier>
	{
		const carrierRegisterInput = this.fakeDataCarriers.registrationInputs.generate();
		
		// If our fake library generate twice the same username we try again
		if(
				await this._isCarrierUsernameExists(
						carrierRegisterInput.carrier.username
				)
		)
		{
			return this._createCarrier();
		}
		
		const carrier: Carrier = await this.carrierRouter.register(
				carrierRegisterInput
		);
		
		this._notify.carrier(carrier.id);
		return carrier;
	}
	
	private async _generate100Carriers(): Promise<Carrier[]>
	{
		const rawCarriers: ICarrierRegistrationInput[] = [];
		const carriersUsernames = [];
		
		for(let i = 1; i <= 100; i += 1)
		{
			const carrierRegisterInput = this.fakeDataCarriers.registrationInputs.generate();
			const carrierUsername = carrierRegisterInput.carrier.username;
			
			if(!carriersUsernames.includes(carrierUsername))
			{
				carriersUsernames.push(carrierUsername);
				rawCarriers.push(carrierRegisterInput);
			}
		}
		
		const carriers: Carrier[] = [];
		
		for(const raw of rawCarriers)
		{
			const carrier: Carrier = await this.carrierRouter.register(raw);
			carriers.push(carrier);
			this._notify.carrier(carrier.id);
		}
		
		return carriers;
	}
	
	private async _generateCustomerEntities()
	{
		let userNumber = 1;
		
		const create = async() =>
		{
			await this._createRandomUserWithOrder();
			
			if(userNumber <= 90)
			{
				userNumber += 1;
				await create();
			}
		};
		
		await create();
	}
	
	private async _isCarrierUsernameExists(username: string)
	{
		const carrier = await this._carriersService
		                          .getCarrierByUsername(username)
		                          .pipe(first())
		                          .toPromise();
		return carrier !== null;
	}
	
	private async _createHardcodedWarehouses()
	{
		const carriers: Carrier[] = await this._generate100Carriers();
		const carrierIds = carriers.map((c) => c.id);
		
		for(const objKey of [
			'pizzaRestaurant',
			'pizzaHit',
			'pizzaTroya',
			'dominexPizza',
		])
		{
			const objToRegister = this.fakeDataWarehouses
					.registrationInputs[objKey];
			
			// We don't want warehouses with the same usernames.
			if(
					this._existingWarehouses.some(
							(w: Warehouse) =>
							{
								const warehouse: Warehouse = objToRegister.warehouse
								return w.username === warehouse.username
							}
					)
			)
			{
				return;
			}
			
			carrierIds.forEach((carrierId) => objToRegister.warehouse.usedCarriersIds.push(carrierId));
			
			const createdObject = await this.warehouseAuthRouter.register(
					objToRegister
			);
			
			this._hardcodedWarehouses.push(createdObject);
			
			this._notify.warehouse(createdObject.id);
		}
	}
	
	private async _createWarehouseWithCarrier(): Promise<Warehouse>
	{
		const warehouseRegisterInput = this.fakeDataWarehouses.registrationInputs.generate();
		
		const carrier: Carrier = await this._createCarrier();
		warehouseRegisterInput.warehouse.usedCarriersIds.push(carrier.id);
		
		const warehouse: Warehouse = await this.warehouseAuthRouter.register(
				warehouseRegisterInput
		);
		
		this._notify.warehouse(warehouse.id);
		return warehouse;
	}
	
	private async _createRandomUser()
	{
		const userRegisterInput = this.fakeDataUsers.getUserRegistrationInput();
		const isUserEmailExists = await this._isUserEmailExists(
				userRegisterInput.user.email
		);
		
		if(isUserEmailExists)
		{
			return this._createRandomUser();
		}
		else
		{
			return await this.customerAuthRouter.register(
					userRegisterInput
			);
		}
	}
	
	private async _createRandomUserWithOrder()
	{
		const customer: Customer = await this._createRandomUser();
		const warehouse: Warehouse = await this._createWarehouseWithCarrier();
		
		const p1: Product = await this._createProduct();
		const p2: Product = await this._createProduct();
		
		await this._createWarehouseProducts(warehouse.id, [p1.id, p2.id]);
		
		await this._createOrder(customer.id, warehouse.id, p1.id);
		await this._createOrder(customer.id, warehouse.id, p2.id);
		
		this._notify.customer(customer.id);
	}
	
	private async _generateProductCategories()
	{
		if(this._productCategories.length === 0)
		{
			this._productCategories = (await this.generateCategories()).map(
					(c) =>
					{
						return {
							_id:        c.id,
							name:       c.name.map((n) =>
							                       {
								                       return {
									                       locale: n.locale,
									                       value:  n.value,
								                       };
							                       }),
							_createdAt: c._createdAt,
							_updatedAt: c._updatedAt,
						};
					}
			);
		}
	}
	
	private async _createProduct(): Promise<Product>
	{
		await this._generateProductCategories();
		
		const getRandomCategory = () =>
		{
			return this._productCategories[
					_.random(this._productCategories.length - 1)
					];
		};
		const productCreateObject = await this.fakeDataProducts.getRandomProduct(
				[getRandomCategory()]
		);
		
		const product: Product = await this.productRouter.create(
				productCreateObject
		);
		
		this._notify.product(product.id);
		
		return product;
	}
	
	private async _generateProducts()
	{
		await this._generateProductCategories();
		
		const filter = (predicate: (val: IProductsCategoryName) => boolean) =>
		{
			return this._productCategories.filter((c) =>
					                                      c.name.some(predicate)
			);
		};
		
		const categoriesPizza = filter(
				(cName) => cName.value.toLowerCase() === 'pizza'
		);
		const categoriesSushi = filter(
				(cName) => cName.value.toLowerCase() === 'sushi'
		);
		const categoriesPasta = filter(
				(cName) => cName.value.toLowerCase() === 'pasta'
		);
		
		await this.createPeperoniAndMushroomPizzaProduct(categoriesPizza);
		await this.createSushiAndCaviarMixProduct(categoriesSushi);
		await this.createSushiMixProduct(categoriesSushi);
		await this.createPastaProduct(categoriesPasta);
		await this.createSushiBoxProduct(categoriesSushi);
		await this.createPeperoniAndTomatoPizzaProduct(categoriesPizza);
	}
	
	private async generateCategories(): Promise<ProductsCategory[]>
	{
		const create: (inputObject: any) => Promise<ProductsCategory> = async(
				inputObject
		) =>
		{
			return this._productsCategoriesService
			           .create(inputObject)
			           .toPromise();
		};
		
		let resultCategories = await this._productsCategoriesService
		                                 .getCategories()
		                                 .pipe(first())
		                                 .toPromise();
		
		if(resultCategories.length === 0)
		{
			const rawCategories = this._fakeDataProductsCategories.getDifferentKindsOfCategories();
			
			const categoryPizza = await create(rawCategories.pizza);
			
			const categorySushi = await create(rawCategories.sushi);
			
			const categoryBurger = await create(rawCategories.burger);
			
			const categoryVegetarian = await create(rawCategories.vegetarian);
			
			const categorySalads = await create(rawCategories.salads);
			
			const categoryDessert = await create(rawCategories.dessert);
			
			const categoryDrinks = await create(rawCategories.drinks);
			
			const categoryMeatDishes = await create(rawCategories.meatDishes);
			
			const categorySoups = await create(rawCategories.soups);
			
			const categoryAlcohol = await create(rawCategories.alcohol);
			
			const categoryFastFood = await create(rawCategories.fastFood);
			
			const categoryPasta = await create(rawCategories.pasta);
			
			resultCategories = [
				categoryPizza,
				categorySushi,
				categoryBurger,
				categoryVegetarian,
				categorySalads,
				categoryDessert,
				categoryDrinks,
				categoryMeatDishes,
				categorySoups,
				categoryAlcohol,
				categoryFastFood,
				categoryPasta,
			];
		}
		
		return resultCategories;
	}
	
	private _listenForExistingWarehouses()
	{
		this._warehousesService
		    .getStores()
		    .pipe(takeUntil(this._ngDestroy$))
		    .subscribe((existingWarehouses) =>
		               {
			               this._existingWarehouses = existingWarehouses;
		               });
	}
	
	private async _createWarehouseProducts(
			warehouseId: string,
			productIds: string[]
	)
	{
		const createObjects: IWarehouseProductCreateObject[] = productIds.map(
				(id: string) => this.fakeDataWarehousesProducts.getCreateObject(id)
		);
		
		await this.warehouseProductsRouter.add(warehouseId, createObjects);
		
		this._notify.warehouseAddProducts(warehouseId);
	}
	
	private async _createWarehouseProductsForHardcodedWarehouses()
	{
		const warehouseProductCreateObjects: IWarehouseProductCreateObject[] = this.fakeDataWarehousesProducts.getHardcodedCreateObject(
				[
					this.peperoniAndMushroomPizzaProduct.id,
					this.peperoniAndTomatoPizzaProduct.id,
					this.sushiAndCaviarMixProduct.id,
					this.sushiMixProduct.id,
					this.pastaProduct.id,
					this.sushiBoxProduct.id,
				]
		);
		
		const moreWarehouseProducts = await this._generateProductsForWarehouseProducts();
		
		for(const w of this._hardcodedWarehouses)
		{
			await this.warehouseProductsRouter.add(
					w.id,
					warehouseProductCreateObjects.concat(moreWarehouseProducts)
			);
		}
	}
	
	private async _generateProductsForWarehouseProducts(
			productsLimit = 150
	): Promise<IWarehouseProductCreateObject[]>
	{
		const warehouseProductCreateObjects: IWarehouseProductCreateObject[] = [];
		
		for(let i = 1; i <= productsLimit; i += 1)
		{
			const product = await this._createProduct();
			
			const warehouseProductCreateObject = this.fakeDataWarehousesProducts.getCreateObject(
					product.id
			);
			
			warehouseProductCreateObjects.push(warehouseProductCreateObject);
		}
		
		return warehouseProductCreateObjects;
	}
	
	private async _generateCurrencies()
	{
		const currencies = await this._currenciesService
		                             .getCurrencies()
		                             .pipe(first())
		                             .toPromise();
		
		if(!currencies.length)
		{
			for(const abbr in CountryAbbreviations)
			{
				const data = getCurrency(abbr);
				if(data)
				{
					try
					{
						const res = await this._currenciesService
						                      .create({
							                              code:  data.code,
							                              name:  data?.name,
							                              sign:  data?.sign ?? data.code,
							                              order: data?.order
						                              })
						                      .pipe(first())
						                      .toPromise();
						
						this.toasterService.pop(
								res.success ? 'success' : 'warning',
								res.message
						);
					} catch(e)
					{
						console.error(`Error on currency create: ${e.message}`);
					}
				}
				
			}
		}
	}
}
