import { NgModule }                            from '@angular/core';
import { TranslateModule }                     from '@ngx-translate/core';
import { IonicModule }                         from '@ionic/angular';
import { CommonModule as AngularCommonModule } from '@angular/common';
import { CommonModule }                        from '@modules/client.common.angular2/common.module';
import { ChatService }                         from '@modules/client.common.angular2/services/chat.service';
import { environment }                         from 'environments/environment';
import { ChatsRoutingModule }                  from './chats-routing.module';
import { ChatsComponent }                      from './chats.component';
import { StorageService }                      from 'services/storage.service';
import { WarehousesService }                   from 'services/warehouses.service';
import { CustomersService }                    from 'services/customers.service';
import { AdminsService }                       from 'services/admins.service';

@NgModule({
	          declarations: [ChatsComponent],
	          imports:      [
		          ChatsRoutingModule,
		          AngularCommonModule,
		          IonicModule,
		          CommonModule.forRoot({
			                               apiUrl: environment.SERVICES_ENDPOINT,
		                               }),
		          TranslateModule.forChild()
	          ],
	          providers:    [
		          StorageService,
		          ChatService,
		          AdminsService,
		          CustomersService,
		          WarehousesService,
	          ]
          })
export class ChatsModule {}
