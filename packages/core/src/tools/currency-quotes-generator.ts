import fs             from 'fs';
import path           from 'path';
import { HttpClient } from 'typed-rest-client/HttpClient';

function compareByCreateDate(d1: string, d2: string)
{
	if(new Date(d1).getTime() > new Date(d2).getTime())
	{
		return -1;
	}
	if(new Date(d1).getTime() < new Date(d2).getTime())
	{
		return 1;
	}
	return 0;
}

function formatDate(date: Date): string
{
	function pad(n)
	{
		if(n < 10)
			return '0' + n;
		return n;
	}
	
	return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
	       `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

export async function downloadCurrencyRates(
		apiUrl: string = 'https://www.cbr-xml-daily.ru/latest.js'
): Promise<string>
{
	const today = new Date();
	const relPath = `../../../cache/currency/currencies-${formatDate(today)}.json`;
	const client = new HttpClient("");
	const filePath = path.resolve(__dirname, relPath);
	const response = await client.get(apiUrl);
	const file: fs.WriteStream = fs.createWriteStream(filePath);
	
	if(response.message.statusCode !== 200)
	{
		const err: Error = new Error(`Unexpected HTTP response: ${response.message.statusCode}`);
		err["httpStatusCode"] = response.message.statusCode;
		throw err;
	}
	
	return new Promise<string>(
			(resolve, reject) =>
			{
				file.on("error", (err) => reject(err));
				
				const stream = response.message.pipe(file);
				
				stream.on("close", () =>
				{
					try
					{
						resolve(filePath);
					} catch(err)
					{
						reject(err);
					}
				});
			}
	);
}
