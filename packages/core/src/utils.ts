// TODO: move all utils into shared/core

import { Observable } from 'rxjs';
import fs             from 'fs';

export function observeFile(fileName: string): Observable<string>
{
	return Observable.create((observer) =>
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
		
		                         return () =>
		                         {
			                         fs.unwatchFile(fileName, fetchTranslations);
		                         };
	                         });
}
