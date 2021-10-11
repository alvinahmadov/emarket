import faker              from 'faker';
import { Injectable }     from '@angular/core';
import { StorageService } from '@modules/server.common/StorageService';
import Order              from '@modules/server.common/entities/Order';
import GeoLocation        from '@modules/server.common/entities/GeoLocation';
import Customer           from '@modules/server.common/entities/Customer';
import CommonUtils        from '@modules/server.common/utilities/common';
import { environment }    from 'environments/environment';

const lng = environment['DEFAULT_LONGITUDE'];
const lat = environment['DEFAULT_LATITUDE'];

@Injectable()
export class AdminStorageService extends StorageService
{
	isConnected: boolean = false;
	
	order: Order | null = null;
	
	user: Customer | null = null;
	
	customerGeoLocation: GeoLocation =
			lng && lat
			? new GeoLocation({
				                  _id:           CommonUtils.generateObjectIdString(),
				                  _createdAt:    new Date().toString(),
				                  _updatedAt:    new Date().toString(),
				                  city:          faker.address.city(),
				                  postcode:      faker.address.zipCode('#####'),
				                  streetAddress: faker.address.streetAddress(true),
				                  house:         faker.random.number(100).toString(),
				                  countryId:     1,
				                  loc:           {
					                  type:        'Point',
					                  coordinates: { lat, lng },
				                  },
			                  })
			: null;
}
