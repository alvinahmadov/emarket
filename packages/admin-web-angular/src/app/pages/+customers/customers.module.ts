import { NgModule }                        from '@angular/core';
import { CommonModule, JsonPipe }          from '@angular/common';
import { RouterModule, Routes }            from '@angular/router';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';
import { TranslateModule }                 from '@ngx-translate/core';
import { Ng2SmartTableModule }             from 'ng2-smart-table';
import { HighlightModule }                 from 'ngx-highlightjs';
import { ToasterModule }                   from 'angular2-toaster';
import { ThemeModule }                     from '@app/@theme';
import { RenderComponentsModule }          from '@app/@shared/render-component/render-components.module';
import { GeoLocationService }              from '@app/@core/data/geo-location.service';
import { UserMutationModule }              from '@app/@shared/user/user-mutation';
import { CustomerTableModule }             from '@app/@shared/render-component/customer-table/customer-table.module';
import { NotifyService }                   from '@app/@core/services/notify/notify.service';
import { BanConfirmModule }                from '@app/@shared/user/ban-confirm';
import { CustomersComponent }              from './customers.component';

const routes: Routes = [
	{
		path:      'list',
		component: CustomersComponent
	},
	{
		path:         'invites',
		loadChildren: () => import('./+invites/invites.module')
				.then((m) => m.InvitesModule)
	},
	{
		path:         'list/:id',
		loadChildren: () => import('./+customer/customer.module')
				.then((m) => m.CustomerModule)
	},
];

@NgModule({
	          imports:      [
		          CommonModule,
		          Ng2SmartTableModule,
		          ThemeModule,
		          ToasterModule.forRoot(),
		          RouterModule.forChild(routes),
		          TranslateModule.forChild(),
		          HighlightModule.forRoot({ theme: 'github' }),
		          RenderComponentsModule,
		          UserMutationModule,
		          CustomerTableModule,
		          NbSpinnerModule,
		          BanConfirmModule,
		          NbButtonModule,
	          ],
	          declarations: [CustomersComponent],
	          providers:    [JsonPipe, GeoLocationService, NotifyService],
          })
export class CustomersModule
{
	public static routes = routes;
}
