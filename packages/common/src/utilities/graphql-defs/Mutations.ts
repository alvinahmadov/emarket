import gql from "graphql-tag";

namespace GQLMutations
{
    // #Admin
	export const AdminLogin = gql`
		mutation Login($email: String!, $password: String!)
		{
			adminLogin(
				email: $email,
				password: $password
			)
			{
				token
				admin {
					_id
					id
					email
					name
					pictureUrl
				}
			}
		}
	`;
	
	export const AdminRegister = gql`
		mutation Register(
			$email: String!
			$fullName: String!
			$pictureUrl: String!
			$password: String!
		)
		{
			registerAdmin(
				registerInput:
				{
					admin:
					{
						email: $email
						name: $fullName
						pictureUrl: $pictureUrl
					}
					password: $password
				}
			)
			{
				_id
				id
				email
				pictureUrl
			}
		}
	`;
	
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
	
	export const DeviceCreate = gql`
		mutation CreateDevice($createInput: DeviceCreateInput!) {
			createDevice(createInput: $createInput) {
				id
			}
		}
	`;
	
	export const DeviceRemoveById = gql`
		mutation RemoveDeviceByIds($ids: [String!]!)
		{
			removeDeviceByIds(ids: $ids)
			{
				n
			}
		}
	`;
	
	export const DeviceUpdate = gql`
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
	
	export const InviteCreate = gql`
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

    // #Order
	
	export const OrderCreate = gql`
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

    // #Product
	
	export const ProductCreate = gql`
		mutation CreateProduct($product: ProductCreateInput!)
		{
			createProduct(product: $product)
			{
				id
				title
				{
					locale
					value
				}
				description
				{
					locale
					value
				}
				details
				{
					locale
					value
				}
				images
				{
					locale
					url
					width
					height
					orientation
				}
			}
		}
	`;
	
	export const ProductSave = gql`
		mutation SaveProduct($product: ProductSaveInput!) {
			saveProduct(product: $product) {
				id
			}
		}
	`;
	
	export const ProductRemoveByIds = gql`
		mutation RemoveProductsByIds($ids: [String!]!)
		{
			removeProductsByIds(ids: $ids)
			{
				n
			}
		}
	`;

    // #ProductCategory
	
	export const ProductCategoryCreate = gql`
		mutation CreateProductsCategory(
			$productsCategory: ProductsCategoriesCreateInput!
		)
		{
			createProductsCategory(createInput: $productsCategory)
			{
				id
				image
				name
				{
					locale
					value
				}
			}
		}
	`;
	
	export const ProductCategoryUpdate = gql`
		mutation UpdateProductsCategory(
			$id: String!
			$productsCategory: ProductsCategoriesCreateInput!
		)
		{
			updateProductsCategory(
				id: $id
				updateInput: $productsCategory
			)
			{
				id
				image
				name
				{
					locale
					value
				}
			}
		}
	`;
	
	export const ProductsCategoryRemoveByIds = gql`
		mutation removeProductsCategoriesByIds($ids: [String!]!)
		{
			removeProductsCategoriesByIds(ids: $ids)
			{
				ok
				n
			}
		}
	`;

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

    // #User
	
	export const UserRegister = gql`
		mutation RegisterUser($registerInput: UserRegisterInput!)
		{
			registerUser(registerInput: $registerInput)
			{
				id
				firstName
				lastName
			}
		}
	`;
	
	export const UserBan = gql`
		mutation BanUser($id: String!)
		{
			banUser(id: $id)
			{
				id
				firstName
				lastName
			}
		}
	`;
	
	export const UserUnban = gql`
		mutation UnbanUser($id: String!)
		{
			unbanUser(id: $id)
			{
				id
				firstName
				lastName
			}
		}
	`;
	
	export const UserRemoveById = gql`
		mutation RemoveUsersByIds($ids: [String!]!)
		{
			removeUsersByIds(ids: $ids)
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
