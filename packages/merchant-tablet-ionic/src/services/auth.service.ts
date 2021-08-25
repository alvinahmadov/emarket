import { Injectable }                  from '@angular/core';
import { Apollo }                      from 'apollo-angular';
import bcrypt                          from 'bcryptjs';
import { environment }                 from "../environments/environment";
import Warehouse                       from '@modules/server.common/entities/Warehouse';
import { IWarehouseRegistrationInput } from '@modules/server.common/routers/IWarehouseAuthRouter';
import { GQLMutations }                from '@modules/server.common/utilities/graphql';
import { map, share }                  from 'rxjs/operators';
import { Observable }                  from 'rxjs';

export interface WarehouseLoginInfo
{
	warehouse: Warehouse;
	token: string;
}

export interface WarehouseRegisterInfo
{
	warehouse: Warehouse;
}

export interface WarehouseRegisterInput
{
	warehouse: Warehouse,
	password: string
}

@Injectable()
export class AuthService
{
	constructor(private readonly apollo: Apollo) {}
	
	public isAuthenticated(
			token: string
	): Observable<boolean>
	{
		try
		{
			return this.apollo
			           .mutate(
					           {
						           mutation: GQLMutations.WarehouseAuthenticated,
						           variables: {
							           token
						           },
					           })
			           .pipe(
					           map(result => result.data),
					           share<boolean>()
			           );
		} catch(e)
		{
			if(!environment.production)
			{
				console.error(e)
			}
		}
	}
	
	public login(
			username: string,
			password: string
	): Observable<WarehouseLoginInfo>
	{
		return this.apollo
		           .mutate<{ warehouseLogin: WarehouseLoginInfo }>(
				           {
					           mutation: GQLMutations.WarehouseLogin,
					           variables: {
						           username,
						           password,
					           },
				           })
		           .pipe(
				           map(result => result.data.warehouseLogin),
				           share<WarehouseLoginInfo>()
		           );
	}
	
	public register(
			input: IWarehouseRegistrationInput
	): Observable<WarehouseRegisterInfo>
	{
		const salt = bcrypt.genSaltSync(environment.WAREHOUSE_PASSWORD_BCRYPT_SALT_ROUNDS);
		input.warehouse.hash = bcrypt.hashSync(input.password, salt);
		
		return this.apollo
		           .mutate<{
			           warehouseRegister: WarehouseRegisterInput
		           }>(
				           {
					           mutation: GQLMutations.WarehouseRegister,
					           variables: {
						           input
					           },
				           })
		           .pipe(
				           map(result => result.data.warehouseRegister),
				           share<WarehouseRegisterInfo>()
		           );
	}
}
