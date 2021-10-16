import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild, } from '@angular/core';
import { ICarrierCreateObject }                                                             from '@modules/server.common/interfaces/ICarrier';
import CommonUtils                                                                          from '@modules/server.common/utilities/common';
import { FileUploader }                                                                     from 'ng2-file-upload';
import { BasicInfoFormComponent }                                                           from './basic-info/basic-info-form.component';
import { AccountFormComponent }                                                             from './account/account-form.component';
import { Subject }                                                                          from 'rxjs';
import { LocationFormComponent }                                                            from './location/location-form.component';

@Component({
	           selector:    'add-new-carrier',
	           styleUrls:   ['./add-new-carrier.scss'],
	           templateUrl: './add-new-carrier.html',
           })
export class AddNewCarrierComponent implements OnInit, OnDestroy, OnChanges
{
	public uploader: FileUploader;
	public emptyLogo: boolean = false;
	
	private _ngDestroy$ = new Subject<void>();
	
	@Output()
	public buttonClickEvent = new EventEmitter();
	
	@Output()
	public onCompleteEvent = new EventEmitter();
	
	@Input()
	public isDone: boolean;
	
	@ViewChild('basicInfoForm', { static: true })
	public basicInfoForm: BasicInfoFormComponent;
	
	@ViewChild('accountForm', { static: true })
	public accountForm: AccountFormComponent;
	
	@ViewChild('locationForm', { static: true })
	public locationForm: LocationFormComponent;
	
	public isNextStepOneAvailable: boolean = true;
	public isNextStepTwoAvailable: boolean = false;
	public isNextStepThreeAvailable: boolean = false;
	public backToPrevPage: boolean = false;
	
	public $password: any;
	
	public ngOnInit(): void {}
	
	public ngOnChanges(): void {}
	
	public ngOnDestroy(): void
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	public get password(): string
	{
		return this.accountForm.password.value;
	}
	
	public getCarrierCreateObject(): ICarrierCreateObject
	{
		const letter = this.basicInfoForm.firstName.value
		                   .charAt(0)
		                   .toUpperCase();
		
		let logo: string;
		
		this.basicInfoForm.logo.value === ''
		? (logo = CommonUtils.getDummyImage(300, 300, letter))
		: (logo = this.basicInfoForm.logo.value);
		
		return {
			firstName: this.basicInfoForm.firstName.value,
			lastName:  this.basicInfoForm.lastName.value,
			email:     this.basicInfoForm.email.value,
			logo,
			phone:     this.basicInfoForm.phone.value,
			
			username:        this.accountForm.userName.value,
			isSharedCarrier: this.accountForm.isSharedCarrier.value,
			
			geoLocation: {
				city:          this.locationForm.city.value,
				streetAddress: this.locationForm.street.value,
				house:         this.locationForm.house.value,
				loc:           {
					type:        'Point',
					coordinates: [
						this.locationForm.lng.value,
						this.locationForm.lat.value,
					],
				},
				countryId:     this.locationForm.country.value,
				postcode:      this.locationForm.postcode.value,
			},
		};
	}
	
	public backToStep1()
	{
		this.isNextStepOneAvailable = true;
		this.isNextStepTwoAvailable = false;
		this.isNextStepThreeAvailable = false;
	}
	
	public toStep2event($event)
	{
		this.isNextStepOneAvailable = false;
		this.isNextStepTwoAvailable = true;
		this.isNextStepThreeAvailable = false;
	}
	
	public nextToStep2()
	{
		this.isNextStepOneAvailable = false;
		this.isNextStepTwoAvailable = true;
		this.isNextStepThreeAvailable = false;
	}
	
	public nextToStep3()
	{
		this.isNextStepOneAvailable = false;
		this.isNextStepTwoAvailable = false;
		this.isNextStepThreeAvailable = true;
	}
	
	public clickPrevOrComplete(data)
	{
		this.buttonClickEvent.emit(data);
	}
	
	public onClickComplete(data)
	{
		this.onCompleteEvent.emit(data);
	}
}
