import {
	Component,
	ViewChild,
	EventEmitter,
	Output,
	Input,
}                                           from '@angular/core';
import { FormBuilder, FormGroup }           from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { IGeoLocationCreateObject }         from '@modules/server.common/interfaces/IGeoLocation';
import Customer                             from '@modules/server.common/entities/Customer';
import CommonUtils                          from '@modules/server.common/utilities/common';
import { CustomerAuthRouter }               from '@modules/client.common.angular2/routers/customer-auth-router.service';
import { CustomerRouter }                   from '@modules/client.common.angular2/routers/customer-router.service';
import { BasicInfoFormComponent }           from '../forms/basic-info/basic-info-form.component';
import { LocationFormComponent }            from '../forms/location/location-form.component';

type TUserUpdateData = {
	geoLocation: IGeoLocationCreateObject;
	apartment: string;
	username: string;
	firstName?: string;
	lastName?: string;
	email: string;
	avatar?: string;
}

type TUserRegistrationInput = {
	user: TUserUpdateData
}

@Component({
	           selector:    'user-mutation',
	           styleUrls:   ['./user-mutation.component.scss'],
	           templateUrl: './user-mutation.component.html',
           })
export class UserMutationComponent
{
	readonly form: FormGroup = this._formBuilder.group({
		                                                   basicInfo: BasicInfoFormComponent.buildForm(this._formBuilder),
		                                                   apartment: LocationFormComponent.buildApartmentForm(this._formBuilder),
		                                                   location:  LocationFormComponent.buildForm(this._formBuilder),
	                                                   });
	
	readonly basicInfo = this.form.get('basicInfo') as FormGroup;
	readonly apartment = this.form.get('apartment') as FormGroup;
	readonly location = this.form.get('location') as FormGroup;
	
	@ViewChild('basicInfoForm')
	public basicInfoForm: BasicInfoFormComponent;
	
	@ViewChild('locationForm')
	public locationForm: LocationFormComponent;
	
	@Input()
	public customer: Customer;
	
	@Output()
	public customerIdEmitter = new EventEmitter<string>();
	
	@Input()
	public visible: boolean = true;
	
	@Output()
	public updateVisible = new EventEmitter<boolean>();
	
	public mapCoordinatesEmitter = new EventEmitter<google.maps.LatLng | google.maps.LatLngLiteral>();
	
	public mapGeometryEmitter = new EventEmitter<google.maps.places.PlaceGeometry | google.maps.GeocoderGeometry>();
	
	public isNextStepAvailable: boolean = false;
	
	constructor(
			private readonly _userAuthRouter: CustomerAuthRouter,
			private readonly _formBuilder: FormBuilder,
			private readonly modalController: ModalController,
			private readonly customerRouter: CustomerRouter,
			private readonly toastController: ToastController
	)
	{}
	
	public onCoordinatesChanges(
			coords: google.maps.LatLng | google.maps.LatLngLiteral
	)
	{
		this.mapCoordinatesEmitter.emit(coords);
	}
	
	public onGeometrySend(
			geometry:
					| google.maps.places.PlaceGeometry
					| google.maps.GeocoderGeometry
	)
	{
		this.mapGeometryEmitter.emit(geometry);
	}
	
	public broadcastCustomerId(customerId: string)
	{
		this.customerIdEmitter.emit(customerId);
	}
	
	public changeState(): void
	{
		this.visible = false;
		this.updateVisible.emit(this.visible);
	}
	
	public async createCustomer()
	{
		let customerId: string;
		let message: string;
		try
		{
			const userRegistrationInput: TUserRegistrationInput = {
				user: {
					...this.basicInfoForm.getValue(),
					geoLocation: this.locationForm.getValue(),
					apartment:   this.locationForm.getApartment(),
				},
			};
			
			const userData = userRegistrationInput.user;
			if(userData)
			{
				userRegistrationInput.user = this.getDefaultImage(userData);
			}
			
			// We reverse coordinates before create new customer, because in geoJSON standart
			// the array of coordinates is in reverse order, instead of 'Lat' => 'Lng' the orders is 'Lng' => 'Lat'
			userRegistrationInput.user.geoLocation.loc.coordinates.reverse();
			
			const customer = await this._userAuthRouter.register(
					userRegistrationInput
			);
			
			customerId = customer.id;
			
			this.broadcastCustomerId(customer.id);
			
			message = `Customer ${customer.fullName}[${customer.username}](${customer.id}) Created`;
		} catch(err)
		{
			message = `Error in creating customer: '${err.message}'!`;
		} finally
		{
			await this.presentToast(message);
			if(this.visible)
			{
				await this.modalController.dismiss(customerId);
			}
		}
	}
	
	public async saveCustomer()
	{
		const geoLocation = this.locationForm.getValue();
		
		let updateUpdateData = {
			...this.basicInfoForm.getValue(),
			geoLocation,
			apartment: this.locationForm.getApartment(),
		};
		
		if(updateUpdateData)
		{
			updateUpdateData = this.getDefaultImage(updateUpdateData);
		}
		
		await this.customerRouter.updateCustomer(this.customer.id, updateUpdateData);
		await this.modalController.dismiss();
	}
	
	public cancelModal()
	{
		this.modalController.dismiss();
	}
	
	private async presentToast(message: string)
	{
		const toast = await this.toastController.create({
			                                                message,
			                                                duration: 2000,
		                                                });
		toast.present();
	}
	
	protected getDefaultImage(customer: TUserUpdateData)
	{
		if(customer && !customer.avatar)
		{
			const firstNameLetter = customer.firstName
			                        ? customer.firstName.charAt(0).toUpperCase()
			                        : '';
			
			const lastNameLetter = customer.lastName
			                       ? customer.lastName.charAt(0).toUpperCase()
			                       : '';
			
			if(firstNameLetter || lastNameLetter)
			{
				customer.avatar = CommonUtils.getDummyImage(
						300,
						300,
						firstNameLetter + lastNameLetter
				);
			}
			else
			{
				const firstCityLetter = customer.geoLocation.city
				                                .charAt(0)
				                                .toUpperCase();
				
				customer.avatar = CommonUtils.getDummyImage(300, 300, firstCityLetter);
			}
		}
		
		return customer;
	}
}
