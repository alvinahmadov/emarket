import https                      from 'https';
import { Observable, Subscriber } from 'rxjs';
import fs                         from 'fs';
import {
	ICurrencyConverterResponse
}                                 from '@modules/server.common/data/currencies';
import { env }                    from './env';

export function observeFile(fileName: string): Observable<string>
{
	return Observable.create((observer: Subscriber<string>) =>
	                         {
		                         const fetchTranslations = () =>
		                         {
			                         fs.readFile(fileName, 'utf-8', (err, content) =>
			                         {
				                         observer.next(content);
				
				                         if(err)
				                         {
					                         observer.error(err);
				                         }
			                         });
		                         };
		
		                         fetchTranslations();
		
		                         fs.watchFile(fileName, fetchTranslations);
		
		                         return () => fs.unwatchFile(fileName, fetchTranslations);
	                         });
}

export function getCurrencyRates(
		fromCurrencyCode: string,
		toCurrencyCode: string
): Promise<ICurrencyConverterResponse>
{
	return new Promise(
			(resolve, reject) =>
			{
				let data: string = "";
				const url: string = `${env.CURRENCY_CONVERTER_URL}/convert?q=${fromCurrencyCode}_${toCurrencyCode}&apiKey=${env.CURRENCY_CONVERTER_API_KEY}`;
				https.get(url, (res) =>
				          {
					          res.on("error", (err) => reject(err))
					          if(res.statusCode !== 200)
					          {
						          reject(new Error(`HTTPS error: ${res.statusMessage} (${res.statusCode})`));
						          return;
					          }
					          res.on("data", (d) => data += d.toString())
					          res.on("end", () => resolve(JSON.parse(data) as ICurrencyConverterResponse));
				          }
				     )
				     .on("error", (err) => reject(err));
			}
	);
}

export async function convertCurrency(
		fromCurrencyCode: string,
		toCurrencyCode: string,
		amount: number
): Promise<number>
{
	const getKey = () => `${fromCurrencyCode}_${toCurrencyCode}`;
	const response = await getCurrencyRates(fromCurrencyCode, toCurrencyCode);
	if(response.results)
		return amount * response.results[getKey()].val;
	return 0.0;
}

export function splitHostAndPort(url: string): [string, number]
{
	function getChunks(url: string): string[]
	{
		url = url.match(/^(([a-z]+:)?(\/\/)?[^\/]+).*$/)[1] || url;
		return url.split(':');
	}
	
	const parts = getChunks(url);
	
	const scheme: string = parts[0];
	let host: string = parts[1].replace(/\//g, '');
	let port: number = parseInt(parts[parts.length - 1], 10);
	
	if((scheme === "http" || scheme === 'ws') && (isNaN(port) || parts.length < 3))
	{
		port = 80;
	}
	if((scheme === "https" || scheme === 'wss') && (isNaN(port) || parts.length < 3))
	{
		port = 443;
	}
	if(parts.length === 1 || isNaN(port))
	{
		host = "localhost"
		port = 80;
	}
	return [host, port];
}
