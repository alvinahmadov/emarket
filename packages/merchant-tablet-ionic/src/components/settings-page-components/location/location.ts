import {
	Component,
	ElementRef,
	EventEmitter,
	Input,
	ViewChild,
	OnChanges,
	OnDestroy,
	OnInit
}                               from '@angular/core';
import {
	AbstractControl,
	FormBuilder,
	FormGroup,
	Validators
}                               from '@angular/forms';
import { TranslateService }     from '@ngx-translate/core';
import { AlertController }      from '@ionic/angular';
import { isEmpty }              from 'lodash';
import {
	getDefaultCountryName,
	countriesIdsToNamesArrayFn,
	TCountryData
}                               from '@modules/server.common/data/countries';
import { CountryAbbreviations } from '@modules/server.common/data/abbreviation-to-country';
import Country                  from '@modules/server.common/enums/Country';
import Warehouse                from '@modules/server.common/entities/Warehouse';
import { WarehouseRouter }      from '@modules/client.common.angular2/routers/warehouse-router.service';
import { StorageService }       from 'services/storage.service';

@Component({
	           selector:    'merchant-location',
	           templateUrl: 'location.html',
           })
export class LocationComponent implements OnInit, OnChanges, OnDestroy
{
	public OK: string = 'OK';
	public CANCEL: string = 'CANCEL';
	public PREFIX: string = 'SETTINGS_VIEW.';
	
	public locationForm: FormGroup;
	public country: AbstractControl;
	public city: AbstractControl;
	public postcode: AbstractControl;
	public street: AbstractControl;
	public house: AbstractControl;
	public apartment: AbstractControl;
	public autodetectCoordinates: AbstractControl;
	public latitude: AbstractControl;
	public longitude: AbstractControl;
	
	public map: google.maps.Map;
	
	@ViewChild('autocomplete', { static: true })
	public searchElement: ElementRef;
	
	public mapCoordEmitter = new EventEmitter<google.maps.LatLng>();
	
	public mapGeometryEmitter = new EventEmitter<google.maps.GeocoderGeometry | google.maps.places.PlaceGeometry>();
	
	@Input()
	private currWarehouse: Warehouse;
	
	private _lastUsedAddress: string;
	
	constructor(
			private formBuilder: FormBuilder,
			private warehouseRouter: WarehouseRouter,
			public alertController: AlertController,
			private translate: TranslateService,
			private storageService: StorageService
	)
	{
		this.buildForm();
		this.bindFormControls();
	}
	
	public ngOnInit(): void
	{
		this._initGoogleAutocompleteApi();
		this._tryFindNewCoordinates();
	}
	
	public ngOnChanges(): void
	{
		if(this.currWarehouse)
		{
			this.country.setValue(
					this.currWarehouse.geoLocation.countryId.toString()
			);
			this.city.setValue(this.currWarehouse.geoLocation.city);
			this.postcode.setValue(this.currWarehouse.geoLocation.postcode);
			this.street.setValue(this.currWarehouse.geoLocation.streetAddress);
			this.house.setValue(this.currWarehouse.geoLocation.house);
			this.apartment.setValue(this.currWarehouse.geoLocation.apartment);
			// here is used hardcode value in coordinates because from interface in Geolocation we are sure
			// that in array coordinated on first position is lat and on second is long
			this.latitude.setValue(
					this.currWarehouse.geoLocation.coordinates.lat
			);
			this.longitude.setValue(
					this.currWarehouse.geoLocation.coordinates.lng
			);
		}
	}
	
	public ngOnDestroy(): void {}
	
	public get countries(): TCountryData[]
	{
		return countriesIdsToNamesArrayFn(this.storageService.locale ?? 'ru-RU');
	}
	
	public get buttonOK(): string
	{
		return this._translate(this.PREFIX + this.OK);
	}
	
	public get buttonCancel(): string
	{
		return this._translate(this.PREFIX + this.CANCEL);
	}
	
	public async saveChanges(): Promise<void>
	{
		this.prepareUpdate();
		const warehouse = await this.warehouseRouter.save(this.currWarehouse);
		const alert = await this.alertController.create({
			                                                cssClass: 'success-info',
			                                                message:  `Successfully saved changes for ${warehouse.name}`,
			                                                buttons:  ['OK'],
		                                                });
		
		await alert.present();
	}
	
	public prepareUpdate(): void
	{
		this.currWarehouse.geoLocation.countryId = this.country.value;
		this.currWarehouse.geoLocation.city = this.city.value;
		this.currWarehouse.geoLocation.postcode = this.postcode.value;
		this.currWarehouse.geoLocation.streetAddress = this.street.value;
		this.currWarehouse.geoLocation.house = this.house.value;
		this.currWarehouse.geoLocation.apartment = this.apartment.value;
		this.currWarehouse.geoLocation.loc = {
			type:        'Point',
			coordinates: [
				this.longitude.value,
				this.latitude.value
			],
		};
	}
	
	public bindFormControls(): void
	{
		this.country = this.locationForm.get('country');
		this.city = this.locationForm.get('city');
		this.postcode = this.locationForm.get('postcode');
		this.street = this.locationForm.get('street');
		this.house = this.locationForm.get('house');
		this.apartment = this.locationForm.get('apartment');
		this.autodetectCoordinates = this.locationForm.get(
				'autodetectCoordinates'
		);
		this.latitude = this.locationForm.get('latitude');
		this.longitude = this.locationForm.get('longitude');
	}
	
	public buildForm(): void
	{
		this.locationForm = this.formBuilder.group({
			                                           country:               ['', Validators.required],
			                                           city:                  ['', Validators.required],
			                                           postcode:              [''],
			                                           street:                ['', Validators.required],
			                                           house:                 ['', Validators.required],
			                                           apartment:             [''],
			                                           autodetectCoordinates: [true],
			                                           latitude:              ['', Validators.required],
			                                           longitude:             ['', Validators.required],
		                                           });
	}
	
	public textInputChange(val, input): void
	{
		if(input === 'latitude' || input === 'longitude')
		{
			this._tryFindNewCoordinates();
		}
		else if(input !== 'apartment')
		{
			this._tryFindNewAddress();
		}
	}
	
	private _tryFindNewCoordinates(): void
	{
		const geocoder = new google.maps.Geocoder();
		
		geocoder.geocode(
				{
					location: new google.maps.LatLng(
							this.latitude.value,
							this.longitude.value
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
	): void
	{
		if(locationResult.geometry === undefined ||
		   locationResult.geometry === null)
		{
			return;
		}
		
		const loc = locationResult.geometry.location;
		
		this.latitude.setValue(loc.lat());
		this.longitude.setValue(loc.lng());
		
		this.mapCoordEmitter.emit(loc);
		this.mapGeometryEmitter.emit(locationResult.geometry);
		this._gatherAddressInformation(locationResult);
	}
	
	private _translate(key: string): string
	{
		let translationResult = '';
		
		this.translate.get(key).subscribe((res: string) => translationResult = res);
		
		return translationResult;
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
	
	private _setFormLocationValues(
			country,
			city,
			streetName,
			streetNumber,
			postcode
	): void
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
	
	private async _initGoogleAutocompleteApi(): Promise<void>
	{
		if(this.searchElement)
		{
			const inputElement = await this.searchElement['getInputElement']();
			
			const autocomplete = new google.maps.places.Autocomplete(
					inputElement
			);
			
			LocationComponent._setupGoogleAutocompleteOptions(autocomplete);
			this._listenForGoogleAutocompleteAddressChanges(autocomplete);
		}
	}
	
	private static _setupGoogleAutocompleteOptions(
			autocomplete: google.maps.places.Autocomplete
	): void
	{
		let restr = [
			CountryAbbreviations.AZ,
			CountryAbbreviations.KZ,
			CountryAbbreviations.KY,
			CountryAbbreviations.RU,
			CountryAbbreviations.UA,
			CountryAbbreviations.US,
			CountryAbbreviations.UZ,
		];
		
		restr.map((r) => r.toLowerCase());
		autocomplete.setComponentRestrictions({ country: restr });
		autocomplete['setFields'](['address_components', 'geometry']);
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
	
	private _tryFindNewAddress(): void
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
	
	private async _applyFormattedAddress(address: string): Promise<void>
	{
		if(this.searchElement)
		{
			const inputElement = await this.searchElement['getInputElement']();
			inputElement.value = address;
		}
	}
}
