import { injectable } from 'inversify';
import _              from 'lodash';
import Product        from '@modules/server.common/entities/Product';
import Customer       from '@modules/server.common/entities/Customer';

@injectable()
export class FakeOrdersService
{
	private _orderNumber: number;
	private _storeId: string;
	private _carrierId: string;
	private _orderCreatedAt: Date;
	
	getOrderRaw(
			orderNumber: number,
			storeId: string,
			storeCreatedAt: Date,
			carrierId: string,
			customers: Customer[],
			products: Product[]
	)
	{
		this._orderNumber = orderNumber;
		this._storeId = storeId;
		this._carrierId = carrierId;
		this._orderCreatedAt = this.getOrderDate(storeCreatedAt);
		
		switch(true)
		{
			case orderNumber <= 25:
				return this._getOrderJustCreated(customers, products);
			
			case orderNumber <= 50:
				return this._getOrderReadyForProcessing(customers, products);
			
			case orderNumber <= 75:
				return this._getOrderStoreStartProcessing(customers, products);
			
			case orderNumber <= 100:
				return this._getOrderConfirmed(customers, products);
			
			case orderNumber <= 125:
				return this._getOrderStartAllocation(customers, products);
			
			case orderNumber <= 150:
				return this._getOrderPackagingStarted(customers, products);
			
			case orderNumber <= 200:
				return this._getOrderAllocationFails(customers, products);
			
			case orderNumber <= 250:
				return this._getOrderPackagingFails(customers, products);
			
			case orderNumber <= 300:
				return this._getOrderIssuesDuringDelivery(customers, products);
			
			case orderNumber <= 350:
				return this._getOrderClientRefuseOrder(customers, products);
			
			case orderNumber <= 400:
				return this._getOrderAllocationFinished(customers, products);
			
			case orderNumber <= 450:
				return this._getOrderPackagingFinished(customers, products);
			
			case orderNumber <= 475:
				return this._getOrderCarrierSelected(customers, products);
			
			case orderNumber <= 500:
				return this._getOrderCarrierPickup(customers, products);
			
			case orderNumber <= 525:
				return this._getOrderCarrierArriveToCustomer(
						customers,
						products
				);
			
			case orderNumber <= 650:
				return this._getOrderCancelled(customers, products);
			
			case orderNumber <= 1000:
				return this._getOrderDeliveryCompleted(customers, products);
		}
	}
	
	getOrderDate(startDate: Date): Date
	{
		const now = new Date();
		
		const orderYear = _.random(startDate.getFullYear(), now.getFullYear());
		const orderMonth = _.random(11);
		const orderDate = _.random(31);
		const orderHours = _.random(23);
		const orderMinutes = _.random(59);
		
		const orderCreatedAt = new Date(
				orderYear,
				orderMonth,
				orderDate,
				orderHours,
				orderMinutes
		);
		
		if(orderCreatedAt < startDate || orderCreatedAt > now)
		{
			const diff = now.getTime() - startDate.getTime();
			orderCreatedAt.setTime(startDate.getTime() + _.random(diff));
		}
		
		return orderCreatedAt;
	}
	
	getOrderNextTime(date: Date): Date
	{
		const randomMinutes = _.random(1, 30);
		const randomSec = _.random(1, 60);
		const oldDate = new Date(date);
		
		oldDate.setSeconds(randomSec);
		
		return new Date(oldDate.setMinutes(date.getMinutes() + randomMinutes));
	}
	
	getRandomNumberOfProducts(): number
	{
		return this._orderNumber % 7 || 1;
	}
	
	getRandomOrderProductCount(): number
	{
		return this._orderNumber % 3 || 1;
	}
	
	getRandomOrderProductPrice(): number
	{
		return this._orderNumber % 110 || 1;
	}
	
	getRandomProduct(orderNumber: number, products: Product[]): Product
	{
		return products[orderNumber % products.length];
	}
	
	generateRandomOrderProducts(products: Product[])
	{
		const numberOfProducts = this.getRandomNumberOfProducts();
		
		const orderProducts = [];
		
		for(
				let productNumber = 1;
				productNumber <= numberOfProducts;
				productNumber += 1
		)
		{
			const orderPrice = this.getRandomOrderProductPrice();
			
			orderProducts.push({
				                   count:           this.getRandomOrderProductCount(),
				                   product:         this.getRandomProduct(productNumber, products),
				                   isManufacturing: true,
				                   price:           orderPrice,
				                   initialPrice:    orderPrice
			                   });
		}
		
		return orderProducts;
	}
	
	getRandomOrderCustomer(customers: Customer[]): Customer
	{
		return customers[this._orderNumber % customers.length];
	}
	
	private _getOrderDeliveryCompleted(customers: Customer[], products: Product[])
	{
		const startDeliveryTime = this.getOrderNextTime(this._orderCreatedAt);
		const deliveryTime = this.getOrderNextTime(startDeliveryTime);
		
		return {
			isConfirmed:          false,
			isCancelled:          false,
			isPaid:               true,
			deliveryTimeEstimate: 0,
			warehouseStatus:      6,
			carrierStatus:        5,
			isDeleted:            false,
			orderNumber:          this._orderNumber,
			warehouse:            this._storeId,
			carrier:              this._carrierId,
			startDeliveryTime,
			deliveryTime,
			user:                 this.getRandomOrderCustomer(customers),
			products:             this.generateRandomOrderProducts(products),
			_createdAt:           this._orderCreatedAt
		};
	}
	
	private _getOrderCarrierArriveToCustomer(
			customers: Customer[],
			products: Product[]
	)
	{
		return {
			isConfirmed:          false,
			isCancelled:          false,
			isPaid:               false,
			deliveryTimeEstimate: 0,
			warehouseStatus:      6,
			carrierStatus:        4,
			isDeleted:            false,
			orderNumber:          this._orderNumber,
			warehouse:            this._storeId,
			carrier:              this._carrierId,
			user:                 this.getRandomOrderCustomer(customers),
			products:             this.generateRandomOrderProducts(products),
			startDeliveryTime:    this.getOrderNextTime(this._orderCreatedAt),
			_createdAt:           this._orderCreatedAt
		};
	}
	
	private _getOrderCarrierPickup(customers: Customer[], products: Product[])
	{
		return {
			isConfirmed:          false,
			isCancelled:          false,
			isPaid:               false,
			deliveryTimeEstimate: 0,
			warehouseStatus:      6,
			carrierStatus:        2,
			isDeleted:            false,
			orderNumber:          this._orderNumber,
			warehouse:            this._storeId,
			carrier:              this._carrierId,
			startDeliveryTime:    this.getOrderNextTime(this._orderCreatedAt),
			user:                 this.getRandomOrderCustomer(customers),
			products:             this.generateRandomOrderProducts(products),
			_createdAt:           this._orderCreatedAt
		};
	}
	
	private _getOrderCarrierSelected(customers: Customer[], products: Product[])
	{
		return {
			isConfirmed:          false,
			isCancelled:          false,
			isPaid:               false,
			deliveryTimeEstimate: 0,
			warehouseStatus:      6,
			carrierStatus:        1,
			isDeleted:            false,
			orderNumber:          this._orderNumber,
			warehouse:            this._storeId,
			carrier:              this._carrierId,
			user:                 this.getRandomOrderCustomer(customers),
			products:             this.generateRandomOrderProducts(products),
			_createdAt:           this._orderCreatedAt
		};
	}
	
	private _getOrderPackagingFinished(customers: Customer[], products: Product[])
	{
		return {
			isConfirmed:          false,
			isCancelled:          false,
			isPaid:               false,
			deliveryTimeEstimate: 0,
			warehouseStatus:      6,
			carrierStatus:        0,
			isDeleted:            false,
			orderNumber:          this._orderNumber,
			warehouse:            this._storeId,
			user:                 this.getRandomOrderCustomer(customers),
			products:             this.generateRandomOrderProducts(products),
			_createdAt:           this._orderCreatedAt
		};
	}
	
	private _getOrderAllocationFinished(
			customers: Customer[],
			products: Product[]
	)
	{
		return {
			isConfirmed:          false,
			isCancelled:          false,
			isPaid:               false,
			deliveryTimeEstimate: 0,
			warehouseStatus:      4,
			carrierStatus:        0,
			isDeleted:            false,
			orderNumber:          this._orderNumber,
			warehouse:            this._storeId,
			user:                 this.getRandomOrderCustomer(customers),
			products:             this.generateRandomOrderProducts(products),
			_createdAt:           this._orderCreatedAt
		};
	}
	
	private _getOrderClientRefuseOrder(customers: Customer[], products: Product[])
	{
		const startDeliveryTime = this.getOrderNextTime(this._orderCreatedAt);
		const finishedProcessingTime = this.getOrderNextTime(startDeliveryTime);
		
		return {
			isConfirmed:          false,
			isCancelled:          false,
			isPaid:               false,
			deliveryTimeEstimate: 0,
			warehouseStatus:      6,
			carrierStatus:        205,
			isDeleted:            false,
			orderNumber:          this._orderNumber,
			warehouse:            this._storeId,
			carrier:              this._carrierId,
			user:                 this.getRandomOrderCustomer(customers),
			products:             this.generateRandomOrderProducts(products),
			startDeliveryTime,
			finishedProcessingTime,
			_createdAt:           this._orderCreatedAt
		};
	}
	
	private _getOrderIssuesDuringDelivery(
			customers: Customer[],
			products: Product[]
	)
	{
		const startDeliveryTime = this.getOrderNextTime(this._orderCreatedAt);
		const finishedProcessingTime = this.getOrderNextTime(startDeliveryTime);
		
		return {
			isConfirmed:          false,
			isCancelled:          false,
			isPaid:               false,
			deliveryTimeEstimate: 0,
			warehouseStatus:      6,
			carrierStatus:        204,
			isDeleted:            false,
			orderNumber:          this._orderNumber,
			warehouse:            this._storeId,
			carrier:              this._carrierId,
			startDeliveryTime,
			finishedProcessingTime,
			user:                 this.getRandomOrderCustomer(customers),
			products:             this.generateRandomOrderProducts(products),
			_createdAt:           this._orderCreatedAt
		};
	}
	
	private _getOrderPackagingFails(customers: Customer[], products: Product[])
	{
		const finishedProcessingTime = this.getOrderNextTime(
				this._orderCreatedAt
		);
		
		return {
			isConfirmed:          false,
			isCancelled:          false,
			isPaid:               false,
			deliveryTimeEstimate: 0,
			warehouseStatus:      201,
			carrierStatus:        0,
			isDeleted:            false,
			orderNumber:          this._orderNumber,
			warehouse:            this._storeId,
			finishedProcessingTime,
			user:                 this.getRandomOrderCustomer(customers),
			products:             this.generateRandomOrderProducts(products),
			_createdAt:           this._orderCreatedAt
		};
	}
	
	private _getOrderAllocationFails(customers: Customer[], products: Product[])
	{
		const finishedProcessingTime = this.getOrderNextTime(
				this._orderCreatedAt
		);
		
		return {
			isConfirmed:          false,
			isCancelled:          false,
			isPaid:               false,
			deliveryTimeEstimate: 0,
			warehouseStatus:      200,
			carrierStatus:        0,
			isDeleted:            false,
			orderNumber:          this._orderNumber,
			warehouse:            this._storeId,
			finishedProcessingTime,
			user:                 this.getRandomOrderCustomer(customers),
			products:             this.generateRandomOrderProducts(products),
			_createdAt:           this._orderCreatedAt
		};
	}
	
	private _getOrderPackagingStarted(customers: Customer[], products: Product[])
	{
		return {
			isConfirmed:          false,
			isCancelled:          false,
			isPaid:               false,
			deliveryTimeEstimate: 0,
			warehouseStatus:      5,
			carrierStatus:        0,
			isDeleted:            false,
			orderNumber:          this._orderNumber,
			warehouse:            this._storeId,
			user:                 this.getRandomOrderCustomer(customers),
			products:             this.generateRandomOrderProducts(products),
			_createdAt:           this._orderCreatedAt
		};
	}
	
	private _getOrderStartAllocation(customers: Customer[], products: Product[])
	{
		return {
			isConfirmed:          false,
			isCancelled:          false,
			isPaid:               false,
			deliveryTimeEstimate: 0,
			warehouseStatus:      3,
			carrierStatus:        0,
			isDeleted:            false,
			orderNumber:          this._orderNumber,
			warehouse:            this._storeId,
			user:                 this.getRandomOrderCustomer(customers),
			products:             this.generateRandomOrderProducts(products),
			_createdAt:           this._orderCreatedAt
		};
	}
	
	private _getOrderStoreStartProcessing(
			customers: Customer[],
			products: Product[]
	)
	{
		return {
			isConfirmed:          false,
			isCancelled:          false,
			isPaid:               false,
			deliveryTimeEstimate: 0,
			warehouseStatus:      2,
			carrierStatus:        0,
			isDeleted:            false,
			orderNumber:          this._orderNumber,
			warehouse:            this._storeId,
			user:                 this.getRandomOrderCustomer(customers),
			products:             this.generateRandomOrderProducts(products),
			_createdAt:           this._orderCreatedAt
		};
	}
	
	private _getOrderReadyForProcessing(
			customers: Customer[],
			products: Product[]
	)
	{
		return {
			isConfirmed:          false,
			isCancelled:          false,
			isPaid:               false,
			deliveryTimeEstimate: 0,
			warehouseStatus:      1,
			carrierStatus:        0,
			isDeleted:            false,
			orderNumber:          this._orderNumber,
			warehouse:            this._storeId,
			user:                 this.getRandomOrderCustomer(customers),
			products:             this.generateRandomOrderProducts(products),
			_createdAt:           this._orderCreatedAt
		};
	}
	
	private _getOrderCancelled(customers: Customer[], products: Product[])
	{
		const finishedProcessingTime = this.getOrderNextTime(
				this._orderCreatedAt
		);
		
		return {
			isConfirmed:          true,
			isCancelled:          true,
			isPaid:               false,
			deliveryTimeEstimate: 0,
			warehouseStatus:      0,
			carrierStatus:        0,
			isDeleted:            false,
			orderNumber:          1,
			warehouse:            this._storeId,
			user:                 this.getRandomOrderCustomer(customers),
			products:             this.generateRandomOrderProducts(products),
			finishedProcessingTime,
			_createdAt:           this._orderCreatedAt
		};
	}
	
	private _getOrderConfirmed(customers: Customer[], products: Product[])
	{
		return {
			isConfirmed:          true,
			isCancelled:          false,
			isPaid:               false,
			deliveryTimeEstimate: 0,
			warehouseStatus:      0,
			carrierStatus:        0,
			isDeleted:            false,
			orderNumber:          1,
			warehouse:            this._storeId,
			user:                 this.getRandomOrderCustomer(customers),
			products:             this.generateRandomOrderProducts(products),
			_createdAt:           this._orderCreatedAt
		};
	}
	
	private _getOrderJustCreated(customers: Customer[], products: Product[])
	{
		return {
			isConfirmed:          false,
			isCancelled:          false,
			isPaid:               false,
			deliveryTimeEstimate: 0,
			warehouseStatus:      0,
			carrierStatus:        0,
			isDeleted:            false,
			orderNumber:          this._orderNumber,
			warehouse:            this._storeId,
			user:                 this.getRandomOrderCustomer(customers),
			products:             this.generateRandomOrderProducts(products),
			_createdAt:           this._orderCreatedAt
		};
	}
}
