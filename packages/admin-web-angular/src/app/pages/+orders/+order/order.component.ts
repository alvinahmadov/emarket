import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute }       from '@angular/router';
import { Observable, Subject }  from 'rxjs';
import { takeUntil }            from 'rxjs/operators';
import { TranslateService }     from '@ngx-translate/core';
import OrderCarrierStatus       from '@modules/server.common/enums/OrderCarrierStatus';
import Order                    from '@modules/server.common/entities/Order';
import Warehouse                from '@modules/server.common/entities/Warehouse';
import Customer                 from '@modules/server.common/entities/Customer';
import Carrier                  from '@modules/server.common/entities/Carrier';
import OrderProduct             from '@modules/server.common/entities/OrderProduct';
import GeoLocation              from '@modules/server.common/entities/GeoLocation';
import { CommonUtils }          from '@modules/server.common/utilities';
import { OrderRouter }          from '@modules/client.common.angular2/routers/order-router.service';

const service = new google.maps.DistanceMatrixService();

@Component({
	           selector:    'ea-order',
	           styleUrls:   ['./order.component.scss'],
	           templateUrl: './order.component.html'
           })
export class OrderComponent implements OnDestroy
{
	public orderId: string;
	public distance: string;
	public order$: Observable<Order>;
	
	public PREFIX: string = 'ORDER_VIEW.ORDER_SIDEBAR.';
	public WAREHOUSE_TITLE: string = 'WAREHOUSE';
	public CUSTOMER_TITLE: string = 'CUSTOMER';
	public CARRIER_TITLE: string = 'CARRIER';
	
	private ngDestroy$ = new Subject();
	
	constructor(
			private readonly _router: ActivatedRoute,
			private readonly orderRouter: OrderRouter,
			private readonly translateService: TranslateService
	)
	{
		const id = this._router.snapshot.params.id;
		
		this.order$ = this.orderRouter
		                  .get(id, { populateWarehouse: true, populateCarrier: true })
		                  .pipe(takeUntil(this.ngDestroy$));
	}
	
	public ngOnDestroy(): void
	{
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
	
	public get titleWarehouse(): string
	{
		const titleForTr = this.PREFIX + this.WAREHOUSE_TITLE;
		return this._translate(titleForTr);
	}
	
	public get titleCustomer(): string
	{
		const titleForTr = this.PREFIX + this.CUSTOMER_TITLE;
		return this._translate(titleForTr);
	}
	
	public get titleCarrier(): string
	{
		const titleForTr = this.PREFIX + this.CARRIER_TITLE;
		return this._translate(titleForTr);
	}
	
	public getTotalPrice(order): number
	{
		if(order && order.products.length > 0)
		{
			return order.products
			            .map((p: OrderProduct) => p.price * p.count)
			            .reduce((a, b) => a + b, 0);
		}
		return 0;
	}
	
	public getWarehouseContactDetails(warehouse: Warehouse): string[]
	{
		const details: string[] = [];
		if(warehouse)
		{
			details.push(warehouse.name);
			details.push(warehouse.contactPhone);
			details.push(warehouse.contactEmail);
		}
		if(warehouse.geoLocation)
		{
			details.push(OrderComponent.getFullAddress(warehouse.geoLocation));
		}
		return details.filter((d) => d);
	}
	
	public getCustomerContactDetails(customer: Customer): string[]
	{
		const details: string[] = [];
		if(customer)
		{
			details.push(customer.fullName ?? customer.username);
			details.push(customer.phone);
			details.push(customer.email);
		}
		if(customer.geoLocation)
		{
			details.push(customer.fullAddress);
			
			customer.geoLocation.notes =
					customer.geoLocation.notes === undefined
					? ''
					: customer.geoLocation.notes;
			
			details.push(`Notes: ${customer.geoLocation.notes}`);
		}
		return details.filter((d) => d);
	}
	
	public getCarrierContactDetails(carrier: Carrier): string[]
	{
		const details: string[] = [];
		if(carrier)
		{
			details.push(
					carrier.firstName
					? carrier.firstName + ' ' + carrier.lastName
					: carrier.username
			);
			details.push(carrier.phone);
		}
		if(carrier.geoLocation)
		{
			details.push(OrderComponent.getFullAddress(carrier.geoLocation));
		}
		return details.filter((d) => d);
	}
	
	public getOrderName(order: Order): string
	{
		if(order)
			return CommonUtils.getIdFromTheDate(order);
		return ''
	}
	
	public isCarrierCurrent(order: Order): boolean
	{
		return (
				order.carrierStatus >= OrderCarrierStatus.CarrierPickedUpOrder &&
				!order['isCompleted']
		);
	}
	
	public getDistance(geoLocation1: GeoLocation, geoLocation2: GeoLocation): string
	{
		if(!this.distance && geoLocation1 && geoLocation2)
		{
			this.distance = '0';
			service.getDistanceMatrix(
					{
						origins:       [
							new google.maps.LatLng(
									geoLocation1.coordinates.lat,
									geoLocation1.coordinates.lng
							),
						],
						destinations:  [
							new google.maps.LatLng(
									geoLocation2.coordinates.lat,
									geoLocation2.coordinates.lng
							),
						],
						travelMode:    google.maps.TravelMode.DRIVING,
						unitSystem:    google.maps.UnitSystem.METRIC,
						avoidHighways: false,
						avoidTolls:    false,
					},
					(response, status) =>
					{
						if(status === google.maps.DistanceMatrixStatus.OK)
						{
							this.distance =
									response.rows[0].elements[0].distance['text'];
						}
					}
			);
		}
		
		return this.distance;
	}
	
	private static getFullAddress(geoLocation: GeoLocation): string
	{
		return (
				`${geoLocation.city}, ${geoLocation.streetAddress} ` +
				`${geoLocation.house}`
		);
	}
	
	private _translate(key: string): string
	{
		let translationResult = '';
		
		this.translateService.get(key).subscribe((res) =>
		                                         {
			                                         translationResult = res;
		                                         });
		
		return translationResult;
	}
}
