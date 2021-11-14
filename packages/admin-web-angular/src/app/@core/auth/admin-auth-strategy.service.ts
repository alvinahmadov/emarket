import { Injectable }                   from '@angular/core';
import { NbAuthResult, NbAuthStrategy } from '@nebular/auth';
import { ActivatedRoute }               from '@angular/router';
import { NbAuthStrategyClass }          from '@nebular/auth/auth.options';
import { Apollo }                       from 'apollo-angular';
import { from, Observable, of }         from 'rxjs';
import { catchError, map }              from 'rxjs/operators';
import Admin                            from '@modules/server.common/entities/Admin';
import CommonUtils                      from '@modules/server.common/utilities/common';
import { ApolloResult }                 from '@modules/client.common.angular2/services/apollo.service';
import { StorageService }               from '@app/@core/data/store.service';
import { GQLQuery, GQLMutation }        from 'graphql/definitions';
import { environment }                  from 'environments/environment';

interface IAdminLoginInfo
{
	admin: Admin;
	token: string;
	expiresIn?: string;
}

interface IAdminRegisterDto
{
	email: string;
	fullName: string;
	password: string;
	confirmPassword: string;
	terms: boolean;
}

interface IAuthOptions
{
	authInfo: string;
	password: string;
	rememberMe?: boolean | null;
}

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
	private debug: boolean = false;
	
	constructor(
			private apollo: Apollo,
			private route: ActivatedRoute,
			private storageService: StorageService
	)
	{
		super();
	}
	
	public static setup(options: { name: string }): [NbAuthStrategyClass, any]
	{
		return [AdminAuthStrategy, options];
	}
	
	// noinspection JSUnusedGlobalSymbols
	public getByEmail(email: string)
	{
		return this.apollo
		           .query<{
			           admin: Admin | null
		           }>({
			              query:     GQLQuery.Admin.GetByEmail,
			              variables: { email },
		              })
		           .pipe(map((result) => this.get(result)));
	}
	
	public authenticate(args: IAuthOptions): Observable<NbAuthResult>
	{
		const { authInfo, password } = args;
		const rememberMe = !!args.rememberMe;
		const expiresIn = rememberMe ? environment.JWT_EXPIRES_MAX : environment.JWT_EXPIRES_MIN;
		
		return this.apollo
		           .mutate<{
			           adminLogin: IAdminLoginInfo
		           }>({
			              mutation:    GQLMutation.Admin.Login,
			              variables:   { authInfo, password, expiresIn },
			              errorPolicy: 'all',
		              })
		           .pipe(
				           map(
						           (res) =>
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
							
							           this.storageService.adminId = data.adminLogin.admin.id;
							           this.storageService.token = data.adminLogin.token;
							
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
	
	public register(args: IAdminRegisterDto): Observable<NbAuthResult>
	{
		const { email, fullName, password, confirmPassword } = args;
		
		if(password !== confirmPassword)
		{
			return of(
					new NbAuthResult(false, null, null, [
						"The passwords don't match.",
					])
			);
		}
		
		const letter = fullName.charAt(0).toUpperCase();
		const avatar = CommonUtils.getDummyImage(300, 300, letter);
		
		return this.apollo
		           .mutate<{
			           registerAdmin: Admin
		           }>({
			              mutation:    GQLMutation.Admin.Register,
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
				           map((result) =>
				               {
					               const { errors } = result;
					
					               if(errors)
					               {
						               return new NbAuthResult(
								               false,
								               result,
								               AdminAuthStrategy.config.register.redirect.failure,
								               errors.map((err) => JSON.stringify(err))
						               );
					               }
					
					               return new NbAuthResult(
							               true,
							               result,
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
	
	public logout(): Observable<NbAuthResult>
	{
		return from(this._logout());
	}
	
	public requestPassword(data?: any): Observable<NbAuthResult>
	{
		throw new Error('Not implemented yet');
	}
	
	public resetPassword(data: any = {}): Observable<NbAuthResult>
	{
		throw new Error('Not implemented yet');
	}
	
	public refreshToken(data?: any): Observable<NbAuthResult>
	{
		throw new Error('Not implemented yet');
	}
	
	private async _logout(): Promise<NbAuthResult>
	{
		this.storageService.clear();
		
		this.storageService.serverConnection = '200';
		
		await this.apollo.getClient().resetStore();
		
		return new NbAuthResult(
				true,
				null,
				AdminAuthStrategy.config.logout.redirect.success,
				[],
				AdminAuthStrategy.config.logout.defaultMessages
		);
	}
	
	/**
	 * Property to get apollo result without specifying key of data
	 *
	 * @returns { R } Returns value of apollo result
	 * */
	protected get<T, R = T[keyof T]>(
			result: ApolloResult<T>,
			key?: string
	): R
	{
		try
		{
			const keys = Object.keys(result.data);
			
			if(!key)
			{
				if(keys && keys.length === 1)
				{
					key = keys[0];
				}
				else
				{
					throw new Error(`No key provided for apollo result for ${AdminAuthStrategy.name}`);
				}
			}
			
			if(this.debug)
			{
				if(!result)
				{
					console.warn(`Apollo result of type '${typeof result}' ` +
					             `returned null from service ${AdminAuthStrategy.name}`);
				}
				if(!result.data[key])
				{
					console.warn(`Apollo result of type '${typeof result.data[key]}' ` +
					             `returned null from service ${AdminAuthStrategy.name}`);
				}
				
				console.debug(`ApolloService get keys for service ${AdminAuthStrategy.name}`);
				console.debug(`${Object.keys(result.data)}: ${Object.entries(result.data)}`);
				console.debug(result.data[key]);
			}
			return result.data[key];
		} catch(e)
		{
			console.error(e);
			return null;
		}
	}
}
