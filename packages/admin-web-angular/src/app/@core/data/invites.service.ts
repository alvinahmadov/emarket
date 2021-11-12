import { Apollo }                                    from 'apollo-angular';
import { Injectable }                                from '@angular/core';
import { Observable }                                from 'rxjs';
import { map, share }                                from 'rxjs/operators';
import { ApolloQueryResult }                         from 'apollo-client';
import { countries, getCountryName, }                from '@modules/server.common/data/countries';
import { IInviteCreateObject, IInviteUpdateObject, } from '@modules/server.common/interfaces/IInvite';
import { ICoordinate, IGeoLocationCreateObject }     from '@modules/server.common/interfaces/IGeoLocation';
import IPagingOptions                                from '@modules/server.common/interfaces/IPagingOptions';
import Invite                                        from '@modules/server.common/entities/Invite';
import ApolloService                                 from '@modules/client.common.angular2/services/apollo.service';
import { InviteViewModel }                           from '@app/pages/+customers/+invites/invites.component';
import { environment }                               from 'environments/environment'
import { GQLMutation, GQLQuery }                     from 'graphql/definitions';

interface IRemoveInviteResponse
{
	n: number;
	ok: number;
}

@Injectable()
export class InvitesService extends ApolloService
{
	private readonly invites$: Observable<Invite[]>;
	
	constructor(apollo: Apollo)
	{
		super(apollo,
		      {
			      serviceName:  "Admin::InvitesService",
			      pollInterval: 5000
		      });
		this.invites$ = this.apollo
		                    .watchQuery<{
			                    invites: Invite[]
		                    }>({
			                       query:        GQLQuery.Invite.GetAll,
			                       pollInterval: this.pollInterval,
		                       }).valueChanges
		                    .pipe(
				                    map((result) => this.get(result)),
				                    share()
		                    );
	}
	
	public getAllInvitesRequests(): Observable<Invite[]>
	{
		return this.invites$;
	}
	
	public getInvites(pagingOptions?: IPagingOptions): Observable<Invite[]>
	{
		return this.apollo
		           .watchQuery<{
			           invites: Invite[]
		           }>({
			              query:        GQLQuery.Invite.GetAllWithPaging,
			              variables:    { pagingOptions },
			              pollInterval: this.pollInterval,
		              })
		           .valueChanges.pipe(
						map((result) => this.get(result)),
						share()
				);
	}
	
	public createInvite(createInput: IInviteCreateObject): Observable<Invite>
	{
		return this.apollo
		           .mutate<{
			           invite: IInviteCreateObject
		           }>({
			              mutation:  GQLMutation.Invite.Create,
			              variables: {
				              createInput,
			              },
		              })
		           .pipe(
				           map((result) => this.get(result) as Invite),
				           share()
		           );
	}
	
	public updateInvite(
			id: string,
			updateInput: IInviteUpdateObject
	): Observable<Invite>
	{
		return this.apollo
		           .mutate<{
			           updateInput: IInviteUpdateObject
		           }>({
			              mutation:  GQLMutation.Invite.Update,
			              variables: {
				              id,
				              updateInput,
			              },
		              })
		           .pipe(
				           map((result) => <Invite>
						           this.factory(result, Invite)),
				           share()
		           );
	}
	
	public removeByIds(ids: string[]): Observable<IRemoveInviteResponse>
	{
		return this.apollo
		           .mutate<{
			           response: IRemoveInviteResponse
		           }>({
			              mutation:  GQLMutation.Invite.RemoveByIds,
			              variables: { ids },
		              })
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	public async getCreateInviteObject(
			data: InviteViewModel,
			locale: string = 'en-US'
	): Promise<IInviteCreateObject>
	{
		const countryId = Object.values(countries)
		                        .indexOf(data.country)
		
		const res = await this._tryFindNewAddress(
				data.house,
				data.address,
				data.city,
				countryId,
				locale
		);
		
		const lat = Number(Number(res.lat).toFixed(7));
		const lng = Number(Number(res.lng).toFixed(7));
		
		const geoLocation: IGeoLocationCreateObject = {
			countryId:     countryId,
			city:          data.city,
			streetAddress: data.address,
			house:         data.house,
			loc:           {
				type:        'Point',
				coordinates: [Number(lng), Number(lat)],
			},
		};
		
		return {
			code:      data.invite,
			apartment: data.apartment,
			geoLocation,
		};
	}
	
	public async getCountOfInvites(): Promise<number>
	{
		return this.apollo
		           .query<{
			           count: number
		           }>({
			              query: GQLQuery.Invite.Count,
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public generateInvitesConnectedToInviteRequests(
			defaultLng: number,
			defaultLat: number,
			qty?: number
	): Observable<ApolloQueryResult<void>>
	{
		return this.apollo
		           .query({
			                  query:     GQLQuery.Invite.GenerateInvitesToInviteRequests,
			                  variables: { defaultLng, defaultLat, qty },
		                  });
	}
	
	private _tryFindNewAddress(
			house: string,
			streetAddress: string,
			city: string,
			countryId: number,
			locale?: string
	): Promise<ICoordinate>
	{
		const countryName = getCountryName(locale, countryId);
		const geocoder = new google.maps.Geocoder();
		
		return new Promise(
				(resolve) =>
				{
					geocoder.geocode(
							{
								address:               `${streetAddress} ${house}, ${city}`,
								componentRestrictions: {
									country: countryName,
								},
							},
							(results, status) =>
							{
								if(status === google.maps.GeocoderStatus.OK)
								{
									const place: google.maps.GeocoderResult = results[0];
									
									resolve(place.geometry.location.toJSON());
								}
								else
								{
									resolve({
										        lng: environment.DEFAULT_LONGITUDE,
										        lat: environment.DEFAULT_LATITUDE
									        });
								}
							}
					);
				}
		);
	}
}
