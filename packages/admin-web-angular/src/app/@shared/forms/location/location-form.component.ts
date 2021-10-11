import {
	Component,
	ElementRef,
	EventEmitter,
	Input,
	Output,
	ViewChild,
	AfterViewInit
}                                   from '@angular/core';
import {
	AbstractControl,
	FormArray,
	FormBuilder,
	FormGroup,
	Validators,
}                                   from '@angular/forms';
import { IGeoLocationCreateObject } from '@modules/server.common/interfaces/IGeoLocation';
import {
	countriesIdsToNamesArray,
	TCountryData,
	countriesIdsToNamesArrayFn,
	getCountryName
}                                   from '@modules/server.common/data/countries';
import Country                      from '@modules/server.common/enums/Country';
import { FormHelpers }              from '../helpers';
import { isEmpty, pick }            from 'lodash';
import { ToasterService }           from 'angular2-toaster';
import { TranslateService }         from '@ngx-translate/core'
import { environment }              from 'environments/environment';

@Component({
	           selector:    'ea-location-form',
	           styleUrls:   ['./location-form.component.scss'],
	           templateUrl: './location-form.component.html',
           })
export class LocationFormComponent implements AfterViewInit
{
	@Input()
	public readonly form: FormGroup;
	
	@Input()
	public readonly apartment?: AbstractControl;
	
	@Input()
	public showAutocompleteSearch: boolean = false;
	
	@Output()
	public mapCoordinatesEmitter = new EventEmitter<google.maps.LatLng | google.maps.LatLngLiteral>();
	
	@Output()
	public mapGeometryEmitter = new EventEmitter<google.maps.places.PlaceGeometry | google.maps.GeocoderGeometry>();
	
	@ViewChild('autocomplete')
	searchElement: ElementRef;
	
	public readonly defaultCountryId: Country = Country.RU;
	public showCoordinates: boolean = false;
	
	private readonly _countries: TCountryData[];
	private _lastUsedAddressText: string;
	private _lat: number;
	private _lng: number;
	
	constructor(
			private readonly toasterService: ToasterService,
			private readonly _translateService: TranslateService
	)
	{
		if(!this._translateService.getLangs().length)
		{
			this._translateService.addLangs(environment.AVAILABLE_LOCALES.split('|'))
		}
		if(!this._translateService.currentLang)
		{
			this._translateService.use(environment.DEFAULT_LANGUAGE);
		}
		
		this._countries = countriesIdsToNamesArrayFn(this._translateService.currentLang);
	}
	
	public ngAfterViewInit()
	{
		this._initGoogleAutocompleteApi();
	}
	
	public get countries(): TCountryData[]
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
	
	public get coordinates(): FormArray
	{
		return this.form.get('loc').get('coordinates') as FormArray;
	}
	
	public static buildForm(formBuilder: FormBuilder): FormGroup
	{
		return formBuilder.group({
			                         countryId:     [
				                         Country.RU,
				                         [
					                         (ctrl) =>
							                         countriesIdsToNamesArray.map(
									                         (c) => c.id
							                         ).includes(ctrl.value),
				                         ],
			                         ],
			                         city:          ['', [Validators.required]],
			                         streetAddress: ['', [Validators.required]],
			                         house:         ['', [Validators.required]],
			                         postcode:      [''],
			
			                         loc: formBuilder.group({
				                                                type:        ['Point'],
				                                                coordinates: formBuilder.array([null, null]),
			                                                }),
		                         });
	}
	
	public static buildApartmentForm(formBuilder: FormBuilder): AbstractControl
	{
		return formBuilder.control('');
	}
	
	public onAddressChanges()
	{
		if(this.showAutocompleteSearch)
		{
			this._tryFindNewAddress();
		}
	}
	
	public onCoordinatesChanged()
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
	
	public setValue<T extends IGeoLocationCreateObject>(geoLocation: T)
	{
		FormHelpers.deepMark(this.form, 'dirty');
		
		this.form.setValue({
			                   postcode: geoLocation.postcode || '',
			                   ...(pick(geoLocation, Object.keys(this.getValue())) as any),
		                   });
		
		// This setup the form and map with new received values.
		this._tryFindNewCoordinates();
	}
	
	public setApartment(apartment: string)
	{
		this.apartment.setValue(apartment);
	}
	
	public toggleShowCoordinates()
	{
		this.showCoordinates = !this.showCoordinates;
	}
	
	public setDefaultCoords()
	{
		const lat = environment.DEFAULT_LATITUDE;
		const lng = environment.DEFAULT_LONGITUDE;
		
		if(lat && lng)
		{
			this.coordinates.setValue([lat, lng]);
			this.onCoordinatesChanged();
		}
	}
	
	private _applyFormattedAddress(address: string)
	{
		if(this.searchElement)
		{
			this.searchElement.nativeElement.value = address;
		}
	}
	
	private _tryFindNewAddress()
	{
		const house = this.house.value;
		const streetAddress = this.streetAddress.value;
		const city = this.city.value;
		const countryName = getCountryName(
				this._translateService.currentLang,
				+this.countryId.value
		);
		
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
	
	private _tryFindNewCoordinates()
	{
		const formCoordinates = this.coordinates.value;
		this._lat = formCoordinates[0];
		this._lng = formCoordinates[1];
		
		const geocoder = new google.maps.Geocoder();
		geocoder.geocode(
				{
					location: { lng: this._lng, lat: this._lat },
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
	)
	{
		this.mapCoordinatesEmitter.emit(location);
	}
	
	private _emitGeometry(
			geometry:
					| google.maps.places.PlaceGeometry
					| google.maps.GeocoderGeometry
	)
	{
		this.mapGeometryEmitter.emit(geometry);
	}
	
	private _popInvalidAddressMessage()
	{
		this.toasterService.pop(
				'warning',
				'Invalid address, please try again!'
		);
	}
	
	private static _setupGoogleAutocompleteOptions(
			autocomplete: google.maps.places.Autocomplete
	)
	{
		autocomplete['setFields'](['address_components', 'geometry']);
	}
	
	private _applyNewPlaceOnTheMap(
			place: google.maps.places.PlaceResult | google.maps.GeocoderResult,
			useGeometryLatLng: boolean = true
	)
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
	)
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
	)
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
	
	private _initGoogleAutocompleteApi()
	{
		if(this.searchElement)
		{
			const autocomplete = new google.maps.places.Autocomplete(
					this.searchElement.nativeElement
			);
			
			LocationFormComponent._setupGoogleAutocompleteOptions(autocomplete);
			
			this._listenForGoogleAutocompleteAddressChanges(autocomplete);
		}
	}
	
	private _setFormLocationValues(
			countryId,
			city,
			streetName,
			streetNumber,
			postcode
	)
	{
		if(!isEmpty(countryId))
		{
			this.countryId.setValue(Country[countryId]);
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
}
