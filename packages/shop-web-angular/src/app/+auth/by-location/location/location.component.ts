import {
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnInit,
	AfterViewInit,
	OnChanges,
	OnDestroy,
	Output,
	ViewChild
}                                               from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ReplaySubject, Subject }               from 'rxjs';
import { takeUntil }                            from 'rxjs/operators';
import _                                        from 'lodash';
import { DeviceDetectorService, DeviceInfo }    from 'ngx-device-detector';
import uuid                                     from 'uuid';
import {
	countriesIdsToNamesArrayFn,
	getCountryName,
	TCountryData
}                                               from '@modules/server.common/data/countries';
import { ILocation }                            from '@modules/server.common/interfaces/IGeoLocation';
import { ICustomerCreateObject }                from '@modules/server.common/interfaces/ICustomer';
import Country                                  from '@modules/server.common/enums/Country';
import InviteRequest                            from '@modules/server.common/entities/InviteRequest';
import { GeoLocationRouter }                    from '@modules/client.common.angular2/routers/geo-location-router.service';
import { InviteRequestRouter }                  from '@modules/client.common.angular2/routers/invite-request-router.service';
import { StorageService }                       from 'app/services/storage';
import { PasswordValidator }                    from 'app/shared/validators/password-validator';
import { environment }                          from 'environments/environment';

const defaultLng = environment.DEFAULT_LONGITUDE || 0;
const defaultLat = environment.DEFAULT_LATITUDE || 0;

const isProd = environment.production;

const defaults = {
	username:      !isProd ? "customer" : "",
	email:         !isProd ? "customer@emarket.com" : "",
	password:      !isProd ? "123456" : "",
	house:         !isProd ? "12" : "",
	apartament:    !isProd ? "12" : "",
	countryId:     !isProd ? Country.RU : "",
	city:          !isProd ? "Москва" : "",
	streetAddress: !isProd ? "Фрунзе" : "",
	postCode:      !isProd ? "1000" : "",
	isApartment:   !isProd ? "checked" : ""
}

@Component({
	           selector:    'es-location-form',
	           styleUrls:   ['./location.component.scss'],
	           templateUrl: './location.component.html',
           })
export class LocationFormComponent
		implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
	public readonly countries: TCountryData[]
	@Input()
	public coordinates: ILocation;
	@Input()
	public place: google.maps.places.PlaceResult;
	
	@ViewChild('autocomplete')
	public searchElement: ElementRef;
	
	@Output()
	public mapCoordinatesEmitter = new EventEmitter<google.maps.LatLng | google.maps.LatLngLiteral>();
	
	@Output()
	public continue = new EventEmitter<boolean>();
	
	@Output()
	public mapGeometryEmitter = new EventEmitter<google.maps.places.PlaceGeometry | google.maps.GeocoderGeometry>();
	
	public formControl = this.fb.group(
			{
				username:      [defaults.username, Validators.required],
				email:         [defaults.email, Validators.required],
				password:      [
					defaults.password,
					//TODO: Uncomment below validators in production mode
					Validators.compose(
							[
								// 1. Password Field is Required
								Validators.required,
								// 2. Has a minimum length of characters
								Validators.minLength(5),
								// 3. check whether the entered password has a number
								PasswordValidator.patternValidator(/\d/, { hasNumber: true }),
								// 4. check whether the entered password has upper case letter
								// PasswordValidator.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
								// 5. check whether the entered password has a lower-case letter
								// PasswordValidator.patternValidator(/[a-z]/, { hasSmallCase: true }),
							])
				],
				house:         [defaults.house, Validators.required],
				apartament:    [defaults.apartament],
				countryId:     [defaults.countryId, Validators.required],
				city:          [defaults.city, Validators.required],
				streetAddress: [defaults.streetAddress, Validators.required],
				isApartment:   [defaults.isApartment],
			}
	);
	
	public countryControl: FormControl = new FormControl();
	public countryFilterCtrl: FormControl = new FormControl();
	public filteredCountries: ReplaySubject<TCountryData[]> = new ReplaySubject<TCountryData[]>(1);
	
	public streetAddressControl = this.formControl.get('streetAddress');
	public cityControl = this.formControl.get('city');
	public readonly usernameControl = this.formControl.get('username');
	public readonly emailControl = this.formControl.get('email');
	public readonly passwordControl = this.formControl.get('password');
	public readonly houseControl = this.formControl.get('house');
	public readonly apartamentControl = this.formControl.get('apartament');
	public readonly countryIdControl = this.formControl.get('countryId');
	public readonly isApartmentControl = this.formControl.get('isApartment');
	
	public statusForm: boolean;
	public showAutocompleteSearch: boolean = true;
	private _ngDestroy$ = new Subject<void>();
	private lat: number;
	private lng: number;
	private lastUsedAddressText: string;
	private deviceInfo: DeviceInfo;
	private readonly langCode: string;
	
	constructor(
			private readonly fb: FormBuilder,
			private geoLocationRouter: GeoLocationRouter,
			private inviteRequestRouter: InviteRequestRouter,
			private deviceService: DeviceDetectorService,
			private storageService: StorageService
	)
	{
		this.langCode = this.storageService.languageCode ?? 'ru-RU';
		this.countries = countriesIdsToNamesArrayFn(this.langCode);
	}
	
	public get isApartmentValid()
	{
		return (this.isApartmentControl && !this.isApartmentControl.value) ||
		       this.apartamentControl.value;
	}
	
	public get username(): string
	{
		return this.usernameControl.value?.toString();
	}
	
	public get password(): string
	{
		return this.passwordControl.value?.toString();
	}
	
	public get email(): string
	{
		return this.emailControl.value?.toString();
	}
	
	public get countryId(): Country
	{
		return this.countryIdControl.value as Country;
	}
	
	protected set country(value: any)
	{
		this.countryControl.setValue(value);
	}
	
	public get house(): string
	{
		return this.houseControl.value?.toString();
	}
	
	public get streetAddress(): string
	{
		return this.streetAddressControl.value?.toString();
	}
	
	public get city(): string
	{
		return this.cityControl.value?.toString();
	}
	
	public get apartament(): string
	{
		return this.apartamentControl.value?.toString();
	}
	
	public get isApartment(): boolean
	{
		return !!this.isApartmentControl.value;
	}
	
	public ngOnInit(): void
	{
		this.onChanges();
		this.deviceInfo = this.deviceService.getDeviceInfo();
		
		// set initial selection
		this.country = this.countries.find(country => country.id === Country.RU) ?? this.countries[0];
		
		// load the initial bank list
		this.filteredCountries.next(this.countries.slice());
		
		// listen for search field value changes
		this.countryFilterCtrl
		    .valueChanges
		    .pipe(takeUntil(this._ngDestroy$))
		    .subscribe(() => this.filterCountries());
		
	}
	
	public ngAfterViewInit(): void
	{
		this.initGoogleAutocompleteApi();
	}
	
	public ngOnChanges(): void
	{
		if(this.place)
		{
			this.applyNewPlaceOnTheMap(this.place);
		}
		else if(this.coordinates)
		{
			this.onCoordinatesChanged();
		}
	}
	
	public getCreateUserInfo(): ICustomerCreateObject
	{
		return {
			username:    this.usernameControl.value,
			email:       this.emailControl.value,
			geoLocation: {
				loc:           this.coordinates
				               ? LocationFormComponent.getLocObj(
								Array.from(this.coordinates.coordinates).reverse()
						)
				               : LocationFormComponent.getLocObj([defaultLng, defaultLat]),
				countryId:     this.countryIdControl.value as Country,
				city:          this.cityControl.value,
				streetAddress: this.streetAddressControl.value,
				house:         this.houseControl.value.toString(),
			},
		};
	}
	
	public onAddressChanges()
	{
		if(this.showAutocompleteSearch)
		{
			this.tryFindNewAddress();
		}
	}
	
	public onCoordinatesChanged()
	{
		if(this.showAutocompleteSearch)
		{
			this.tryFindNewCoordinates();
		}
	}
	
	public async createInviteRequest(): Promise<InviteRequest>
	{
		return this.inviteRequestRouter.create(
				{
					geoLocation: {
						loc:           this.coordinates
						               ? LocationFormComponent.getLocObj(
										Array
												.from(this.coordinates.coordinates)
												.reverse()
								)
						               : LocationFormComponent.getLocObj([defaultLng, defaultLat]),
						countryId:     this.countryId,
						city:          this.city,
						streetAddress: this.streetAddress,
						house:         this.house
					},
					apartment:   this.apartament ?? '0',
					// TODO: Find best way to generate device id from android, ios and/or browser
					deviceId: this.deviceInfo.device ?? uuid(),
				}
		);
	}
	
	public ngOnDestroy()
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	private static getLocObj(coordinates): ILocation
	{
		return {
			type: 'Point',
			coordinates,
		};
	}
	
	private onChanges()
	{
		this.formControl
		    .statusChanges
		    .pipe(takeUntil(this._ngDestroy$))
		    .subscribe(() => this.statusForm = this.formControl.valid === true && this.isApartmentValid);
	}
	
	private emitCoordinates(
			location: google.maps.LatLng |
			          google.maps.LatLngLiteral
	)
	{
		this.mapCoordinatesEmitter.emit(location);
	}
	
	private emitGeometry(
			geometry:
					google.maps.places.PlaceGeometry |
					google.maps.GeocoderGeometry
	)
	{
		this.mapGeometryEmitter.emit(geometry);
	}
	
	private applyNewPlaceOnTheMap(
			place: google.maps.places.PlaceResult |
			       google.maps.GeocoderResult,
			useGeometryLatLng: boolean = true
	)
	{
		if(place.geometry === undefined || place.geometry === null)
		{
			// this._popInvalidAddressMessage();
			return;
		}
		
		if(useGeometryLatLng)
		{
			const loc = place.geometry.location;
			this.coordinates.coordinates = [loc.lat(), loc.lng()];
		}
		
		// If the place has a geometry, then present it on a map.
		this.emitGeometry(place.geometry);
		
		this.emitCoordinates(
				new google.maps.LatLng(
						this.coordinates.coordinates[0],
						this.coordinates.coordinates[1]
				)
		);
		
		this.gatherAddressInformation(place);
	}
	
	private tryFindNewAddress()
	{
		const house = this.houseControl.value;
		const streetAddress = this.streetAddressControl.value;
		const city = this.cityControl.value;
		// const postCode = this.postCode.value;
		// For external services it must be in english
		const countryName = getCountryName('en-US', +this.countryIdControl.value);
		
		if(
				_.isEmpty(streetAddress) ||
				_.isEmpty(house) ||
				_.isEmpty(city) ||
				_.isEmpty(countryName)
		)
		{
			return;
		}
		
		const newAddress = `${house}${streetAddress}${city}${countryName}`;
		if(newAddress !== this.lastUsedAddressText)
		{
			this.lastUsedAddressText = newAddress;
			
			const geocoder = new google.maps.Geocoder();
			
			geocoder.geocode(
					{
						address:               `${streetAddress} ${house}, ${city}`,
						componentRestrictions: {
							country: countryName,
						},
					},
					(results, status) =>
					{
						if(status === google.maps.GeocoderStatus.OK)
						{
							const formattedAddress = results[0].formatted_address;
							const place: google.maps.GeocoderResult = results[0];
							
							const neededAddressTypes = [
								'country',
								'locality',
								'route',
								'street_number',
							];
							let existedTypes = place.address_components
							                        .map((ac) => ac.types)
							                        .reduce((acc, val) => acc.concat(val), []);
							
							for(const type of neededAddressTypes)
							{
								if(!existedTypes.includes(type))
								{
									this.statusForm = false;
								}
							}
							
							this.applyNewPlaceOnTheMap(place);
							this.applyFormattedAddress(formattedAddress);
						}
					}
			);
		}
	}
	
	private tryFindNewCoordinates()
	{
		const formCoordinates = this.coordinates.coordinates;
		this.lat = formCoordinates[0];
		this.lng = formCoordinates[1];
		
		const geocoder = new google.maps.Geocoder();
		geocoder.geocode(
				{
					location: { lng: this.lng, lat: this.lat },
				},
				(results, status) =>
				{
					if(status === google.maps.GeocoderStatus.OK)
					{
						const formattedAddress = results[0].formatted_address;
						const place = results[0];
						
						const useGeometryLatLng = false;
						this.applyNewPlaceOnTheMap(place, useGeometryLatLng);
						this.applyFormattedAddress(formattedAddress);
					}
				}
		);
	}
	
	private applyFormattedAddress(address: string)
	{
		if(this.searchElement)
		{
			this.searchElement.nativeElement.value = address;
		}
	}
	
	private gatherAddressInformation(
			locationResult: google.maps.GeocoderResult |
			                google.maps.places.PlaceResult
	)
	{
		const longName = 'long_name';
		const shortName = 'short_name';
		
		const neededAddressTypes = {
			country:                     shortName,
			locality:                    longName,
			route:                       longName,
			intersection:                longName,
			street_number:               longName,
			postal_code:                 longName,
			administrative_area_level_1: shortName,
			administrative_area_level_2: shortName,
			administrative_area_level_3: shortName,
			administrative_area_level_4: shortName,
			administrative_area_level_5: shortName,
		};
		
		let streetName = '';
		let streetNumber = '';
		let countryId = '';
		let postcode = '';
		let city = '';
		
		locationResult.address_components
		              .forEach((address) =>
		                       {
			                       const addressType = address.types[0];
			                       const addressTypeKey = neededAddressTypes[addressType];
			
			                       const val = address[addressTypeKey];
			
			                       switch(addressType)
			                       {
				                       case 'country':
					                       countryId = val;
					                       break;
				                       case 'locality':
				                       case 'administrative_area_level_1':
				                       case 'administrative_area_level_2':
				                       case 'administrative_area_level_3':
				                       case 'administrative_area_level_4':
				                       case 'administrative_area_level_5':
					                       if(city === '')
					                       {
						                       city = val;
					                       }
					                       break;
				                       case 'route':
				                       case 'intersection':
					                       if(streetName === '')
					                       {
						                       streetName = val;
					                       }
					                       break;
				                       case 'street_number':
					                       streetNumber = val;
					                       break;
				                       case 'postal_code':
					                       postcode = val;
					                       break;
			                       }
		                       });
		
		this.setFormLocationValues(
				countryId,
				city,
				streetName,
				streetNumber,
				// postcode
		);
	}
	
	private setFormLocationValues(
			countryId,
			city,
			streetName,
			streetNumber,
			// postcode
	)
	{
		if(!_.isEmpty(countryId))
		{
			this.countryIdControl.setValue(Country[countryId].toString());
		}
		if(!_.isEmpty(city))
		{
			this.cityControl.setValue(city);
		}
		if(!_.isEmpty(streetName))
		{
			this.streetAddressControl.setValue(streetName);
		}
		if(!_.isEmpty(streetNumber))
		{
			this.houseControl.setValue(streetNumber);
		}
	}
	
	private listenForGoogleAutocompleteAddressChanges(
			autocomplete: google.maps.places.Autocomplete
	)
	{
		autocomplete.addListener('place_changed', () =>
		{
			const place: google.maps.places.PlaceResult = autocomplete.getPlace();
			this.applyNewPlaceOnTheMap(place);
		});
	}
	
	private static setupGoogleAutocompleteOptions(
			autocomplete: google.maps.places.Autocomplete
	)
	{
		autocomplete['setFields'](['address_components', 'geometry']);
	}
	
	private initGoogleAutocompleteApi()
	{
		if(this.searchElement)
		{
			const autocomplete = new google.maps.places.Autocomplete(
					this.searchElement.nativeElement
			);
			
			LocationFormComponent.setupGoogleAutocompleteOptions(autocomplete);
			
			this.listenForGoogleAutocompleteAddressChanges(autocomplete);
		}
	}
	
	protected filterCountries()
	{
		if(!this.countries)
		{
			return;
		}
		// get the search keyword
		let search = this.countryFilterCtrl.value;
		if(!search)
		{
			this.filteredCountries.next(this.countries.slice());
			return;
		}
		else
		{
			search = search.toLowerCase();
		}
		// filter the countries
		this.filteredCountries.next(
				this.countries.filter(country => country.name.toLowerCase().indexOf(search) > -1)
		);
	}
}
