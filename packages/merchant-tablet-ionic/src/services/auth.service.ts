import { Injectable }                  from '@angular/core';
import { Apollo }                      from 'apollo-angular';
import { Observable }                  from 'rxjs';
import { map, share }                  from 'rxjs/operators';
import { IWarehouseCreateObject }      from '@modules/server.common/interfaces/IWarehouse';
import Warehouse                       from '@modules/server.common/entities/Warehouse';
import { IWarehouseRegistrationInput } from '@modules/server.common/routers/IWarehouseAuthRouter';
import ApolloService                   from '@modules/client.common.angular2/services/apollo.service';
import { GQLMutation }                 from 'graphql/definitions';

export interface WarehouseLoginInfo
{
	warehouse: Warehouse;
	token: string;
}

export interface WarehouseRegisterInput
{
	warehouse: Warehouse,
	password: string
}

@Injectable()
export class AuthService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo,
		      {
			      serviceName: "Merchant::AuthService"
		      })
	}
	
	public isAuthenticated(token: string): Observable<boolean>
	{
		return this.apollo
		           .mutate(
				           {
					           mutation:  GQLMutation.Store.IsAuthenticated,
					           variables: { token }
				           })
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	public login(
			username: string,
			password: string
	): Observable<WarehouseLoginInfo>
	{
		return this.apollo
		           .mutate<{
			           warehouseLogin: WarehouseLoginInfo
		           }>({
			              mutation:  GQLMutation.Store.Login,
			              variables: {
				              username,
				              password,
			              },
		              })
		           .pipe(
				           map(result => this.get(result)),
				           share()
		           );
	}
	
	public register(registerInput: IWarehouseRegistrationInput): Observable<Warehouse>
	{
		return this.apollo
		           .mutate<{
			           warehouse: IWarehouseCreateObject
		           }>(
				           {
					           mutation:  GQLMutation.Store.Register,
					           variables: { registerInput },
				           })
		           .pipe(
				           map((result) => <Warehouse>
						           this.factory(result, Warehouse)),
				           share()
		           );
	}
}
