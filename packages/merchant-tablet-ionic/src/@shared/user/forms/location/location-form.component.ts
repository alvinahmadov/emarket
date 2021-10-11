import { isEmpty, pick }             from 'lodash';
import {
	Component,
	ElementRef,
	EventEmitter,
	Input,
	Output,
	ViewChild,
	OnInit,
	AfterViewInit
}                                    from '@angular/core';
import {
	AbstractControl,
	FormArray,
	FormBuilder,
	FormGroup,
	Validators
}                                    from '@angular/forms';
import { AlertController }           from '@ionic/angular';
import { TranslateService }          from '@ngx-translate/core';
import {
	countriesIdsToNamesArrayFn,
	getCountryName
}                                    from '@modules/server.common/data/countries';
import { IGeoLocationCreateObject }  from '@modules/server.common/interfaces/IGeoLocation';
import Country                       from '@modules/server.common/enums/Country';
import GeoLocation                   from '@modules/server.common/entities/GeoLocation';
import Customer                      from '@modules/server.common/entities/Customer';
import { ProductLocalesService }     from '@modules/client.common.angular2/locale/product-locales.service';
import { FormHelpers }               from '../../../forms/helpers';
import { Storage as StorageService } from '../../../../services/storage.service';

type CountryData = { id: Country; name: string };

@Component({
	           selector:    'location-form',
	           styleUrls:   ['./location-form.component.scss'],
	           templateUrl: './location-form.component.html',
           })
export class LocationFormComponent implements OnInit, AfterViewInit
{
	OK: string = 'OK';
	CANCEL: string = 'CANCEL';
	PREFIX: string = 'WAREHOUSE_VIEW.SELECT_POP_UP.';
	
	@Input()
	readonly form: FormGroup;
	
	@Input()
	readonly apartment?: AbstractControl;
	
	@Input()
	public customerData: Customer;
	
	@Input()
	public showAutocompleteSearch: boolean = false;
	
	@Output()
	public mapCoordinatesEmitter = new EventEmitter<google.maps.LatLng | google.maps.LatLngLiteral>();
	
	@Output()
	public mapGeometryEmitter = new EventEmitter<google.maps.places.PlaceGeometry | google.maps.GeocoderGeometry>();
	
	@ViewChild('autocomplete')
	public searchElement: ElementRef;
	
	public showCoordinates: boolean = false;
	
	public readonly _countries: CountryData[]
	public locale: string;
	
	private _lastUsedAddressText: string;
	private _lat: number;
	private _lng: number;
	
	constructor(
			private readonly _alertController: AlertController,
			private readonly _storage: StorageService,
			private readonly translate: TranslateService,
			public readonly localeTranslateService: ProductLocalesService
	)
	{
		this.locale = this._storage.language ?? 'en-US';
		this._countries = countriesIdsToNamesArrayFn(this.locale);
	}
	
	public ngOnInit(): void
	{
		this.loadData();
	}
	
	public ngAfterViewInit()
	{
		this._initGoogleAutocompleteApi();
	}
	
	public get buttonOK(): string
	{
		return this._translate(this.PREFIX + this.OK);
	}
	
	public get buttonCancel(): string
	{
		return this._translate(this.PREFIX + this.CANCEL);
	}
	
	public get countries(): CountryData[]
	{
		return this._countries;
	}
	
	public get isCountryValid(): boolean
	{
		return (
				this.countryId.errors &&
				(this.countryId.dirty || this.countryId.touched)
		);
	}
	
	public get isCityValid(): boolean
	{
		return this.city.errors && (this.city.dirty || this.city.touched);
	}
	
	public get isStreetAddressValid(): boolean
	{
		return (
				this.streetAddress.errors &&
				(this.streetAddress.dirty || this.streetAddress.touched)
		);
	}
	
	public get isHouseValid(): boolean
	{
		return this.house.errors && (this.house.dirty || this.house.touched);
	}
	
	public get isLocationValid(): boolean
	{
		return (
				this.coordinates.errors &&
				(this.coordinates.dirty || this.coordinates.touched)
		);
	}
	
	public get countryId(): AbstractControl
	{
		return this.form.get('countryId');
	}
	
	public get city(): AbstractControl
	{
		return this.form.get('city');
	}
	
	public get streetAddress(): AbstractControl
	{
		return this.form.get('streetAddress');
	}
	
	public get house(): AbstractControl
	{
		return this.form.get('house');
	}
	
	public get postcode(): AbstractControl
	{
		return this.form.get('postcode');
	}
	
	public get coordinates(): AbstractControl
	{
		return this.form.get('loc').get('coordinates') as FormArray;
	}
	
	public static buildForm(formBuilder: FormBuilder): FormGroup
	{
		return formBuilder.group({
			                         countryId:     [Country.US],
			                         city:          ['', [Validators.required]],
			                         streetAddress: ['', [Validators.required]],
			                         house:         ['', [Validators.required]],
			                         postcode:      [''],
			                         loc:           formBuilder.group({
				                                                          type:        ['Point'],
				                                                          coordinates: formBuilder.array([null, null]),
			                                                          }),
		                         });
	}
	
	public static buildApartmentForm(formBuilder: FormBuilder): AbstractControl
	{
		return formBuilder.control('');
	}
	
	public toggleCoordinates(): void
	{
		this.showCoordinates = !this.showCoordinates;
	}
	
	public onAddressChanges(): void
	{
		if(this.showAutocompleteSearch)
		{
			this._tryFindNewAddress();
		}
	}
	
	public onCoordinatesChanged(): void
	{
		if(this.showAutocompleteSearch)
		{
			this._tryFindNewCoordinates();
		}
	}
	
	public getValue(): IGeoLocationCreateObject
	{
		const location = this.form.getRawValue() as IGeoLocationCreateObject;
		if(!location.postcode)
		{
			delete location.postcode;
		}
		return location;
	}
	
	public getApartment(): string
	{
		// apartment is not part of geo location
		if(!this.apartment)
		{
			throw new Error("Form doesn't contain apartment");
		}
		return this.apartment.value as string;
	}
	
	public setValue<T extends IGeoLocationCreateObject>(geoLocation: T): void
	{
		FormHelpers.deepMark(this.form, 'dirty');
		
		this.form.setValue({
			                   postcode: geoLocation.postcode || '',
			                   ...(pick(geoLocation, Object.keys(this.getValue())) as any),
		                   });
		
		// This setup the form and map with new received values.
		this._tryFindNewCoordinates();
	}
	
	public setApartment(apartment: string): void
	{
		this.apartment.setValue(apartment);
	}
	
	private _translate(key: string): string
	{
		let translationResult = '';
		
		this.translate
		    .get(key)
		    .subscribe((res) => translationResult = res);
		
		return translationResult;
	}
	
	private loadData()
	{
		if(this.customerData)
		{
			const userGeoLocation: GeoLocation = new GeoLocation(
					this.customerData.geoLocation
			);
			
			this.city.setValue(userGeoLocation.city);
			this.streetAddress.setValue(userGeoLocation.streetAddress);
			this.house.setValue(userGeoLocation.house);
			this.coordinates.setValue([
				                          userGeoLocation.coordinates.lat,
				                          userGeoLocation.coordinates.lng,
			                          ]);
			this.countryId.setValue(userGeoLocation.countryId.toString());
			this.postcode.setValue(userGeoLocation.postcode);
			
			this.apartment.setValue(this.customerData.apartment);
			
			this._tryFindNewCoordinates();
		}
	}
	
	private _tryFindNewAddress(): void
	{
		const house = this.house.value;
		const streetAddress = this.streetAddress.value;
		const city = this.city.value;
		const countryName = getCountryName(this.locale, +this.countryId.value);
		
		if(
				isEmpty(streetAddress) ||
				isEmpty(house) ||
				isEmpty(city) ||
				isEmpty(countryName)
		)
		{
			return;
		}
		
		const newAddress = `${house}${streetAddress}${city}${countryName}`;
		
		if(newAddress !== this._lastUsedAddressText)
		{
			this._lastUsedAddressText = newAddress;
			
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
							
							this._applyNewPlaceOnTheMap(place);
							this._applyFormattedAddress(formattedAddress);
						}
					}
			);
		}
	}
	
	private _tryFindNewCoordinates(): void
	{
		const formCoordinates = this.coordinates.value;
		this._lat = formCoordinates[0];
		this._lng = formCoordinates[1];
		
		const geocoder = new google.maps.Geocoder();
		geocoder.geocode(
				{
					location: new google.maps.LatLng(this._lat, this._lng),
				},
				(results, status) =>
				{
					if(status === google.maps.GeocoderStatus.OK)
					{
						const formattedAddress = results[0].formatted_address;
						const place = results[0];
						
						const useGeometryLatLng = false;
						this._applyNewPlaceOnTheMap(place, useGeometryLatLng);
						this._applyFormattedAddress(formattedAddress);
					}
				}
		);
	}
	
	private _emitCoordinates(
			location: google.maps.LatLng | google.maps.LatLngLiteral
	): void
	{
		this.mapCoordinatesEmitter.emit(location);
	}
	
	private _emitGeometry(
			geometry:
					| google.maps.places.PlaceGeometry
					| google.maps.GeocoderGeometry
	): void
	{
		this.mapGeometryEmitter.emit(geometry);
	}
	
	private static _setupGoogleAutocompleteOptions(
			autocomplete: google.maps.places.Autocomplete
	): void
	{
		autocomplete['setFields'](['address_components', 'geometry']);
	}
	
	private _applyNewPlaceOnTheMap(
			place: google.maps.places.PlaceResult | google.maps.GeocoderResult,
			useGeometryLatLng: boolean = true
	): void
	{
		if(place.geometry === undefined || place.geometry === null)
		{
			this._popInvalidAddressMessage();
			return;
		}
		
		if(useGeometryLatLng)
		{
			const loc = place.geometry.location;
			this._lat = loc.lat();
			this._lng = loc.lng();
		}
		
		// If the place has a geometry, then present it on a map.
		this._emitGeometry(place.geometry);
		
		this._emitCoordinates(new google.maps.LatLng(this._lat, this._lng));
		
		this._gatherAddressInformation(place);
	}
	
	private _listenForGoogleAutocompleteAddressChanges(
			autocomplete: google.maps.places.Autocomplete
	): void
	{
		autocomplete.addListener('place_changed', (_) =>
		{
			const place: google.maps.places.PlaceResult = autocomplete.getPlace();
			this._applyNewPlaceOnTheMap(place);
		});
	}
	
	private _gatherAddressInformation(
			locationResult:
					| google.maps.GeocoderResult
					| google.maps.places.PlaceResult
	): void
	{
		const longName = 'long_name';
		const shortName = 'short_name';
		
		const neededAddressTypes = {
			country:  shortName,
			locality: longName,
			// 'neighborhood' is not need for now
			// neighborhood: longName,
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
		let streetNumber = ''; // is house number also
		let countryId = '';
		let postcode = '';
		let city = '';
		
		locationResult.address_components.forEach((address) =>
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
		
		this._setFormLocationValues(
				countryId,
				city,
				streetName,
				streetNumber,
				postcode
		);
	}
	
	private _setFormLocationValues(
			countryId,
			city,
			streetName,
			streetNumber,
			postcode
	): void
	{
		if(!isEmpty(countryId))
		{
			this.countryId.setValue(Country[countryId].toString());
		}
		if(!isEmpty(city))
		{
			this.city.setValue(city);
		}
		if(!isEmpty(postcode))
		{
			this.postcode.setValue(postcode);
		}
		if(!isEmpty(streetName))
		{
			this.streetAddress.setValue(streetName);
		}
		if(!isEmpty(streetNumber))
		{
			this.house.setValue(streetNumber);
		}
		
		this.coordinates.setValue([this._lat, this._lng]);
	}
	
	private async _applyFormattedAddress(address: string): Promise<void>
	{
		if(this.searchElement)
		{
			const inputElement = await this.searchElement['getInputElement']();
			inputElement.value = address;
		}
	}
	
	private async _popInvalidAddressMessage(): Promise<void>
	{
		const alert = await this._alertController.create({
			                                                 message: 'Invalid address, please try again!',
		                                                 });
		await alert.present();
		
		setTimeout(() => alert.dismiss(), 2000);
	}
	
	private async _initGoogleAutocompleteApi(): Promise<void>
	{
		if(this.searchElement)
		{
			const inputElement = await this.searchElement['getInputElement']();
			
			const autocomplete = new google.maps.places.Autocomplete(
					inputElement
			);
			
			LocationFormComponent._setupGoogleAutocompleteOptions(autocomplete);
			
			this._listenForGoogleAutocompleteAddressChanges(autocomplete);
		}
	}
}
