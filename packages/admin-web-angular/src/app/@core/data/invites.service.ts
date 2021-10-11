import { Apollo }                                    from 'apollo-angular';
import { Injectable }                                from '@angular/core';
import { Observable }                                from 'rxjs';
import { map, share }                                from 'rxjs/operators';
import { ApolloQueryResult }                         from 'apollo-client';
import { countries, getCountryName, }                from '@modules/server.common/data/countries';
import { IInviteCreateObject, IInviteUpdateObject, } from '@modules/server.common/interfaces/IInvite';
import { IGeoLocationCreateObject, ICoordinate }     from '@modules/server.common/interfaces/IGeoLocation';
import IPagingOptions                                from '@modules/server.common/interfaces/IPagingOptions';
import Invite                                        from '@modules/server.common/entities/Invite';
import { GQLMutations, GQLQueries }                  from '@modules/server.common/utilities/graphql';
import { environment }                               from 'environments/environment'
import { InviteViewModel }                           from '../../pages/+customers/+invites/invites.component';

interface IRemoveInviteResponse
{
	n: number;
	ok: number;
}

@Injectable()
export class InvitesService
{
	private readonly invites$: Observable<Invite[]>;
	
	constructor(private readonly apollo: Apollo)
	{
		this.invites$ = this.apollo
		                    .watchQuery<{
			                    invites: Invite[]
		                    }>({
			                       query:        GQLQueries.InviteAll,
			                       pollInterval: 2000,
		                       })
		                    .valueChanges.pipe(
						map((res) => res.data.invites),
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
			              query:        GQLQueries.InviteByPaging,
			              variables:    { pagingOptions },
			              pollInterval: 2000,
		              })
		           .valueChanges.pipe(
						map((res) => res.data.invites),
						share()
				);
	}
	
	public createInvite(createInput: IInviteCreateObject): Observable<Invite>
	{
		return this.apollo
		           .mutate<{
			           createInput: IInviteCreateObject
		           }>({
			              mutation:  GQLMutations.InviteCreate,
			              variables: {
				              createInput,
			              },
		              })
		           .pipe(
				           map((result: any) => result.data.createInvite),
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
			           id: string;
			           updateInput: IInviteUpdateObject
		           }>({
			              mutation:  GQLMutations.InviteUpdate,
			              variables: {
				              id,
				              updateInput,
			              },
		              })
		           .pipe(
				           map((result: any) => result.data.updateInvite),
				           share()
		           );
	}
	
	public removeByIds(ids: string[]): Observable<IRemoveInviteResponse>
	{
		return this.apollo
		           .mutate({
			                   mutation:  GQLMutations.InviteRemoveByIds,
			                   variables: { ids },
		                   })
		           .pipe(
				           map((result: any) => result.data.removeInvitesByIds),
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
				coordinates: {
					lng: lng,
					lat: lat
				},
				type:        'Point',
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
		const res = await this.apollo
		                      .query({
			                             query: GQLQueries.InviteCount,
		                             })
		                      .toPromise();
		
		return res.data['getCountOfInvites'];
	}
	
	public generate1000InvitesConnectedToInviteRequests(
			defaultLng: number,
			defaultLat: number
	): Observable<ApolloQueryResult<void>>
	{
		return this.apollo
		           .query({
			                  query:     GQLQueries.InviteFake,
			                  variables: { defaultLng, defaultLat },
		                  });
	}
	
	// noinspection DuplicatedCode
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
		
		return new Promise((resolve) =>
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
		                   });
	}
}
