import {
	AbstractControl,
	ValidationErrors,
	Validators,
	ValidatorFn
} from '@angular/forms';

export class PasswordValidator
{
	public static patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn
	{
		return (control: AbstractControl): { [key: string]: any } =>
		{
			if(!control.value)
			{
				// if control is empty return no error
				return null;
			}
			
			// test the value of the control against the regexp supplied
			const valid = regex.test(control.value);
			
			// if true, return no error (no error), else return error passed in the second parameter
			return valid ? null : error;
		};
	}
	
	public static passwordMatchValidator(control: AbstractControl)
	{
		// get password from our password form control
		const password: string = control.get('password').value;
		// get password from our confirmPassword form control
		const confirmPassword: string = control.get('confirmPassword').value;
		// compare is the password math
		if(password !== confirmPassword)
		{
			// if they don't match, set an error in our confirmPassword form control
			control.get('confirmPassword').setErrors({ NoPassswordMatch: true });
		}
	}
}

export const VALIDATORS_PROD = Validators.compose(
		[
			// 1. Password Field is Required
			Validators.required,
			// 2. Has a minimum length of characters
			Validators.minLength(5),
			// 3. check whether the entered password has a number
			PasswordValidator.patternValidator(/\d/, { hasNumber: true }),
			// 4. check whether the entered password has upper case letter
			PasswordValidator.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
			// 5. check whether the entered password has a lower-case letter
			PasswordValidator.patternValidator(/[a-z]/, { hasSmallCase: true }),
		]
);

export const VALIDATORS_DEV = Validators.compose(
		[
			// 1. Password Field is Required
			Validators.required,
			// 2. Has a minimum length of characters
			Validators.minLength(5),
		]
);
