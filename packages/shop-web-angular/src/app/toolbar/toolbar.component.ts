import {
	Component,
	NgZone,
	ViewChild,
	AfterViewInit,
	Inject
}                                 from '@angular/core';
import { DOCUMENT }               from '@angular/common';
import { MatDialog }              from '@angular/material/dialog';
import { Router }                 from '@angular/router';
import { first }                  from 'rxjs/operators';
import { getLanguage }            from '@modules/server.common/data/languages';
import DeliveryType               from '@modules/server.common/enums/DeliveryType';
import Country                    from '@modules/server.common/enums/Country';
import GeoLocation                from '@modules/server.common/entities/GeoLocation';
import { CustomerRouter }         from '@modules/client.common.angular2/routers/customer-router.service';
import { MatSearchComponent }     from '@modules/material-extensions/search/mat-search.component';
import { StorageService }         from 'app/services/storage';
import { GeoLocationService }     from 'app/services/geo-location';
import { LocationPopupComponent } from 'app/shared/location-popup/location-popup.component';
import { environment }            from 'environments/environment';
import { styleVariables }         from 'styles/variables';
import { TranslateService }       from '@ngx-translate/core';
import { SidenavService }         from 'app/sidenav/sidenav.service';

@Component({
	           selector:    'toolbar',
	           styleUrls:   ['./toolbar.component.scss'],
	           templateUrl: './toolbar.component.html',
           })
export class ToolbarComponent implements AfterViewInit
{
	styleVariables: typeof styleVariables = styleVariables;
	logo: string = environment.AUTH_LOGO;
	isDeliveryRequired: boolean;
	
	public selectedLang: string;
	public defaultLanguage = '';
	public dir: 'ltr' | 'rtl';
	
	@ViewChild('matSearch')
	matSearch: MatSearchComponent;
	
	private initializedAddress: string;
	
	constructor(
			private readonly sidenavService: SidenavService,
			private readonly storage: StorageService,
			private readonly router: Router,
			private readonly ngZone: NgZone,
			private readonly customerRouter: CustomerRouter,
			private readonly geoLocationService: GeoLocationService,
			public translateService: TranslateService,
			@Inject(DOCUMENT)
			public document: Document,
			private dialog: MatDialog
	)
	{
		this.isDeliveryRequired =
				this.storage.deliveryType === DeliveryType.Delivery;
		if(this.storage.languageCode)
		{
			this.selectedLang = this.storage.languageCode;
			this.translateService.use(this.selectedLang);
		}
		this.loadAddress();
	}
	
	ngAfterViewInit(): void
	{
		this.initGoogleAutocompleteApi();
	}
	
	async toggleGetProductsType()
	{
		this.isDeliveryRequired = !this.isDeliveryRequired;
		
		this.storage.deliveryType = this.isDeliveryRequired
		                            ? DeliveryType.Delivery
		                            : DeliveryType.Takeaway;
		
		await this.reload();
	}
	
	public tryFindNewAddress(address: string)
	{
		const geocoder = new google.maps.Geocoder();
		
		geocoder.geocode(
				{
					address,
				},
				(results, status) =>
				{
					if(status === google.maps.GeocoderStatus.OK)
					{
						const place: google.maps.GeocoderResult = results[0];
						
						this.applyNewPlaceOnTheMap(place);
					}
				}
		);
	}
	
	public async loadAddress(findNew: boolean = false)
	{
		let geoLocationForProducts: GeoLocation;
		
		const isProductionEnv = environment.production;
		
		if(this.storage.userId && !findNew && isProductionEnv)
		{
			const user = await this.customerRouter
			                       .get(this.storage.userId)
			                       .pipe(first())
			                       .toPromise();
			
			geoLocationForProducts = user.geoLocation;
		}
		else
		{
			try
			{
				geoLocationForProducts = await this.geoLocationService.getCurrentGeoLocation();
			} catch(error)
			{
				console.error(error);
			}
		}
		
		this.tryFindNewCoordinates(geoLocationForProducts, findNew);
	}
	
	public switchLanguage(language: string)
	{
		this.translateService.use(language);
		this.storage.languageCode = language;
		
		const langAbbreviation = language.substr(0, 2);
		
		if(language.startsWith('he') || language.startsWith('ar'))
		{
			this.dir = 'rtl';
		}
		else
		{
			this.dir = 'ltr';
		}
		this.document.documentElement.dir = this.dir;
		this.document.documentElement.lang = langAbbreviation;
	}
	
	public translateLanguage(languageCode: string): string
	{
		return getLanguage(languageCode);
	}
	
	private tryFindNewCoordinates(
			geoLocation: GeoLocation,
			findNew: boolean = false
	)
	{
		const lat = geoLocation.loc.coordinates[1];
		const lng = geoLocation.loc.coordinates[0];
		
		const geocoder = new google.maps.Geocoder();
		geocoder.geocode(
				{
					location: { lng: lng, lat: lat },
				},
				async(results, status) =>
				{
					if(status === google.maps.GeocoderStatus.OK)
					{
						const formattedAddress = results[0].formatted_address;
						const place: google.maps.GeocoderResult = results[0];
						
						const userId = this.storage.userId;
						
						if(findNew && userId)
						{
							const addressComponents = place.address_components;
							const city = addressComponents.find((a) =>
									                                    a.types.includes('locality')
							).long_name;
							
							const streetAddress = addressComponents.find(
									(a) =>
											a.types.includes('route') ||
											a.types.includes('intersection')
							).long_name;
							
							const house = addressComponents.find((a) =>
									                                     a.types.includes('street_number')
							).long_name;
							
							const country = addressComponents.find((a) =>
									                                       a.types.includes('country')
							).short_name;
							
							await this.updateUser(userId, {
								countryId: Country[country],
								city,
								streetAddress,
								house,
								loc:       {
									type:        'Point',
									coordinates: [lng, lat],
								},
							} as GeoLocation);
							
							this.reload();
						}
						
						this.applyFormattedAddress(formattedAddress);
					}
				}
		);
	}
	
	private applyFormattedAddress(address: string)
	{
		if(this.matSearch.input)
		{
			this.initializedAddress = address;
			this.matSearch.input.nativeElement.value = address;
		}
	}
	
	private initGoogleAutocompleteApi()
	{
		if(this.matSearch.input)
		{
			new google.maps.places.Autocomplete(
					this.matSearch.input.nativeElement
			);
		}
	}
	
	private applyNewPlaceOnTheMap(
			place: google.maps.places.PlaceResult | google.maps.GeocoderResult
	)
	{
		if(place.geometry === undefined || place.geometry === null)
		{
			// this._popInvalidAddressMessage();
			return;
		}
		const neededAddressTypes = [
			'country',
			'locality',
			'route',
			'street_number',
		];
		const existedTypes = place.address_components.map((ac) => ac.types[0]);
		
		for(const type of neededAddressTypes)
		{
			if(!existedTypes.includes(type))
			{
				this.openLocationForm(place);
				return;
			}
		}
		
		if(
				this.initializedAddress &&
				this.initializedAddress !== place.formatted_address
		)
		{
			this.tryFindNewCoordinates(
					{
						loc: {
							type:        'Point',
							coordinates: [
								place.geometry.location.lng(),
								place.geometry.location.lat(),
							],
						},
					} as GeoLocation,
					true
			);
		}
		this.initializedAddress = place.formatted_address;
	}
	
	private async openLocationForm(place = null)
	{
		const locationPopup = await this.dialog.open(LocationPopupComponent, {
			width: '900px',
			data:  {
				place,
			},
		});
		
		const res = await locationPopup
				.beforeClosed()
				.pipe(first())
				.toPromise();
		if(res !== '')
		{
			this.matSearch.input.nativeElement.value = res;
		}
		else if(this.initializedAddress)
		{
			this.matSearch.input.nativeElement.value = this.initializedAddress;
		}
	}
	
	private async reload()
	{
		await this.router.navigateByUrl('reload', {
			skipLocationChange: true,
		});
		await this.router.navigateByUrl('/products');
	}
	
	private async updateUser(userId, geoLocation: GeoLocation)
	{
		if(userId)
		{
			const customer = await this.customerRouter.get(userId).toPromise();
			await this.customerRouter.updateCustomer(userId, {
				username: customer.username,
				email:    customer.email,
				geoLocation,
			});
		}
	}
}
