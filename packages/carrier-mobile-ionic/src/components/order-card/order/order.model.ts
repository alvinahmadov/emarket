import gql                      from 'graphql-tag';
import { OrderProductFragment } from './product/product.model';

export const OrderFragment = gql`
	fragment OrderFragment on Order {
		id
		deliveryTime
		warehouseId
		deliveryTime
		createdAt
		user {
			id
			geoLocation {
				countryName
				countryId
				streetAddress
				house
				postcode
				notes
				house
				city
			}
		}
		warehouse {
			id
			logo
		}
		products {
			...OrderProductFragment
		}
	}
	${OrderProductFragment}
`;
