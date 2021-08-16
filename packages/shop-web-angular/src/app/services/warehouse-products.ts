import { Apollo }     from 'apollo-angular';
import { Injectable } from '@angular/core';
import { GQLQueries } from '@modules/server.common/utilities/graphql';

@Injectable()
export class WarehouseProductsService
{
	constructor(private readonly apollo: Apollo) {}
	
	async getWarehouseProduct(warehouseId, warehouseProductId)
	{
		const res = await this.apollo
		                      .query({
			                             query: GQLQueries.WarehouseProduct,
			                             variables: { warehouseId, warehouseProductId },
		                             })
		                      .toPromise();
		
		return res.data['getWarehouseProduct'];
	}
}
