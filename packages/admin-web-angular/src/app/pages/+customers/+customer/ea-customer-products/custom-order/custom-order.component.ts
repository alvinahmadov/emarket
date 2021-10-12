import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute }                      from '@angular/router';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
}                                              from '@angular/forms';
import { NgbActiveModal }                      from '@ng-bootstrap/ng-bootstrap';
import { Subject }                             from 'rxjs';
import { ToasterService }                      from 'angular2-toaster';
import 'rxjs/operators/map';
import Warehouse                               from '@modules/server.common/entities/Warehouse';
import Customer                                from '@modules/server.common/entities/Customer';
import Order                                   from '@modules/server.common/entities/Order';
import { IOrderCreateInput }                   from '@modules/server.common/routers/IWarehouseOrdersRouter';
import { CommonUtils }                         from '@modules/server.common/utilities';
import { WarehouseOrdersRouter }               from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { WarehouseRouter }                     from '@modules/client.common.angular2/routers/warehouse-router.service';
import { WarehousesService }                   from '@app/@core/data/warehouses.service';

@Component({
	           selector:    'ea-custom-order',
	           styleUrls:   ['./custom-order.component.scss'],
	           templateUrl: './custom-order.component.html',
           })
export class CustomOrderComponent implements OnInit, OnDestroy
{
	@Input()
	public warehouseId: Warehouse['id'];
	
	@Input()
	public currentProduct: any;
	
	@Input()
	public customerId: Customer['id'];
	
	readonly form: FormGroup = this.fb.group({
		                                         count: [
			                                         0,
			                                         [
				                                         Validators.required,
				                                         Validators.min(1),
				                                         (control: FormControl) =>
				                                         {
					                                         if(
							                                         this.currentProduct != null &&
							                                         control.value >
							                                         this.currentProduct.warehouseProduct.count
					                                         )
					                                         {
						                                         return { notEnoughAvailable: true };
					                                         }
					
					                                         return null;
				                                         },
			                                         ],
		                                         ],
	                                         });
	private readonly ngDestroy$ = new Subject<void>();
	
	constructor(
			private readonly warehouseRouter: WarehouseRouter,
			private readonly activatedRoute: ActivatedRoute,
			private readonly activeModal: NgbActiveModal,
			private readonly toasterService: ToasterService,
			private readonly warehousesService: WarehousesService,
			private readonly fb: FormBuilder,
			private readonly warehouseOrdersRouter: WarehouseOrdersRouter
	)
	{}
	
	public ngOnInit() {}
	
	public ngOnDestroy()
	{
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
	
	public get count(): AbstractControl
	{
		return this.form.get('count');
	}
	
	public cancel()
	{
		this.activeModal.dismiss('canceled');
	}
	
	public async createOrder()
	{
		try
		{
			const orderCreateInput: IOrderCreateInput = {
				customerId:  this.customerId,
				warehouseId: this.warehouseId,
				products:    [
					{
						count:     this.count.value,
						productId: this.currentProduct.warehouseProduct.product[
								           'id'
								           ],
					},
				],
			};
			
			const order: Order = await this.warehouseOrdersRouter.create(
					orderCreateInput
			);
			
			this.toasterService.pop(
					'success',
					`Order #${CommonUtils.getIdFromTheDate(order)} was created`
			);
			
			this.activeModal.close(order);
		} catch(err)
		{
			this.toasterService.pop(
					'error',
					`Error in creating order: "${err.message}"`
			);
		}
	}
}
