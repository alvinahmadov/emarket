import { Injectable } from '@angular/core';
import { Apollo }     from 'apollo-angular';
import { map, share } from 'rxjs/operators';
import { Observable } from 'rxjs';
import IUser          from '@modules/server.common/interfaces/IUser';
import User           from '@modules/server.common/entities/User';
import { GQLQueries } from '@modules/server.common/utilities/graphql';

@Injectable()
export class UsersService
{
	constructor(private readonly _apollo: Apollo) {}

    getUsers(): Observable<User[]>
    {
        return this._apollo
		.watchQuery<{ users: IUser[] }>({
			                                query: GQLQueries.UserAll,
			                                pollInterval: 5000,
		                                })
		.valueChanges.pipe(
				map((res) => res.data.users),
				map((users) => users.map((user) => this._userFactory(user))),
				share()
		);
    }
	
	protected _userFactory(user: IUser)
	{
		return user == null ? null : new User(user);
	}
}
