import { Injectable }                   from '@angular/core';
import { NbAuthResult, NbAuthStrategy } from '@nebular/auth';
import { ActivatedRoute }               from '@angular/router';
import { NbAuthStrategyClass }          from '@nebular/auth/auth.options';
import { Apollo }                       from 'apollo-angular';
import { from, Observable, of }         from 'rxjs';
import { catchError, map }              from 'rxjs/operators';
import { GQLMutations, GQLQueries }     from '@modules/server.common/utilities/graphql'
import CommonUtils                      from '@modules/server.common/utilities/common';
import { Store }                        from '@app/@core/data/store.service';

@Injectable()
export class AdminAuthStrategy extends NbAuthStrategy
{
	private static config = {
		login:       {
			redirect:        {
				success: '/',
				failure: null,
			},
			defaultErrors:   [
				'Login/Email combination is not correct, please try again.',
			],
			defaultMessages: ['You have been successfully logged in.'],
		},
		register:    {
			redirect:        {
				success: '/',
				failure: null,
			},
			defaultErrors:   ['Something went wrong, please try again.'],
			defaultMessages: ['You have been successfully registered.'],
		},
		logout:      {
			redirect:        {
				success: '/',
				failure: null,
			},
			defaultErrors:   ['Something went wrong, please try again.'],
			defaultMessages: ['You have been successfully logged out.'],
		},
		requestPass: {
			redirect:        {
				success: '/',
				failure: null,
			},
			defaultErrors:   ['Something went wrong, please try again.'],
			defaultMessages: [
				'Reset password instructions have been sent to your email.',
			],
		},
		resetPass:   {
			redirect:              {
				success: '/',
				failure: null,
			},
			resetPasswordTokenKey: 'reset_password_token',
			defaultErrors:         ['Something went wrong, please try again.'],
			defaultMessages:       ['Your password has been successfully changed.'],
		},
	};
	
	constructor(
			private apollo: Apollo,
			private route: ActivatedRoute,
			private store: Store
	)
	{
		super();
	}
	
	static setup(options: { name: string }): [NbAuthStrategyClass, any]
	{
		return [AdminAuthStrategy, options];
	}
	
	getByEmail(email: string)
	{
		return this.apollo
		           .query({
			                  query:     GQLQueries.AdminByEmail,
			                  variables: { email },
		                  })
		           .pipe(map((res) => res.data['adminByEmail']));
	}
	
	authenticate(args: {
		email: string;
		password: string;
		rememberMe?: boolean | null;
	}): Observable<NbAuthResult>
	{
		const { email, password } = args;
		
		// TODO implement remember me feature
		const rememberMe = !!args.rememberMe;
		
		return this.apollo
		           .mutate({
			                   mutation:    GQLMutations.AdminLogin,
			                   variables:   { email, password },
			                   errorPolicy: 'all',
		                   })
		           .pipe(
				           map(
						           (res: any) =>
						           {
							           const { data, errors } = res;
							           const isSuccessful = !!data.adminLogin;
							
							           if(errors)
							           {
								           return new NbAuthResult(
										           false,
										           res,
										           AdminAuthStrategy.config.login.redirect.failure,
										           errors.map((err) => JSON.stringify(err))
								           );
							           }
							
							           if(!isSuccessful)
							           {
								           return new NbAuthResult(
										           false,
										           res,
										           AdminAuthStrategy.config.login.redirect.failure,
										           AdminAuthStrategy.config.login.defaultErrors
								           );
							           }
							
							           this.store.adminId = data.adminLogin.admin.id;
							           this.store.token = data.adminLogin.token;
							
							           return new NbAuthResult(
									           isSuccessful,
									           res,
									           AdminAuthStrategy.config.login.redirect.success,
									           [],
									           AdminAuthStrategy.config.logout.defaultMessages
							           );
						           }
				           ),
				           catchError((err) =>
				                      {
					                      console.error(err);
					
					                      return of(
							                      new NbAuthResult(
									                      false,
									                      err,
									                      AdminAuthStrategy.config.login.defaultErrors,
									                      [AdminAuthStrategy.config.logout.defaultErrors]
							                      )
					                      );
				                      })
		           );
	}
	
	register(args: {
		email: string;
		fullName: string;
		password: string;
		confirmPassword: string;
		terms: boolean;
	}): Observable<NbAuthResult>
	{
		const { email, fullName, password, confirmPassword, terms } = args;
		
		if(password !== confirmPassword)
		{
			return Observable.of(
					new NbAuthResult(false, null, null, [
						"The passwords don't match.",
					])
			);
		}
		
		const letter = fullName.charAt(0).toUpperCase();
		const avatar = CommonUtils.getDummyImage(300, 300, letter);
		
		return this.apollo
		           .mutate({
			                   mutation:    GQLMutations.AdminRegister,
			                   variables:   {
				                   email,
				                   fullName,
				                   password,
				                   avatar,
			                   },
			                   errorPolicy: 'all',
		                   })
		           .pipe(
				           /*
				            res: { data: { registerAdmin: Admin }; errors }
				            */
				           map((res: any) =>
				               {
					               const { data, errors } = res;
					               const admin = data.registerAdmin;
					
					               if(errors)
					               {
						               return new NbAuthResult(
								               false,
								               res,
								               AdminAuthStrategy.config.register.redirect.failure,
								               errors.map((err) => JSON.stringify(err))
						               );
					               }
					
					               return new NbAuthResult(
							               true,
							               res,
							               AdminAuthStrategy.config.register.redirect.success,
							               [],
							               AdminAuthStrategy.config.register.defaultMessages
					               );
				               }),
				           catchError((err) =>
				                      {
					                      console.error(err);
					
					                      return of(
							                      new NbAuthResult(
									                      false,
									                      err,
									                      AdminAuthStrategy.config.register.defaultErrors,
									                      [AdminAuthStrategy.config.logout.defaultErrors]
							                      )
					                      );
				                      })
		           );
	}
	
	logout(): Observable<NbAuthResult>
	{
		return from(this._logout());
	}
	
	requestPassword(data?: any): Observable<NbAuthResult>
	{
		throw new Error('Not implemented yet');
	}
	
	resetPassword(data: any = {}): Observable<NbAuthResult>
	{
		throw new Error('Not implemented yet');
	}
	
	refreshToken(data?: any): Observable<NbAuthResult>
	{
		throw new Error('Not implemented yet');
	}
	
	private async _logout(): Promise<NbAuthResult>
	{
		this.store.clear();
		
		this.store.serverConnection = '200';
		
		await this.apollo.getClient().resetStore();
		
		return new NbAuthResult(
				true,
				null,
				AdminAuthStrategy.config.logout.redirect.success,
				[],
				AdminAuthStrategy.config.logout.defaultMessages
		);
	}
}
