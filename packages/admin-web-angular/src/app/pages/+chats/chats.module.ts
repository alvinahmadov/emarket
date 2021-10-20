import { NgModule }                                   from '@angular/core';
import { CommonModule as AngularCommonModule }        from '@angular/common';
import { NbButtonModule, NbCardModule, NbListModule } from '@nebular/theme';
import { TranslateModule }                            from '@ngx-translate/core';
import { ToasterModule }                              from 'angular2-toaster';
import { environment }                                from 'environments/environment';
import { CommonModule }                               from '@modules/client.common.angular2/common.module';
import { ChatService }                                from '@modules/client.common.angular2/services/chat.service';
import { StorageService }                             from '@app/@core/data/store.service';
import { ThemeModule }                                from '@app/@theme';
import { ChatsRoutingModule }                         from '@app/pages/+chats/chats-routing.module';
import { ChatsComponent }                             from '@app/pages/+chats/chats.component';

const commonModConf = { apiUrl: environment.HTTP_SERVICES_ENDPOINT }

@NgModule({
	          declarations: [ChatsComponent],
	          imports:      [
		          ChatsRoutingModule,
		          AngularCommonModule,
		          ThemeModule,
		          CommonModule.forRoot(commonModConf),
		          TranslateModule,
		          ToasterModule,
		          NbCardModule,
		          NbButtonModule,
		          NbListModule
	          ],
	          providers:    [
		          StorageService,
		          ChatService
	          ]
          })
export class ChatsModule {}
