import { injectable }               from 'inversify';
import faker                        from 'faker';
import UserRole                     from '@modules/server.common/consts/role';
import { IWarehouseCreateObject }   from '@modules/server.common/interfaces/IWarehouse';
import { IGeoLocationCreateObject } from '@modules/server.common/interfaces/IGeoLocation';
import ForwardOrdersMethod          from '@modules/server.common/enums/ForwardOrdersMethod';
import Country                      from '@modules/server.common/enums/Country';
import Warehouse                    from '@modules/server.common/entities/Warehouse';
import Customer                     from '@modules/server.common/entities/Customer';
import { CustomersService }         from '../customers';
import {
	WarehousesService,
	WarehousesAuthService
}                                   from '../warehouses';

export declare type TestWarehouseUserGenerationInput = {
	username?: string;
	email?: string;
	password?: string;
	coordinates?: [number, number];
	role?: UserRole | string;
}

@injectable()
export class FakeWarehousesService
{
	constructor(
			private readonly usersService: CustomersService,
			private readonly warehousesService: WarehousesService,
			private readonly warehousesAuthService: WarehousesAuthService
	)
	{}
	
	async generateWarehouse(merchant: Customer, password: string): Promise<Warehouse | null>
	{
		if(merchant)
		{
			const warehouse = await this.getWarehouse({ 'merchant._id': merchant.id });
			if(warehouse)
			{
				return warehouse;
			}
			
			console.log('Creating new warehouse');
			let warehouseCreateObj: IWarehouseCreateObject;
			
			const warehouseName = faker.company.companyName();
			const phone = faker.phone.phoneNumber("+7##########");
			const ordersEmail = faker.internet.email();
			const ordersPhone = faker.phone.phoneNumber("+7##########");
			const logo = faker.image.business(300, 300);
			const geoLocation = FakeWarehousesService.generateGeolocation(37.6156, 55.7522);
			const isActive = true;
			const inStoreMode = true;
			
			console.log('Creating warehouse from merchant object', merchant);
			
			warehouseCreateObj = {
				username:           merchant.name,
				merchant:           merchant,
				name:               warehouseName,
				logo:               logo,
				geoLocation:        geoLocation,
				contactEmail:       merchant.email,
				contactPhone:       merchant.phone ?? phone,
				isActive:           isActive,
				inStoreMode:        inStoreMode,
				ordersEmail:        ordersEmail,
				ordersPhone:        ordersPhone,
				forwardOrdersUsing: [
					ForwardOrdersMethod.Email,
					ForwardOrdersMethod.Phone
				]
			};
			
			// Make customer as a new merchant
			await this.usersService.updateRole(merchant.id, 'merchant');
			
			return this.warehousesAuthService.register({
				                                           warehouse: warehouseCreateObj,
				                                           password:  password
			                                           });
		}
		
		return null;
	}
	
	private static generateGeolocation(lat: number, lng: number): IGeoLocationCreateObject
	{
		return {
			countryId:     Country.RU,
			city:          faker.address.city(),
			house:         `0`,
			loc:           {
				type:        'Point',
				coordinates: [lng, lat]
			},
			postcode:      faker.address.zipCode(),
			streetAddress: faker.address.streetAddress()
		};
	}
	
	private async getWarehouse(findObj)
	{
		return await this.warehousesService.findOne(findObj);
	}
}
