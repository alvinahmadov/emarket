import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	      name: 'skipStatus',
	      pure: false,
      })
export class OrderStatusFilterPipe implements PipeTransform
{
	transform(items: [], state?: Boolean): any
	{
		if(!state)
		{
			return items;
		}
		
		return items.splice(0, 1).concat(items.splice(3));
	}
}
