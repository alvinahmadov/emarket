import gql from 'graphql-tag';

export namespace GQLMutation
{
	export namespace Admin
	{
		export const Login = gql`
			mutation AdminLogin(
				$email: String!,
				$password: String!
			)
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
						username
						avatar
					}
				}
			}
		`;
		
		export const Register = gql`
			mutation Register(
				$email: String!
				$fullName: String!
				$avatar: String!
				$password: String!
			)
			{
				registerAdmin(
					registerInput:
					{
						admin:
						{
							email: $email
							username: $fullName
							avatar: $avatar
						}
						password: $password
					}
				)
				{
					_id
					id
					email
					avatar
				}
			}
		`;
		
		export const UpdatePassword = gql`
			mutation UpdateAdminPassword(
				$id: String!
				$password: AdminPasswordUpdateInput!
			)
			{
				updateAdminPassword(id: $id, password: $password)
			}
		`;
		
		export const Update = gql`
			mutation UpdateAdmin(
				$id: String!
				$updateInput: AdminUpdateInput!
			)
			{
				updateAdmin(id: $id, updateInput: $updateInput)
				{
					id
					username
					email
					avatar
					firstName
					lastName
				}
			}
		`;
	}
	
	export namespace Carrier
	{
		export const RemoveByIds = gql`
			mutation RemoveCarriersByIds(
				$ids: [String!]!
			)
			{
				removeCarriersByIds(ids: $ids)
			}
		`;
	}
	
	export namespace Currency
	{
		export const Create = gql`
			mutation CreateCurrency(
				$createInput: CurrencyCreateInput!
			)
			{
				createCurrency(createInput: $createInput) {
					success
					message
					data {
						name
						code
						sign
					}
				}
			}
		`;
	}
	
	export namespace Customer
	{
		export const Register = gql`
			mutation RegisterCustomer($registerInput: CustomerRegisterInput!)
			{
				registerCustomer(registerInput: $registerInput)
				{
					_id
					id
					firstName
					lastName
				}
			}
		`;
		
		export const RemoveByIds = gql`
			mutation RemoveCustomersByIds($ids: [String!]!)
			{
				removeCustomersByIds(ids: $ids)
			}
		`;
		
		export const Ban = gql`
			mutation BanCustomer($id: String!)
			{
				banCustomer(id: $id)
				{
					_id
					id
					username
					firstName
					lastName
					isBanned
				}
			}
		`;
		
		export const Unban = gql`
			mutation UnbanCustomer($id: String!)
			{
				unbanCustomer(id: $id)
				{
					_id
					id
					username
					firstName
					lastName
					isBanned
				}
			}
		`;
	}
	
	export namespace Device
	{
		export const Create = gql`
			mutation CreateDevice($createInput: DeviceCreateInput!)
			{
				createDevice(createInput: $createInput)
				{
					id
				}
			}
		`;
		
		export const Update = gql`
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
		
		export const RemoveById = gql`
			mutation RemoveDeviceByIds($ids: [String!]!)
			{
				removeDeviceByIds(ids: $ids)
				{
					n
					ok
				}
			}
		`;
	}
	
	export namespace Invite
	{
		export const Create = gql`
			mutation CreateInvite($createInput: InviteCreateInput!)
			{
				createInvite(createInput: $createInput)
				{
					_id
					id
					geoLocation {
						countryId
						countryName
						city
						streetAddress
						house
						coordinates
						{
							lng
							lat
						}

						loc
						{
							type
							coordinates
						}
					}
				}
			}
		`;
		
		export const Update = gql`
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
		
		export const RemoveByIds = gql`
			mutation RemoveInvitesByIds($ids: [String!]!)
			{
				removeInvitesByIds(ids: $ids)
				{
					n
				}
			}
		`;
	}
	
	export namespace InviteRequest
	{
		export const Create = gql`
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
		
		export const Update = gql`
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
		`;
		
		export const RemoveByIds = gql`
			mutation RemoveInvitesRequestsByIds($ids: [String!]!)
			{
				removeInvitesRequestsByIds(ids: $ids)
				{
					n
				}
			}
		`;
	}
	
	export namespace Product
	{
		export const Create = gql`
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
		
		export const Save = gql`
			mutation SaveProduct($product: ProductSaveInput!) {
				saveProduct(product: $product) {
					id
				}
			}
		`;
		
		export const RemoveByIds = gql`
			mutation RemoveProductsByIds($ids: [String!]!)
			{
				removeProductsByIds(ids: $ids)
				{
					n
				}
			}
		`;
	}
	
	export namespace ProductCategory
	{
		export const Create = gql`
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
		
		export const Update = gql`
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
		
		export const RemoveByIds = gql`
			mutation removeProductsCategoriesByIds($ids: [String!]!)
			{
				removeProductsCategoriesByIds(ids: $ids)
				{
					ok
					n
				}
			}
		`;
	}
	
	export namespace Store
	{
		export const RemoveByIds = gql`
			mutation RemoveByIds($ids: [String!]!)
			{
				removeWarehousesByIds(ids: $ids)
			}
		`;
		
		export namespace Product
		{
			export const AddProducts = gql`
				mutation AddProducts(
					$storeId: String!
					$storeProducts: [WarehouseProductInput!]!
				)
				{
					addWarehouseProducts(
						storeId: $storeId
						storeProducts: $storeProducts
					)
					{
						product
						{
							id
							title {
								value
								locale
							}
							categories
						}
					}
				}
			`;
			
			export const RemoveProducts = gql`
				mutation RemoveProductsByIds(
					$storeId: String!
					$storeProductIds: [String!]!
				)
				{
					removeWarehouseProducts(
						storeId: $storeId
						storeProductIds: $storeProductIds
					)
				}
			`;
		}
		
		export namespace Order
		{
			export const Create = gql`
				mutation MakeOrder($createInput: OrderCreateInput!)
				{
					createOrder(createInput: $createInput)
					{
						_id
						carrierStatus
						isConfirmed
						warehouseId
						warehouseStatus
						customer
						{
							_id
						}
						carrier
						{
							_id
						}
						_createdAt
						_updatedAt
					}
				}
			`;
		}
	}
}

export default GQLMutation;
