import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { first }      from 'rxjs/operators';

@Injectable()
export class ServerConnectionService
{
	public constructor(private readonly httpClient: HttpClient) {}
	
	public load(endPoint: string, store: { serverConnection: string })
	{
		return new Promise(async(resolve, reject) =>
		                   {
			                   await this.checkServerConnection(endPoint, store);
			
			                   resolve(true);
		                   });
	}
	
	public async checkServerConnection(
			endPoint: string,
			store: { serverConnection: string }
	)
	{
		try
		{
			await this.httpClient
			          .get(endPoint)
			          .pipe(first())
			          .toPromise();
		} catch(error)
		{
			store.serverConnection = error.status;
		}
	}
}
