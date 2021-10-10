import { sample } from 'lodash';
import Order from '../entities/Order';
import { Observable } from 'rxjs';
import fs from 'fs';

namespace CommonUtils
{
	export const millisToSeconds = (milliseconds: number): number => milliseconds / 1000;
	
	export const generateObjectIdString = (
			m = Math, d = Date,
			h           = 16, s   = (x) => m.floor(x).toString(h)
	) => s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h));
	
	export function toDate(date: string | Date)
	{
		if(date instanceof Date)
		{
			return date;
		}
		else
		{
			return new Date(date);
		}
	}
	
	export function dateComparator(d1: string | Date, d2: string | Date, order: "asc" | "dsc" = "asc")
	{
		const tm1 = toDate(d1).getTime();
		const tm2 = toDate(d2).getTime();
		
		if(order === "asc")
			return tm1 - tm2;
		else
			return tm2 - tm1;
		
	}
	
	export function generatedLogoColor()
	{
		return sample(['#269aff', '#ffaf26', '#8b72ff', '#0ecc9D']).replace(
				'#',
				''
		);
	}
	
	export const getDummyImage = (
			width: number,
			height: number,
			letter: string
	) =>
	{
		return `https://dummyimage.com/${width}x${height}/${CommonUtils.generatedLogoColor()}/ffffff.jpg&text=${letter}`;
	};
	
	export function getIdFromTheDate(order: Order): string
	{
		if(!order['createdAt'] || !order.orderNumber)
		{
			throw `Can't use getIdFromTheDate function. Property ${
					!order['createdAt'] ? 'createdAt' : 'orderNumber'
			} is missing!`;
		}
		const [day, month, year] = new Date(order['createdAt'])
				.toLocaleDateString()
				.split('/');
		
		let d = ('0' + day).slice(-2);
		d = d.substr(-2);
		let m = ('0' + month).slice(-2);
		m = m.substr(-2);
		
		return `${d}${m}${year}-${order.orderNumber}`;
	}
	
	export function getTotalDeliveryTime(order: Order): string
	{
		const start = order.createdAt;
		
		const end = new Date(order.deliveryTime);
		
		let delta = Math.abs(start.getTime() - end.getTime()) / 1000;
		
		const days = Math.floor(delta / 86400);
		delta -= days * 86400;
		
		const hours = Math.floor(delta / 3600) % 24;
		delta -= hours * 3600;
		
		const minutes = Math.floor(delta / 60) % 60;
		delta -= minutes * 60;
		
		const seconds = delta % 60;
		let secondsStr = seconds.toString();
		secondsStr = secondsStr.substring(0, secondsStr.indexOf('.'));
		
		let h = '0' + hours;
		h = h.substr(-2);
		let min = '0' + minutes;
		min = min.substr(-2);
		let sec = '0' + secondsStr;
		sec = sec.substr(-2);
		
		return `${days !== 0 ? days + 'days ' : ''}
            ${h} : ${min} : ${sec}`;
	}
	
	export function validateEmail(email: string): boolean
	{
		const re = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
		return re.test(String(email).toLowerCase());
	}
	
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
	
	/**
	 * gee
	 * @param {[number, number]} point - around which point
	 * @param {number} radius - in meters
	 * @returns {[number]}
	 */
	export function randomCoordinatesNear(
			[longitude, latitude]: [number, number],
			radius: number
	): [number, number]
	{
		const r = 100 / 111300; // = 100 meters
		const y0 = longitude;
		const x0 = latitude;
		const u = Math.random();
		const v = Math.random();
		const w = r * Math.sqrt(u);
		const t = 2 * Math.PI * v;
		const x = w * Math.cos(t);
		const y1 = w * Math.sin(t);
		const x1 = x / Math.cos(y0);
		
		return [y0 + y1, x0 + x1];
	}
	
	export function getHost(url: string): string
	{
		return getHostAndPort(url)[0];
	}
	
	export function getPort(url: string): number
	{
		return getHostAndPort(url)[1]
	}
	
	export function getHostAndPort(url: string): [string, number]
	{
		const parts = getUrlChunks(url);
		
		const scheme: string = parts[0];
		let host: string = parts[1].replace(/\//g, '');
		let port: number = parseInt(parts[parts.length - 1], 10);
		
		if((scheme === "http" || scheme === 'ws') && (isNaN(port) || parts.length < 3))
		{
			port = 80;
		}
		if((scheme === "https" || scheme === 'ws') && (isNaN(port) || parts.length < 3))
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
	
	function getUrlChunks(url: string): string[]
	{
		url = url.match(/^(([a-z]+:)?(\/\/)?[^\/]+).*$/)[1] || url;
		return url.split(':');
	}
}

export default CommonUtils;
