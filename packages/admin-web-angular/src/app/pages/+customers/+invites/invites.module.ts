import { NgModule }                        from '@angular/core';
import { CommonModule, JsonPipe }          from '@angular/common';
import { RouterModule, Routes }            from '@angular/router';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';
import { TranslateModule }                 from '@ngx-translate/core';
import { Ng2SmartTableModule }             from 'ng2-smart-table';
import { ToasterModule }                   from 'angular2-toaster';
import { HighlightModule }                 from 'ngx-highlightjs';
import { ThemeModule }                     from '@app/@theme';
import { InvitesService }                  from '@app/@core/data/invites.service';
import { StorageService }                  from '@app/@core/data/store.service';
import { ConfirmationModalModule }         from '@app/@shared/confirmation-modal/confirmation-modal.module';
import { InvitesComponent }                from './invites.component';
import { InvitesRequestsModule }           from './+invites-requests/invites-requests.module';
import { CountryRenderComponent }          from './country-render/country-render.component';

const routes: Routes = [
	{
		path:      '',
		component: InvitesComponent,
	},
];

@NgModule({
	          imports:         [
		          CommonModule,
		          Ng2SmartTableModule,
		          ThemeModule,
		          ToasterModule.forRoot(),
		          RouterModule.forChild(routes),
		          TranslateModule.forChild(),
		          HighlightModule.forRoot({ theme: 'github' }),
		          InvitesRequestsModule,
		          NbSpinnerModule,
		          ConfirmationModalModule,
		          NbButtonModule,
	          ],
	          declarations:    [InvitesComponent],
	          entryComponents: [CountryRenderComponent],
	          providers:       [JsonPipe, InvitesService, StorageService],
          })
export class InvitesModule
{
	public static routes = routes;
}
