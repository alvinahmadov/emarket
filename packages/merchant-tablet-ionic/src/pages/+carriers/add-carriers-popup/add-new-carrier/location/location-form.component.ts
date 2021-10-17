import {
	Component,
	OnDestroy,
	ViewChild,
	ElementRef,
	EventEmitter,
	Output,
	OnInit,
	OnChanges,
}                           from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators,
	AbstractControl,
}                           from '@angular/forms';
import { isEmpty }          from 'lodash';
import { Subject }          from 'rxjs';
import { first }            from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import {
	countriesIdsToNamesArray,
	TCountryName,
	getDefaultCountryName,
	
}                           from '@modules/server.common/data/countries';
import Country              from '@modules/server.common/enums/Country';
import { WarehouseRouter }  from '@modules/client.common.angular2/routers/warehouse-router.service';
import { StorageService }   from 'services/storage.service';

@Component({
	           selector:    'carrier-location-form',
	           styleUrls:   ['./location-form.component.scss'],
	           templateUrl: './location-form.component.html',
           })
export class LocationFormComponent implements OnDestroy, OnInit, OnChanges
{
	@ViewChild('autocomplete', { static: true })
	public searchElement: ElementRef;
	
	@Output()
	public buttonClickEventComplete = new EventEmitter();
	
	@Output()
	public backToStep2event = new EventEmitter();
	
	public mapCoordEmitter = new EventEmitter<google.maps.LatLng>();
	public mapGeometryEmitter = new EventEmitter<google.maps.GeocoderGeometry | google.maps.places.PlaceGeometry>();
	
	public form: FormGroup;
	
	public showCoordinates: boolean = false;
	
	public city: AbstractControl;
	public street: AbstractControl;
	public house: AbstractControl;
	public country: AbstractControl;
	public lng: AbstractControl;
	public lat: AbstractControl;
	// public apartment: AbstractControl;
	public postcode: AbstractControl;
	
	public OK: string = 'OK';
	public CANCEL: string = 'CANCEL';
	public PREFIX: string = 'CARRIERS_VIEW.ADD_CARRIER.';
	
	private _ngDestroy$ = new Subject<void>();
	private _lastUsedAddress: string;
	
	constructor(
			private formBuilder: FormBuilder,
			private translate: TranslateService,
			private storageService: StorageService,
			private warehouseRouter: WarehouseRouter
	)
	{}
	
	public ngOnInit()
	{
		this._initGoogleAutocompleteApi();
		// this._tryFindNewCoordinates();
		
		this.buildForm(this.formBuilder);
		this.bindFormControls();
		
		this._loadInitialData();
	}
	
	public ngOnChanges(): void
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	public ngOnDestroy(): void
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	public get buttonOK()
	{
		return this._translate(this.PREFIX + this.OK);
	}
	
	public get buttonCancel()
	{
		return this._translate(this.PREFIX + this.CANCEL);
	}
	
	public get countries(): Array<{ id: Country; name: TCountryName }>
	{
		return countriesIdsToNamesArray;
	}
	
	public buildForm(formBuilder: FormBuilder)
	{
		this.form = formBuilder.group({
			                              city:     ['', Validators.required],
			                              street:   ['', Validators.required],
			                              house:    ['', Validators.required],
			                              lat:      ['', Validators.required],
			                              lng:      ['', Validators.required],
			                              country:  ['', Validators.required],
			                              postcode: [''],
			                              // apartment: ['']
		                              });
	}
	
	public bindFormControls()
	{
		this.city = this.form.get('city');
		this.street = this.form.get('street');
		this.house = this.form.get('house');
		this.country = this.form.get('country');
		this.lng = this.form.get('lng');
		this.lat = this.form.get('lat');
		// this.apartment = this.form.get('apartment');
		this.postcode = this.form.get('postcode');
	}
	
	public toggleCoordinates()
	{
		this.showCoordinates = !this.showCoordinates;
	}
	
	public textInputChange(val, input)
	{
		if(input === 'lat' || input === 'lng')
		{
			this._tryFindNewCoordinates();
		}
		else if(input !== 'apartment')
		{
			this._tryFindNewAddress();
		}
	}
	
	public toStep2()
	{
		this.backToStep2event.emit();
	}
	
	public clickComplete()
	{
		// let prevOrComplete = data;
		console.log('send event to parent');
		this.buttonClickEventComplete.emit('complete');
	}
	
	private _tryFindNewCoordinates()
	{
		const geocoder = new google.maps.Geocoder();
		
		geocoder.geocode(
				{
					location: new google.maps.LatLng(
							this.lat.value,
							this.lng.value
					),
				},
				(res, status) =>
				{
					if(status === google.maps.GeocoderStatus.OK)
					{
						const location = res[0].geometry.location;
						this.mapCoordEmitter.emit(location);
						
						const place = res[0];
						this._applyNewPlaceOnTheMap(place);
					}
				}
		);
	}
	
	private _applyNewPlaceOnTheMap(
			locationResult:
					| google.maps.GeocoderResult
					| google.maps.places.PlaceResult
	)
	{
		if(
				locationResult.geometry === undefined ||
				locationResult.geometry === null
		)
		{
			return;
		}
		
		const loc = locationResult.geometry.location;
		
		this.lat.setValue(loc.lat());
		this.lng.setValue(loc.lng());
		
		this.mapCoordEmitter.emit(loc);
		this.mapGeometryEmitter.emit(locationResult.geometry);
		this._gatherAddressInformation(locationResult);
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
		let streetNumber = '';
		let country = '';
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
					                                          country = val;
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
				country,
				city,
				streetName,
				streetNumber,
				postcode
		);
	}
	
	private _translate(key: string): string
	{
		let translationResult = '';
		
		this.translate.get(key).subscribe((res) =>
		                                  {
			                                  translationResult = res;
		                                  });
		
		return translationResult;
	}
	
	private _setFormLocationValues(
			country,
			city,
			streetName,
			streetNumber,
			postcode
	)
	{
		if(!isEmpty(country))
		{
			this.country.setValue(Country[country].toString());
		}
		if(!isEmpty(city))
		{
			this.city.setValue(city);
		}
		if(!isEmpty(streetName))
		{
			this.street.setValue(streetName);
		}
		if(!isEmpty(streetNumber))
		{
			this.house.setValue(streetNumber);
		}
		if(!isEmpty(postcode))
		{
			this.postcode.setValue(postcode);
		}
	}
	
	private async _initGoogleAutocompleteApi()
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
	
	private static _setupGoogleAutocompleteOptions(
			autocomplete: google.maps.places.Autocomplete
	)
	{
		autocomplete.setComponentRestrictions({ country: ['us', 'bg', 'il'] });
		autocomplete['setFields'](['address_components', 'geometry']);
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
	
	private _tryFindNewAddress()
	{
		const house = this.house.value;
		const city = this.city.value;
		const streetAddress = this.street.value;
		const countryName = getDefaultCountryName(+this.country.value);
		
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
		
		if(newAddress !== this._lastUsedAddress)
		{
			this._lastUsedAddress = newAddress;
			
			const geocoder = new google.maps.Geocoder();
			
			geocoder.geocode(
					{
						address:               `${streetAddress} ${house}, ${city}`,
						componentRestrictions: { country: countryName },
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
	
	private async _applyFormattedAddress(address: string)
	{
		if(this.searchElement)
		{
			const inputElement = await this.searchElement['getInputElement']();
			inputElement.value = address;
		}
	}
	
	private async _loadInitialData()
	{
		const { geoLocation } = await this.warehouseRouter
		                                  .get(this.storageService.warehouseId, false)
		                                  .pipe(first())
		                                  .toPromise();
		
		this.city.setValue(geoLocation.city);
		this.street.setValue(geoLocation.streetAddress);
		this.house.setValue(geoLocation.house);
		this.country.setValue(geoLocation.countryId.toString());
		this.lng.setValue(geoLocation.coordinates.lng);
		this.lat.setValue(geoLocation.coordinates.lat);
		this.postcode.setValue(geoLocation.postcode);
		
		this._tryFindNewCoordinates();
	}
}
