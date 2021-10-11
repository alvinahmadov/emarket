import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import {
	FormGroup,
	AbstractControl,
	FormBuilder,
	Validators,
}                                                 from '@angular/forms';
import Admin                                      from '@modules/server.common/entities/Admin';
import { takeUntil, first, debounceTime }         from 'rxjs/operators';
import { Subject }                                from 'rxjs';
import { IAdminUpdateObject }                     from '@modules/server.common/interfaces/IAdmin';
import { AdminsService }                          from '../../../../@core/data/admins.service';
import { CommonUtils }                            from '@modules/server.common/utilities';
import { ToasterService }                         from 'angular2-toaster';
import { TranslateService }                       from '@ngx-translate/core';
import 'rxjs/add/operator/debounceTime';
import { Store }                                  from '@app/@core/data/store.service';

@Component({
	           selector:    'ea-basic-info',
	           styleUrls:   ['/basic-info.component.scss'],
	           templateUrl: './basic-info.component.html',
           })
export class BasicInfoComponent implements OnChanges, OnDestroy
{
	@Input()
	admin: Admin;
	
	uploaderPlaceholder: string;
	basicInfoForm: FormGroup;
	usernameControl: AbstractControl;
	emailControl: AbstractControl;
	avatarControl: AbstractControl;
	firstNameControl: AbstractControl;
	lastNameControl: AbstractControl;
	
	usernameErrorMsg: string;
	emailErrorMsg: string;
	firstNameErrorMsg: string;
	lastNameErrorMsg: string;
	INVALID_EMAIL_ADDRESS: string = 'INVALID_EMAIL_ADDRESS';
	INVALID_URL: string = 'INVALID_URL';
	NAME_MUST_CONTAIN_ONLY_LETTERS: string = 'NAME_MUST_CONTAIN_ONLY_LETTERS';
	PREFIX: string = 'PROFILE_VIEW.';
	loading: boolean;
	
	private ngDestroy$ = new Subject<void>();
	// Use "errors[0]" because to show messages one by one till all are fixed
	private validations = {
		usernameControl:  () =>
		                  {
			                  this.usernameControl.valueChanges
			                      .pipe(debounceTime(500), takeUntil(this.ngDestroy$))
			                      .subscribe(() =>
			                                 {
				                                 this.usernameErrorMsg = BasicInfoComponent.hasError(this.usernameControl)
				                                                         ? Object.keys(this.usernameControl.errors)[0]
				                                                         : '';
			                                 });
		                  },
		emailControl:     () =>
		                  {
			                  this.emailControl.valueChanges
			                      .pipe(debounceTime(500), takeUntil(this.ngDestroy$))
			                      .subscribe(() =>
			                                 {
				                                 this.emailErrorMsg = BasicInfoComponent.hasError(this.emailControl)
				                                                      ? this.emailControl.errors.email
				                                                        ? this.invalidEmailAddress()
				                                                        : Object.keys(this.emailControl.errors)[0]
				                                                      : '';
			                                 });
		                  },
		firstNameControl: () =>
		                  {
			                  this.firstNameControl.valueChanges
			                      .pipe(debounceTime(500), takeUntil(this.ngDestroy$))
			                      .subscribe(() =>
			                                 {
				                                 this.firstNameErrorMsg = BasicInfoComponent.hasError(this.firstNameControl)
				                                                          ? this.firstNameControl.errors.pattern
				                                                            ? this.nameMustContainOnlyLetters()
				                                                            : Object.keys(this.firstNameControl.errors)[0]
				                                                          : '';
			                                 });
		                  },
		lastNameControl:  () =>
		                  {
			                  this.lastNameControl.valueChanges
			                      .pipe(debounceTime(500), takeUntil(this.ngDestroy$))
			                      .subscribe(() =>
			                                 {
				                                 this.lastNameErrorMsg = BasicInfoComponent.hasError(this.lastNameControl)
				                                                         ? this.lastNameControl.errors.pattern
				                                                           ? this.nameMustContainOnlyLetters()
				                                                           : Object.keys(this.lastNameControl.errors)[0]
				                                                         : '';
			                                 });
		                  },
		avatarControl:    () =>
		                  {
			                  this.avatarControl.valueChanges
			                      .pipe(debounceTime(500), takeUntil(this.ngDestroy$))
			                      .subscribe((value) =>
			                                 {
				                                 value !== this.admin.avatar && !this.avatarControl.invalid
				                                 ? this.avatarControl.markAsDirty()
				                                 : this.avatarControl.markAsPristine();
			                                 });
		                  }
	};
	
	constructor(
			private formBuilder: FormBuilder,
			private adminsService: AdminsService,
			private toasterService: ToasterService,
			private storageService: Store,
			private _translateService: TranslateService
	)
	{
		this.getUploaderPlaceholderText().then();
		this.buildForm();
		this.bindFormControls();
		this._applyTranslationOnSmartTable();
		
		this.loadControls();
	}
	
	get pictureUrlErrorMsg()
	{
		return this.avatarControl.errors.pattern
		       ? this.invalidURL()
		       : Object.keys(this.avatarControl.errors)[0];
	}
	
	ngOnChanges(): void
	{
		this._applyTranslationOnSmartTable();
		if(this.admin)
		{
			this.usernameControl.setValue(this.admin.username);
			this.emailControl.setValue(this.admin.email);
			this.avatarControl.setValue(this.admin.avatar);
			this.firstNameControl.setValue(this.admin.firstName);
			this.lastNameControl.setValue(this.admin.lastName);
		}
	}
	
	ngOnDestroy()
	{
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
	
	invalidEmailAddress()
	{
		return this._translate(this.PREFIX + this.INVALID_EMAIL_ADDRESS);
	}
	
	invalidURL()
	{
		return this._translate(this.PREFIX + this.INVALID_URL);
	}
	
	nameMustContainOnlyLetters()
	{
		return this._translate(
				this.PREFIX + this.NAME_MUST_CONTAIN_ONLY_LETTERS
		);
	}
	
	async saveChanges()
	{
		try
		{
			this.loading = true;
			await this.adminsService
			          .updateById(this.admin.id, this.getAdminCreateObj())
			          .pipe(first())
			          .toPromise();
			this.loading = false;
			this.basicInfoForm.markAsPristine();
			this.toasterService.pop('success', 'Successfully updated data');
		} catch(error)
		{
			this.loading = false;
			this.toasterService.pop('error', error);
		}
	}
	
	buildForm()
	{
		const imgUrlRegex: RegExp = new RegExp(
				`(http(s?):)s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|svg))`
		);
		const nameRegex: RegExp = new RegExp(`^[a-z ,.'-]+$`, 'i');
		
		this.basicInfoForm = this.formBuilder.group(
				{
					username:  ['', Validators.required],
					email:     ['', [Validators.required, Validators.email]],
					picture:   ['', [Validators.pattern(imgUrlRegex)]],
					firstName: ['', Validators.pattern(nameRegex)],
					lastName:  ['', Validators.pattern(nameRegex)],
				}
		);
	}
	
	bindFormControls()
	{
		this.usernameControl = this.basicInfoForm.get('username');
		this.emailControl = this.basicInfoForm.get('email');
		this.avatarControl = this.basicInfoForm.get('picture');
		this.firstNameControl = this.basicInfoForm.get('firstName');
		this.lastNameControl = this.basicInfoForm.get('lastName');
	}
	
	loadControls()
	{
		this.validations.usernameControl();
		this.validations.emailControl();
		this.validations.firstNameControl();
		this.validations.lastNameControl();
		this.validations.avatarControl();
	}
	
	deleteImg()
	{
		this.avatarControl.setValue('');
		this.basicInfoForm.markAsDirty();
	}
	
	loadClass(control: AbstractControl)
	{
		return control.dirty || control.touched
		       ? control.errors
		         ? 'form-control-danger'
		         : 'form-control-success'
		       : ''
	}
	
	private _applyTranslationOnSmartTable()
	{
		this._translateService.onLangChange.subscribe(() =>
		                                              {
			                                              this.loadControls();
		                                              });
	}
	
	private static hasError(control: AbstractControl)
	{
		return (control.touched || control.dirty) && control.errors;
	}
	
	private getAdminCreateObj(): IAdminUpdateObject
	{
		if(!this.avatarControl.value)
		{
			const letter = this.usernameControl.value.charAt(0).toUpperCase();
			this.avatarControl.setValue(CommonUtils.getDummyImage(300, 300, letter));
		}
		return {
			username:  this.usernameControl.value,
			email:     this.emailControl.value,
			firstName: this.firstNameControl.value,
			lastName:  this.lastNameControl.value,
			avatar:    this.avatarControl.value,
		};
	}
	
	private _translate(key: string): string
	{
		let translationResult = '';
		
		this._translateService.get(key).subscribe((res) =>
		                                          {
			                                          translationResult = res;
		                                          });
		
		return translationResult;
	}
	
	private async getUploaderPlaceholderText()
	{
		this.uploaderPlaceholder = await this._translateService
		                                     .get('PROFILE_VIEW.PICTURE_URL')
		                                     .pipe(first())
		                                     .toPromise();
	}
}
