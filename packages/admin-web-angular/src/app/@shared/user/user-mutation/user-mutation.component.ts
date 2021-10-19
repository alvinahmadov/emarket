import { Component, ViewChild, EventEmitter }  from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbActiveModal }                      from '@ng-bootstrap/ng-bootstrap';
import { TranslateService }                    from '@ngx-translate/core';
import { ToasterService }                      from 'angular2-toaster';
import { BasicInfoFormComponent }              from '../forms/basic-info';
import { LocationFormComponent }               from '../../forms/location';
import { CustomerAuthRouter }                  from '@modules/client.common.angular2/routers/customer-auth-router.service';

@Component({
	           selector:    'ea-user-mutation',
	           styleUrls:   ['/user-mutation.component.scss'],
	           templateUrl: './user-mutation.component.html',
           })
export class UserMutationComponent
{
	@ViewChild('basicInfoForm')
	public basicInfoForm: BasicInfoFormComponent;
	
	@ViewChild('locationForm')
	public locationForm: LocationFormComponent;
	
	public mapTypeEmitter = new EventEmitter<string>();
	public mapCoordEmitter = new EventEmitter<number[]>();
	public mapGeometryEmitter = new EventEmitter<any>();
	
	public BUTTON_DONE: string = 'BUTTON_DONE';
	public BUTTON_NEXT: string = 'BUTTON_NEXT';
	public BUTTON_PREV: string = 'BUTTON_PREV';
	
	readonly form: FormGroup = this.formBuilder.group({
		                                                  basicInfo: BasicInfoFormComponent.buildForm(this.formBuilder),
		                                                  apartment: LocationFormComponent.buildApartmentForm(this.formBuilder),
		                                                  location:  LocationFormComponent.buildForm(this.formBuilder),
	                                                  });
	
	readonly basicInfo = this.form.get('basicInfo') as FormControl;
	readonly apartment = this.form.get('apartment') as FormControl;
	readonly location = this.form.get('location') as FormControl;
	
	public loading: boolean;
	
	constructor(
			protected readonly customerAuthRouter: CustomerAuthRouter,
			private readonly toasterService: ToasterService,
			private readonly activeModal: NgbActiveModal,
			private readonly formBuilder: FormBuilder,
			private readonly translateService: TranslateService
	)
	{}
	
	public get buttonDone()
	{
		return this._translate(this.BUTTON_DONE);
	}
	
	public get buttonNext()
	{
		return this._translate(this.BUTTON_NEXT);
	}
	
	public get buttonPrevious()
	{
		return this._translate(this.BUTTON_PREV);
	}
	
	public onCoordinatesChanges(coords: number[])
	{
		this.mapCoordEmitter.emit(coords);
	}
	
	public onGeometrySend(geometry: any)
	{
		this.mapGeometryEmitter.emit(geometry);
	}
	
	public emitMapType(mapType: string)
	{
		this.mapTypeEmitter.emit(mapType);
	}
	
	public async create()
	{
		try
		{
			this.loading = true;
			
			// GeoJSON in MongoDB save coordinates lng-lat, but locationForm return lat-lng for that we reverse them
			const location = this.locationForm.getValue();
			// location.loc.coordinates.reverse();
			
			const userInfo = this.basicInfoForm.getValue();
			let username = userInfo.username;
			if(userInfo.lastName)
				username += ' ' + userInfo.lastName;
			
			const user = await this.customerAuthRouter.register({
				                                                    user:     {
					                                                    username:    username,
					                                                    email:       userInfo.email,
					                                                    firstName:   userInfo.firstName,
					                                                    lastName:    userInfo.lastName,
					                                                    avatar:      userInfo.avatar,
					                                                    geoLocation: location,
					                                                    apartment:   this.locationForm.getApartment(),
				                                                    },
				                                                    password: this.basicInfoForm.password.value
			                                                    });
			this.loading = false;
			this.toasterService.pop(
					'success',
					`Customer with '${user.id}' was added`
			);
			this.activeModal.close(user);
		} catch(err)
		{
			this.loading = false;
			this.toasterService.pop(
					'error',
					`Error in creating customer: "${err.message}"`
			);
		}
	}
	
	public cancel()
	{
		this.activeModal.dismiss('canceled');
	}
	
	private _translate(key: string): string
	{
		let translationResult = '';
		
		this.translateService.get(key).subscribe((res) =>
		                                         {
			                                         translationResult = res;
		                                         });
		
		return translationResult;
	}
}
