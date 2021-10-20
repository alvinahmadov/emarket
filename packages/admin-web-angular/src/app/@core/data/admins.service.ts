import { Injectable }            from '@angular/core';
import { Apollo }                from 'apollo-angular';
import { Observable }            from 'rxjs';
import { map, share }            from 'rxjs/operators';
import Admin                     from '@modules/server.common/entities/Admin';
import { IAdminUpdateObject }    from '@modules/server.common/interfaces/IAdmin';
import ApolloService             from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery, GQLMutation } from 'graphql/definitions';

@Injectable()
export class AdminsService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo, {
			serviceName:  AdminsService.name,
			pollInterval: 6000
		});
	}
	
	public getAdmin(id: string): Observable<Admin>
	{
		return this.apollo
		           .watchQuery<{
			           admin: Admin | null
		           }>({
			              query:        GQLQuery.Admin.GetById,
			              variables:    { id },
			              pollInterval: this.pollInterval,
		              })
		           .valueChanges
		           .pipe(
				           map((res) => this.get(res)),
				           share()
		           );
	}
	
	public updatePassword(
			id: string,
			password: { new: string; current: string }
	): Observable<any>
	{
		return this.apollo
		           .mutate({
			                   mutation:  GQLMutation.Admin.UpdatePassword,
			                   variables: { id, password },
		                   });
	}
	
	public updateById(
			id: string,
			updateInput: IAdminUpdateObject
	): Observable<Admin>
	{
		return this.apollo
		           .mutate<{
			           admin: Admin
		           }>({
			              mutation:  GQLMutation.Admin.Update,
			              variables: {
				              id,
				              updateInput,
			              },
		              })
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
}
