import { NgModule }                    from '@angular/core';
import { CarrierRouter }               from './carrier-router.service';
import { CarrierOrdersRouter }         from './carrier-orders-router.service';
// import { ConversationsRouter }         from './conversation-router.service';
// import { ConversationMessagesRouter }  from './conversation-messages-router.service';
import { CustomerRouter }              from './customer-router.service';
import { CustomerAuthRouter }          from './customer-auth-router.service';
import { CustomerOrdersRouter }        from './customer-orders-router.service';
import { CustomerProductsRouter }      from './customer-products-router.service';
import { DeviceRouter }                from './device-router.service';
import { GeoLocationRouter }           from './geo-location-router.service';
import { GeoLocationOrdersRouter }     from './geo-location-orders-router.service';
import { GeoLocationProductsRouter }   from './geo-location-products-router.service';
import { GeoLocationWarehousesRouter } from './geo-location-warehouses-router.service';
import { InviteRouter }                from './invite-router.service';
import { InviteRequestRouter }         from './invite-request-router.service';
import { OrderRouter }                 from './order-router.service';
import { ProductRouter }               from './product-router.service';
import { WarehouseCarriersRouter }     from './warehouse-carriers-router.service';
import { WarehouseProductsRouter }     from './warehouse-products-router.service';
import { WarehouseRouter }             from './warehouse-router.service';
import { WarehouseAuthRouter }         from './warehouse-auth-router.service';
import { WarehouseOrdersRouter }       from './warehouse-orders-router.service';
import { CommonLibModule }             from '../lib';

@NgModule({
	          imports:      [CommonLibModule],
	          exports:      [],
	          declarations: [],
	          providers:    [
		          CarrierOrdersRouter,
		          CarrierRouter,
		          CustomerAuthRouter,
		          CustomerOrdersRouter,
		          CustomerProductsRouter,
		          CustomerRouter,
		          // ConversationsRouter,
		          // ConversationMessagesRouter,
		          DeviceRouter,
		          GeoLocationOrdersRouter,
		          GeoLocationProductsRouter,
		          GeoLocationWarehousesRouter,
		          GeoLocationRouter,
		          InviteRequestRouter,
		          InviteRouter,
		          OrderRouter,
		          ProductRouter,
		          WarehouseCarriersRouter,
		          WarehouseRouter,
		          WarehouseAuthRouter,
		          WarehouseProductsRouter,
		          WarehouseOrdersRouter
	          ],
          })
export class RoutersModule {}
