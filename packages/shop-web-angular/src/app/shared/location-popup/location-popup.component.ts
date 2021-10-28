import {
	Component,
	OnInit,
	Inject,
	EventEmitter,
	AfterViewInit,
	ViewChild,
}                                              from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA }       from '@angular/material/dialog';
import { Router }                              from '@angular/router';
import { IGeoLocationCreateObject, ILocation } from '@modules/server.common/interfaces/IGeoLocation';
import { CustomerRouter }                      from '@modules/client.common.angular2/routers/customer-router.service';
import { LocationFormComponent }               from 'app/+login/byLocation/location/location.component';
import { StorageService }                      from 'app/services/storage';
import { environment }                         from 'environments/environment';

@Component({
	           styleUrls: ['./location-popup.component.scss'],
	           templateUrl: './location-popup.component.html',
           })
export class LocationPopupComponent implements OnInit, AfterViewInit
{
	@ViewChild('locationForm')
	public locationForm: LocationFormComponent;
	
	public place: google.maps.places.PlaceResult;
	public coordinates: ILocation;
	
	public mapCoordEmitter = new EventEmitter<number[]>();
	public mapGeometryEmitter = new EventEmitter<any>();
	
	constructor(
			private dialogRef: MatDialogRef<LocationPopupComponent>,
			@Inject(MAT_DIALOG_DATA) public data: any,
			private router: Router,
			private storage: StorageService,
			private userRouter: CustomerRouter
	)
	{}
	
	public ngOnInit(): void
	{
		this.place = this.data.place;
		
		this.coordinates = {
			type: 'Point',
			coordinates: [
				this.place
				? this.place.geometry.location.lat()
				: environment.DEFAULT_LATITUDE || 0,
				this.place
				? this.place.geometry.location.lng()
				: environment.DEFAULT_LONGITUDE || 0,
			],
		};
		
		console.warn('LocationPopupComponent loaded');
	}
	
	public ngAfterViewInit(): void
	{
		if(this.place)
		{
			this.onCoordinatesChanges(this.place.geometry.location);
			this.onGeometrySend(this.place.geometry);
		}
	}
	
	public onCoordinatesChanges(coords)
	{
		this.mapCoordEmitter.emit(coords);
	}
	
	public onGeometrySend(geometry: any)
	{
		this.mapGeometryEmitter.emit(geometry);
	}
	
	public async updateLocation()
	{
		if(this.locationForm)
		{
			const isValid = this.locationForm.statusForm;
			if(isValid)
			{
				const userId = this.storage.userId;
				await this.updateUser(
						userId,
						this.locationForm.getCreateUserInfo().geoLocation
				);
				const address = this.locationForm.searchElement.nativeElement
						.value;
				
				this.close(address);
			}
		}
		console.warn('TODO update');
	}
	
	public async close(text = '')
	{
		await this.dialogRef.close(text);
		await this.reload();
	}
	
	private async reload()
	{
		await this.router.navigateByUrl('reload', {
			skipLocationChange: true,
		});
		await this.router.navigateByUrl('/products');
	}
	
	private async updateUser(userId: string, geoLocation: IGeoLocationCreateObject)
	{
		if(userId)
		{
			await this.userRouter
			          .updateCustomer(userId, { geoLocation });
		}
	}
}
