import { env }                      from "env";
import { injectable }               from "inversify";
import faker                        from "faker";
import bcrypt                       from "bcryptjs";
import { IWarehouseCreateObject }   from "@modules/server.common/interfaces/IWarehouse";
import { IGeoLocationCreateObject } from "@modules/server.common/interfaces/IGeoLocation";
import ForwardOrdersMethod          from "@modules/server.common/enums/ForwardOrdersMethod";
import Warehouse                    from "@modules/server.common/entities/Warehouse";
import { Country }                  from "@modules/server.common/entities/GeoLocation";
import { WarehousesService }        from "../warehouses";

type FakeUserInput = {
	username: string;
	password: string;
	email: string;
	phone?: string
}

@injectable()
export class FakeWarehousesService
{
	constructor(
			private readonly _warehousesService: WarehousesService
	)
	{}
	
	async generateWarehouse(userInput: FakeUserInput): Promise<Warehouse>
	{
		const username = userInput.username;
		const password = userInput.password;
		const email = userInput.email;
		const phone = userInput.phone ?? faker.phone.phoneNumber("+7##########");
		const defaultLng = 55.7522;
		const defaultLat = 37.6156;
		const warehouseName = faker.company.companyName();
		const geoLocation: IGeoLocationCreateObject = {
			countryId: Country.RU,
			city: faker.address.city(Country.RU),
			house: `0`,
			loc: {
				type: 'Point',
				coordinates: [defaultLng, defaultLat]
			},
			postcode: faker.address.zipCode(),
			streetAddress: faker.address.streetAddress()
		};
		
		const existingWarehouse = await this._warehousesService
		                                    .Model
		                                    .findOne({ username: username });
		
		const salt = await bcrypt.genSalt(
				env.WAREHOUSE_PASSWORD_BCRYPT_SALT_ROUNDS
		);
		
		const hash = await bcrypt.hash(password, salt);
		
		if(!existingWarehouse)
		{
			let warehouseCreateObj: IWarehouseCreateObject = {
				username: username,
				name: warehouseName,
				isActive: true,
				hash: hash,
				inStoreMode: true,
				contactEmail: email,
				contactPhone: phone,
				geoLocation: geoLocation,
				logo: faker.image.business(300, 300),
				ordersEmail: null,
				ordersPhone: null,
				forwardOrdersUsing: [
					ForwardOrdersMethod.Email,
					ForwardOrdersMethod.Phone
				]
			};
			
			// init
			let warehouse = await this._warehousesService.create(warehouseCreateObj);
			
			// register
			return this._warehousesService.register({
				                                        warehouse: warehouse,
				                                        password: password
			                                        });
		}
	}
}
