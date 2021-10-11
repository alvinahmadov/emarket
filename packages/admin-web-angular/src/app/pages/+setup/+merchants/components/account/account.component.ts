import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { NgForm }                                     from '@angular/forms';

@Component({
	           selector:    'ea-merchants-setup-account',
	           styleUrls:   ['./account.component.scss'],
	           templateUrl: './account.component.html'
           })
export class SetupMerchantAccountComponent
{
	@ViewChild('accountForm', { static: true })
	accountForm: NgForm;
	
	@Output()
	previousStep: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output()
	nextStep: EventEmitter<boolean> = new EventEmitter<boolean>();
	
	accountModel = {
		email:          '',
		username:       '',
		password:       '',
		repeatPassword: '',
	};
	
	get formValid()
	{
		return (
				this.accountForm.valid &&
				this.accountModel.password === this.accountModel.repeatPassword
		);
	}
	
	emailChange()
	{
		let targetIndex = this.accountModel.email.indexOf('@');
		if(targetIndex > 0 && this.accountModel.username === '')
		{
			this.accountModel.username = this.accountModel.email.substring(0, targetIndex);
		}
	}
}
