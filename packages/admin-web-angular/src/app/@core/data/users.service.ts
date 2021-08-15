import { Injectable }                         from '@angular/core';
import { Apollo }                             from 'apollo-angular';
import { Observable }                         from 'rxjs';
import { map, share }                         from 'rxjs/operators';
import IUser, { IResponseGenerateCustomers, } from '@modules/server.common/interfaces/IUser';
import IPagingOptions                         from '@modules/server.common/interfaces/IPagingOptions';
import User                                   from '@modules/server.common/entities/User';
import { IUserRegistrationInput }             from '@modules/server.common/routers/IUserAuthRouter';
import { GQLMutations, GQLQueries }           from '@modules/server.common/utilities';

@Injectable()
export class UsersService
{
	constructor(private readonly _apollo: Apollo) {}
	
	isUserEmailExists(email: string): Promise<boolean>
	{
		return this._apollo
		           .query<{
			           isUserEmailExists: boolean
		           }>({
			              query: GQLQueries.UserEmailExists,
			              variables: { email },
		              })
		           .pipe(map((res) => res.data.isUserEmailExists))
		           .toPromise();
	}
	
	isUserExists(conditions: {
		exceptCustomerId: string;
		memberKey: string;
		memberValue: string;
	}): Observable<boolean>
	{
		return this._apollo
		           .query({
			                  query: GQLQueries.UserExists,
			                  variables: { conditions },
		                  })
		           .pipe(map((res) => res.data['isUserExists']));
	}
	
	getUsers(pagingOptions?: IPagingOptions): Observable<User[]>
	{
		return this._apollo
		           .watchQuery<{
			           users: IUser[]
		           }>(
				           {
					           query: GQLQueries.UserAllBy,
					           variables: { pagingOptions },
					           pollInterval: 5000,
				           }
		           )
		           .valueChanges
		           .pipe(
				           map((res) => res.data.users),
				           map((users) => users.map((user) => this._userFactory(user))),
				           share()
		           );
	}
	
	getUserById(id: string)
	{
		return this._apollo
		           .query({
			                  query: GQLQueries.UserById,
			                  variables: { id },
		                  })
		           .pipe(
				           map((res) => res.data['user']),
				           map((user) => this._userFactory(user)),
				           share()
		           );
	}
	
	removeByIds(ids: string[])
	{
		return this._apollo
		           .mutate({
			                   mutation: GQLMutations.UserRemoveById,
			                   variables: { ids },
		                   });
	}
	
	async registerUser(registerInput: IUserRegistrationInput)
	{
		const res = await this._apollo
		                      .mutate({
			                              mutation: GQLMutations.UserRegister,
			                              variables: { registerInput },
		                              })
		                      .toPromise();
		
		return res.data['registerUser'];
	}
	
	async banUser(id: string)
	{
		return this._apollo
		           .mutate({
			                   mutation: GQLMutations.UserBan,
			                   variables: { id },
		                   })
		           .toPromise();
	}
	
	async unbanUser(id: string)
	{
		return this._apollo
		           .mutate({
			                   mutation: GQLMutations.UserUnban,
			                   variables: { id },
		                   })
		           .toPromise();
	}
	
	async getCountOfUsers()
	{
		const res = await this._apollo
		                      .query({
			                             query: GQLQueries.UserCount,
		                             })
		                      .toPromise();
		
		return res.data['getCountOfUsers'];
	}
	
	async getCustomerMetrics(
			id: string
	): Promise<{
		totalOrders: number;
		canceledOrders: number;
		completedOrdersTotalSum: number;
	}>
	{
		const res = await this._apollo
		                      .query({
			                             query: GQLQueries.UserMetrics,
			                             variables: { id },
		                             })
		                      .toPromise();
		
		return res.data['getCustomerMetrics'];
	}
	
	generateCustomCustomers(
			qty: number = 1000,
			defaultLng: number,
			defaultLat: number
	): Observable<IResponseGenerateCustomers>
	{
		return this._apollo
		           .query<{
			           generate1000Customers: IResponseGenerateCustomers
		           }>({
			              query: GQLQueries.UserGenerateCustom,
			              variables: { qty, defaultLng, defaultLat },
		              })
		           .pipe(
				           map((res) =>
				               {
					               return res.data.generate1000Customers;
				               })
		           );
	}
	
	protected _userFactory(user: IUser)
	{
		return user == null ? null : new User(user);
	}
}
