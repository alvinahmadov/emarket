import _                                             from 'lodash';
import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router }                    from '@angular/router';
import { animate, style, transition, trigger }       from '@angular/animations';
// import { TranslateService }                          from '@ngx-translate/core';
import { Subject }                                   from 'rxjs';
import { takeUntil }                                 from 'rxjs/operators';
import { WarehouseRouter }                           from '@modules/client.common.angular2/routers/warehouse-router.service';
// import { WarehouseOrdersRouter }                     from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import IWarehouse                                    from '@modules/server.common/interfaces/IWarehouse';
// import { OrderRouter }                               from '@modules/client.common.angular2/routers/order-router.service';
import WarehouseProduct                              from '@modules/server.common/entities/WarehouseProduct';

// import { StorageService }                            from 'app/services/storage';

interface RouteParams
{
	warehouseId: string;
}

@Component({
	           selector:    'warehouse-details',
	           styleUrls:   ['./warehouse-details.component.scss'],
	           animations:  [
		           trigger('enterAnimation', [
			           transition(':enter', [
				           style({ opacity: 0 }),
				           animate('200ms', style({ opacity: 1 })),
			           ]),
			           transition(':leave', [
				           style({ opacity: 1 }),
				           animate('200ms', style({ opacity: 0 })),
			           ]),
		           ]),
	           ],
	           templateUrl: './warehouse-details.component.html',
           })
export class WarehouseDetailsComponent implements OnInit, OnDestroy
{
	@HostBinding('@enterAnimation')
	public enterAnimation: any;
	
	public warehouseId: string;
	
	public warehouse: IWarehouse;
	public warehouseProducts: WarehouseProduct[];
	public topProducts: WarehouseProduct[];
	
	private ngUnsubscribe: Subject<void> = new Subject<void>();
	public productsTakeaway: boolean;
	public productsDelivery: boolean;
	
	constructor(
			private readonly route: ActivatedRoute,
			private readonly router: Router,
			private readonly warehouseRouter: WarehouseRouter,
			// private readonly warehouseOrdersRouter: WarehouseOrdersRouter,
			// private readonly orderRouter: OrderRouter,
			// private readonly storage: StorageService,
			// private translateService: TranslateService
	)
	{
		this.topProducts = [];
		this.route.params
		    .pipe(takeUntil(this.ngUnsubscribe))
		    .subscribe((params: RouteParams) => this.onParams(params));
	}
	
	public ngOnInit()
	{
		this.warehouseRouter
		    .get(this.warehouseId, true)
		    .subscribe((warehouse) =>
		               {
			               console.debug(warehouse)
			               const getRating = (warehouseProduct: WarehouseProduct) =>
			               {
				               return _.reduce(
						               warehouseProduct.rating,
						               (prev, curr) => prev + curr.rate,
						               0
				               );
			               }
			
			               this.warehouse = warehouse;
			               this.warehouseId = warehouse.id;
			               this.warehouseProducts = warehouse.products;
			               this.topProducts = _.sortBy( // sort by views
			                                            // filter popular products
			                                            _.filter(warehouse.products,
			                                                     warehouseProduct => (
					                                                     getRating(warehouseProduct) > 0 ||
					                                                     warehouseProduct.comments?.length > 0 ||
					                                                     warehouseProduct.viewsCount > 0
			                                                     )
			                                            ),
			                                            iteratee => iteratee.viewsCount
			               )
			
			               this.productsTakeaway = warehouse.productsTakeaway;
			               this.productsDelivery = warehouse.productsDelivery;
		               });
	}
	
	public ngOnDestroy()
	{
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
	
	private onParams(params: RouteParams): void
	{
		this.warehouseId = params.warehouseId;
	}
}
