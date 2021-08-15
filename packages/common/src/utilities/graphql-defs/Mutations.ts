import gql from "graphql-tag";

namespace GQLMutations
{
    // #Admin
	export const AdminUpdatePassword = gql`
		mutation UpdateAdminPassword(
			$id: String!
			$password: AdminPasswordUpdateInput!
		)
		{
			updateAdminPassword(id: $id, password: $password)
		}
	`;
	
	export const AdminUpdate = gql`
		mutation UpdateAdmin(
			$id: String!
			$updateInput: AdminUpdateInput!
		)
		{
			updateAdmin(id: $id, updateInput: $updateInput)
			{
				id
				name
				email
				pictureUrl
				firstName
				lastName
			}
		}
	`;
	
	export const AdminRemoveCarriersByIds = gql`
		mutation RemoveCarriersByIds($ids: [String!]!)
		{
			removeCarriersByIds(ids: $ids)
		}
	`;

// #Carriers
	
	export const CarrierUpdate = gql`
		mutation UpdateCarrier(
			$id: String!
			$updateInput: CarrierUpdateInput!
		)
		{
			updateCarrier(id: $id, updateInput: $updateInput)
			{
				id
			}
		}
	`;

// #Currencies
	
	export const CurrencyCreate = gql`
		mutation CreateCurrency($createInput: CurrencyCreateInput!)
		{
			createCurrency(createInput: $createInput) {
				success
				message
				data {
					currencyCode
				}
			}
		}`;

// #Devices
	
	export const DevicesCreate = gql`
		mutation CreateDevice($createInput: DeviceCreateInput!) {
			createDevice(createInput: $createInput) {
				id
			}
		}
	`;
	
	export const DevicesRemoveById = gql`
		mutation RemoveDeviceByIds($ids: [String!]!)
		{
			removeDeviceByIds(ids: $ids)
			{
				n
			}
		}
	`;
	
	export const DevicesUpdate = gql`
		mutation UpdateDevice(
			$deviceId: String!
			$updateInput: DeviceUpdateInput!
		)
		{
			updateDevice(id: $deviceId, updateInput: $updateInput)
			{
				id
			}
		}
	`;

// Geolocationn
	
	export const GeoLocationMakeOrder = gql`
		mutation MakeOrder($createInput: OrderCreateInput!)
		{
			createOrder(createInput: $createInput)
			{
				_id
				_createdAt
				_updatedAt
				carrierStatus
				isConfirmed
				warehouseId
				warehouseStatus
				user
				{
					_id
				}
				carrier
				{
					_id
				}
			}
		}
	`;

// #Invites
	
	export const InvitesCreate = gql`
		mutation CreateInvite($createInput: InviteCreateInput!)
		{
			createInvite(createInput: $createInput)
			{
				id
			}
		}
	`;
	
	export const InviteUpdate = gql`
		mutation UpdateInvite(
			$id: String!
			$updateInput: InviteUpdateInput!
		)
		{
			updateInvite(
				id: $id,
				updateInput: $updateInput
			)
			{
				id
			}
		}
	`;
	
	export const InviteRemoveByIds = gql`
		mutation RemoveInvitesByIds($ids: [String!]!)
		{
			removeInvitesByIds(ids: $ids)
			{
				n
			}
		}
	`;
	
	export const InviteRequestCreate = gql`
		mutation CreateInviteRequest(
			$createInput: InviteRequestCreateInput!
		)
		{
			createInviteRequest(createInput: $createInput)
			{
				id
			}
		}
	`;
	
	export const InviteRequestsRemoveByIds = gql`
		mutation RemoveInvitesRequestsByIds($ids: [String!]!)
		{
			removeInvitesRequestsByIds(ids: $ids)
			{
				n
			}
		}
	`
	
	export const InviteRequestUpdate = gql`
		mutation UpdateInviteRequest(
			$id: String!
			$updateInput: InviteRequestUpdateInput!
		)
		{
			updateInviteRequest(
				id: $id
				updateInput: $updateInput
			)
			{
				id
			}
		}
	`

// #Promotion
	
	export const PromotionCreate = gql`
		mutation CreatePromotion($promotion: PromotionInput)
		{
			createPromotion(createInput: $promotion)
			{
				_id
			}
		}
	`;
	
	export const PromotionUpdate = gql`
		mutation UpdatePromotion(
			$id: String
			$promotion: PromotionInput
		)
		{
			updatePromotion(id: $id, updateInput: $promotion)
			{
				_id
			}
		}
	`;
	
	export const PromotionRemoveByIds = gql`
		mutation RemoveByIds($ids: [String!]!)
		{
			removePromotionsByIds(ids: $ids)
			{
				ok
				n
			}
		}
	`;

// #Warehouses
	
	export const WarehouseLogin = gql`
		mutation WarehouseLogin(
			$username: String!
			$password: String!
		)
		{
			warehouseLogin(
				username: $username
				password: $password
			)
			{
				warehouse
				{
					id
				}
				token
			}
		}
	`;
	
	export const WarehouseRegister = gql`
		mutation WarehouseRegister(
			$registerInput: WarehouseRegisterInput!
		)
		{
			registerWarehouse(
				registerInput: $registerInput
			)
			{
				id
				name
				isActive
				inStoreMode
			}
		}
	`;
	
	export const WarehouseAddProducts = gql`
		mutation AddProducts(
			$warehouseId: String!
			$products: [WarehouseProductInput!]!
		)
		{
			addWarehouseProducts(
				warehouseId: $warehouseId
				products: $products
			)
			{
				product
				{
					id
					title
					categories
				}
			}
		}
	`;
	
	export const WarehouseSaveProduct = gql`
		mutation SaveProduct($product: ProductSaveInput!)
		{
			saveProduct(product: $product)
			{
				id
			}
		}
	`;
	
	export const WarehouseRemoveByIds = gql`
		mutation RemoveByIds($ids: [String!]!)
		{
			removeWarehousesByIds(ids: $ids)
		}
	`;
	
	export const WarehouseRemoveProducts = gql`
		mutation RemoveProductsByIds(
			$warehouseId: String!
			$productsIds: [String!]!
		)
		{
			removeWarehouseProducts(
				warehouseId: $warehouseId
				productsIds: $productsIds
			)
		}
	`;

// #WarehouseOrders
	
	export const StoreOrdersMakeOrder = gql`
		mutation MakeOrder($createInput: OrderCreateInput!)
		{
			createOrder(createInput: $createInput)
			{
				_id
				_createdAt
				_updatedAt
				carrierStatus
				isConfirmed
				warehouseId
				warehouseStatus
				user
				{
					_id
				}
				carrier
				{
					_id
				}
			}
		}
	`;
}

export default GQLMutations;
