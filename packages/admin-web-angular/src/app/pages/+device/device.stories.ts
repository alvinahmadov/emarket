import { InMemoryCache }                    from '@apollo/client/core';
import { CommonModule }                     from '@angular/common';
import { HttpClient, HttpClientModule }     from '@angular/common/http';
import { TranslateHttpLoader }              from '@ngx-translate/http-loader';
import { ToasterModule }                    from 'angular2-toaster';
import { APOLLO_OPTIONS }                   from 'apollo-angular';
import { HttpLink }                         from 'apollo-angular/http';
import { Ng2SmartTableModule }              from 'ng2-smart-table';
import { storiesOf, moduleMetadata }        from '@storybook/angular';
import { withKnobs }                        from '@storybook/addon-knobs';
import { NbSpinnerModule }                  from '@nebular/theme';
import { ThemeModule }                      from '@app/@theme';
import { ConfirmationModalModule }          from '@app/@shared/confirmation-modal/confirmation-modal.module';
import { TranslateStore, TranslateService } from '@ngx-translate/core';
import { RouterModule }                     from '@angular/router';
import { routes, NbAuthModule }             from '@nebular/auth';
import { NotifyService }                    from '@app/@core/services/notify/notify.service';
import { DeviceService }                    from '@app/@core/data/device.service';
import { PipesModule }                      from '@modules/client.common.angular2/pipes/pipes.module';
import { I18nModule }                       from '@app/@core/utils/i18n.module';
import { environment }                      from 'environments/environment';
import { DeviceComponent }                  from './device.component';
import { DeviceMutationComponent }          from './device-mutation/device-mutation.component';

const stories = storiesOf('Device Component', module);

export const createApollo = (httpLink: HttpLink) =>
{
	return {
		link: httpLink.create({ uri: environment.GQL_ENDPOINT }),
		cache: new InMemoryCache(),
	};
}

export function createTranslateLoader(http: HttpClient)
{
	return new TranslateHttpLoader(http, '/i18n/', '.json');
}

stories.addDecorator(withKnobs);
stories.addDecorator(
		moduleMetadata({
			               declarations: [DeviceComponent, DeviceMutationComponent],
			               imports: [
				               CommonModule,
				               ThemeModule,
				               Ng2SmartTableModule,
				               NbSpinnerModule,
				               ConfirmationModalModule,
				               ToasterModule.forRoot(),
				               HttpClientModule,
				               I18nModule,
				               RouterModule.forChild(routes),
				               NbAuthModule,
				               PipesModule,
			               ],
			               providers: [
				               DeviceService,
				               {
					               provide: APOLLO_OPTIONS,
					               useFactory: createApollo,
					               deps: [HttpLink],
				               },
				               TranslateStore,
				               TranslateService,
				               NotifyService,
				               HttpLink,
			               ],
		               })
);

stories.add('Device', () => ({
	component: DeviceComponent,
	props: {},
}));
