import { sample } from 'lodash';
import Order      from '../entities/Order';

namespace CommonUtils
{
	// tslint:disable-next-line:no-shadowed-variable
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
	
	export const generateObjectIdString = (
			m = Math,
			d = Date,
			h = 16,
			s = (x) => m.floor(x).toString(h)
	) =>
	{
		return (
				s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h))
		);
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
	
	export function validateEmail(email: string): boolean
	{
		const re = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
		return re.test(String(email).toLowerCase());
	}
}

export default CommonUtils;
