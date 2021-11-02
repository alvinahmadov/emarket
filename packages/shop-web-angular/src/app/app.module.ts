import '../styles/styles.scss';
import { APP_INITIALIZER, NgModule }            from '@angular/core';
import { HttpClient, HttpClientModule }         from '@angular/common/http';
import { FormsModule }                          from '@angular/forms';
import { ExtendedModule, FlexLayoutModule }     from '@angular/flex-layout';
import { PreloadAllModules, RouterModule }      from '@angular/router';
import { BrowserModule }                        from '@angular/platform-browser';
import { MatButtonModule }                      from '@angular/material/button';
import { MatButtonToggleModule }                from '@angular/material/button-toggle';
import { MatCardModule }                        from '@angular/material/card';
import { MatCheckboxModule }                    from '@angular/material/checkbox';
import { MatFormFieldModule }                   from '@angular/material/form-field';
import { MatIconModule }                        from '@angular/material/icon';
import { MatInputModule }                       from '@angular/material/input';
import { MatListModule }                        from '@angular/material/list';
import { MatSelectModule }                      from '@angular/material/select';
import { MatSidenavModule }                     from '@angular/material/sidenav';
import { MatSlideToggleModule }                 from '@angular/material/slide-toggle';
import { MatToolbarModule }                     from '@angular/material/toolbar';
import { platformBrowserDynamic }               from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule }              from '@angular/platform-browser/animations';
import { HttpLinkModule }                       from 'apollo-angular-link-http';
import { InfiniteScrollModule }                 from 'ngx-infinite-scroll';
import { TranslateLoader, TranslateModule }     from '@ngx-translate/core';
import { TranslateHttpLoader }                  from '@ngx-translate/http-loader';
import { environment }                          from 'environments/environment';
import { CommonModule }                         from '@modules/client.common.angular2/common.module';
import { GoogleMapsLoader }                     from '@modules/client.common.angular2/services/googlemaps-loader';
import { MaintenanceService }                   from '@modules/client.common.angular2/services/maintenance.service';
import { ServerConnectionService }              from '@modules/client.common.angular2/services/server-connection.service';
import { ROUTES }                               from './app.routes';
import { AppComponent }                         from './app.component';
import { APP_RESOLVER_PROVIDERS }               from './app.resolver';
import { AppState }                             from './app.service';
import { AppModuleGuard }                       from './app.module.guard';
import { ToolbarComponent }                     from './toolbar/toolbar.component';
import { NoContentComponent }                   from './no-content';
import { SidenavService }                       from './sidenav/sidenav.service';
import { SidenavContentComponent }              from './sidenav/sidenav-content.component';
import { GeoLocationService }                   from './services/geo-location';
import { ServerSettings }                       from './services/server-settings';
import { StorageService }                       from './services/storage';
import { AdminsService }                        from './services/admins.service';
import { CustomersService }                     from './services/customer.service';
import { LocationPopupModalModule }             from './shared/location-popup/location-popup.module';
import { AuthGuard }                            from './authentication/auth.guard';
import { AuthModuleGuard }                      from './+auth/auth.module.guard';
import { ProductsModuleGuard }                  from './+products/products.module.guard';
import { WarehousesModuleGuard }                from './+warehouses/warehouses.module.guard';
import { MaintenanceModuleGuard }               from './+maintenance-info/maintenance-info.module.guard';
import { GraphQLModule }                        from '../graphql/apollo.config';
import { IconsModule }                          from '../modules/icons';
import { MatBoldInputModule, MatSearchModule, } from '../modules/material-extensions';

export function HttpLoaderWebFactory(http: HttpClient)
{
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function serverSettingsFactory(provider: ServerSettings)
{
	return () => provider.load();
}

export function maintenanceFactory(provider: MaintenanceService)
{
	return () =>
			provider.load(
					environment.SETTINGS_APP_TYPE,
					environment.SETTINGS_MAINTENANCE_API_URL
			);
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
	return () => provider.load(environment.HTTP_SERVICES_ENDPOINT, storage);
}

const APP_PROVIDERS = [
	ServerConnectionService,
	{
		provide:    APP_INITIALIZER,
		useFactory: serverConnectionFactory,
		deps:       [ServerConnectionService, StorageService],
		multi:      true,
	},
	MaintenanceService,
	{
		provide:    APP_INITIALIZER,
		useFactory: maintenanceFactory,
		deps:       [MaintenanceService],
		multi:      true,
	},
	GoogleMapsLoader,
	{
		provide:    APP_INITIALIZER,
		useFactory: googleMapsLoaderFactory,
		deps:       [GoogleMapsLoader],
		multi:      true,
	},
	...APP_RESOLVER_PROVIDERS,
	AppState,
	SidenavService,
	AdminsService,
	CustomersService,
	ServerSettings,
	InfiniteScrollModule,
	{
		provide:    APP_INITIALIZER,
		useFactory: serverSettingsFactory,
		deps:       [ServerSettings],
		multi:      true,
	},
];

@NgModule({
	          bootstrap:    [AppComponent],
	          declarations: [
		          AppComponent,
		          ToolbarComponent,
		          NoContentComponent,
		          SidenavContentComponent,
	          ],
	          imports:      [
		          BrowserModule,
		          HttpClientModule,
		          GraphQLModule,
		          TranslateModule.forRoot({
			                                  loader: {
				                                  provide:    TranslateLoader,
				                                  useFactory: HttpLoaderWebFactory,
				                                  deps:       [HttpClient],
			                                  },
		                                  }),
		          BrowserAnimationsModule,
		          FormsModule,
		          HttpLinkModule,
		          RouterModule.forRoot(ROUTES, {
			          useHash:            Boolean(history.pushState) === false,
			          preloadingStrategy: PreloadAllModules,
		          }),
		          MatIconModule,
		          MatButtonModule,
		          MatSidenavModule,
		          MatToolbarModule,
		          MatCheckboxModule,
		          MatFormFieldModule,
		          MatListModule,
		          MatCardModule,
		
		          MatBoldInputModule,
		          MatSearchModule,
		          MatSlideToggleModule,
		          MatButtonToggleModule,
		          IconsModule,
		          CommonModule.forRoot({
			                               apiUrl: environment.HTTP_SERVICES_ENDPOINT,
		                               }),
		          LocationPopupModalModule,
		          MatSelectModule,
		          MatInputModule,
		          ExtendedModule,
		          FlexLayoutModule,
	          ],
	          providers:    [
		          environment.ENV_PROVIDERS,
		          APP_PROVIDERS,
		          AuthModuleGuard,
		          ProductsModuleGuard,
		          WarehousesModuleGuard,
		          AppModuleGuard,
		          MaintenanceModuleGuard,
		          GeoLocationService,
		          AuthGuard,
	          ]
          })
export class AppModule {}

platformBrowserDynamic()
		.bootstrapModule(AppModule)
		.catch(err => console.error(err));
