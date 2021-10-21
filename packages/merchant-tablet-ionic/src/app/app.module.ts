import { NgModule, APP_INITIALIZER }        from '@angular/core';
import { HttpClient, HttpClientModule }     from '@angular/common/http';
import { RouteReuseStrategy }               from '@angular/router';
import { BrowserAnimationsModule }          from '@angular/platform-browser/animations';
import { ServiceWorkerModule }              from '@angular/service-worker';
import { BrowserModule }                    from '@angular/platform-browser';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader }              from '@ngx-translate/http-loader';
import { HttpLinkModule }                   from 'apollo-angular-link-http';
import { FileUploadModule }                 from 'ng2-file-upload';
import { IonicModule, IonicRouteStrategy }  from '@ionic/angular';
import { IonicStorageModule }               from '@ionic/storage';
import { Device }                           from '@ionic-native/device/ngx';
import { BarcodeScanner }                   from '@ionic-native/barcode-scanner/ngx';
import { CallNumber }                       from '@ionic-native/call-number/ngx';
import { Camera }                           from '@ionic-native/camera/ngx';
import { EmailComposer }                    from '@ionic-native/email-composer/ngx';
import { Globalization }                    from '@ionic-native/globalization/ngx';
import { GoogleAnalytics }                  from '@ionic-native/google-analytics/ngx';
import { InAppBrowser }                     from '@ionic-native/in-app-browser/ngx';
import { Intercom }                         from '@ionic-native/intercom/ngx';
import { Mixpanel }                         from '@ionic-native/mixpanel/ngx';
import { Network }                          from '@ionic-native/network/ngx';
import { ScreenOrientation }                from '@ionic-native/screen-orientation/ngx';
import { SplashScreen }                     from '@ionic-native/splash-screen/ngx';
import { StatusBar }                        from '@ionic-native/status-bar/ngx';
import { CommonModule }                     from '@modules/client.common.angular2/common.module';
import { GoogleMapsLoader }                 from '@modules/client.common.angular2/services/googlemaps-loader';
import { MaintenanceService }               from '@modules/client.common.angular2/services/maintenance.service';
import { ServerConnectionService }          from '@modules/client.common.angular2/services/server-connection.service';
import { environment }                      from 'environments/environment';
import { StorageService }                   from 'services/storage.service';
import { AppComponent }                     from './app.component';
import { AppRoutingModule }                 from './app-routing.module';
import { MaintenanceModuleGuard }           from './+maintenance-info/maintenance-info.module.guard';
import { UserMutationModule }               from '../@shared/user/mutation/user-mutation.module';
import { MenuModule }                       from '../components/menu/menu.module';
import { GraphQLModule }                    from '../graphql/apollo.config';
import { PagesModuleGuard }                 from '../pages/pages.module.guard';

@NgModule({
	          declarations:    [AppComponent],
	          imports:         [
		          BrowserModule,
		          AppRoutingModule,
		          HttpClientModule,
		          BrowserAnimationsModule,
		          MenuModule,
		          HttpLinkModule,
		          IonicModule.forRoot(),
		          IonicStorageModule.forRoot(),
		          GraphQLModule,
		          TranslateModule.forRoot({
			                                  loader: {
				                                  provide:    TranslateLoader,
				                                  useFactory: HttpLoaderFactory,
				                                  deps:       [HttpClient],
			                                  },
		                                  }),
		          CommonModule.forRoot({
			                               apiUrl: environment.SERVICES_ENDPOINT,
		                               }),
		          FileUploadModule,
		          UserMutationModule,
		          ServiceWorkerModule.register('ngsw-worker.js', {
			          enabled: environment.production,
		          }),
	          ],
	          entryComponents: [AppComponent],
	          providers:       [
		          InAppBrowser,
		          SplashScreen,
		          StatusBar,
		          Network,
		          Device,
		          GoogleMapsLoader,
		          {
			          provide:    APP_INITIALIZER,
			          useFactory: googleMapsLoaderFactory,
			          deps:       [GoogleMapsLoader],
			          multi:      true,
		          },
		          ServerConnectionService,
		          {
			          provide:    APP_INITIALIZER,
			          useFactory: serverConnectionFactory,
			          deps:       [ServerConnectionService, Storage],
			          multi:      true,
		          },
		          MaintenanceService,
		          {
			          provide:    APP_INITIALIZER,
			          useFactory: maintenanceFactory,
			          deps:       [MaintenanceService],
			          multi:      true,
		          },
		          // { provide: ErrorHandler, useClass: IonicErrorHandler },
		          { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
		          PagesModuleGuard,
		          MaintenanceModuleGuard,
		          Storage,
		          CallNumber,
		          EmailComposer,
		          Globalization,
		          GoogleAnalytics,
		          Intercom,
		          Mixpanel,
		          ScreenOrientation,
		          Camera,
		          BarcodeScanner,
	          ],
	          bootstrap:       [AppComponent],
          })
export class AppModule
{
	constructor() {}
}

export function HttpLoaderFactory(http: HttpClient)
{
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function googleMapsLoaderFactory(provider: GoogleMapsLoader)
{
	return () => provider.load(environment.GOOGLE_MAPS_API_KEY);
}

export function serverConnectionFactory(
		provider: ServerConnectionService,
		storage: StorageService
)
{
	return () => provider.load(environment.SERVICES_ENDPOINT, storage);
}

export function maintenanceFactory(provider: MaintenanceService)
{
	return () =>
			provider.load(
					environment['SETTINGS_APP_TYPE'],
					environment['SETTINGS_MAINTENANCE_API_URL']
			);
}
