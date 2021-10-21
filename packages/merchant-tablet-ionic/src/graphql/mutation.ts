import gql from 'graphql-tag';

export namespace GQLMutation
{
	export namespace Carrier
	{
		export const Update = gql`
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
	}
	
	export namespace Promotion
	{
		export const Create = gql`
			mutation CreatePromotion($promotion: PromotionInput)
			{
				createPromotion(createInput: $promotion)
				{
					_id
				}
			}
		`;
		
		export const Update = gql`
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
		
		export const RemoveByIds = gql`
			mutation RemoveByIds($ids: [String!]!)
			{
				removePromotionsByIds(ids: $ids)
				{
					ok
					n
				}
			}
		`;
	}
	
	export namespace Store
	{
		export const IsAuthenticated = gql`
			mutation WarehouseAuthenticated(
				$token: String!
			)
			{
				isAuthenticated(
					token: $token
				)
			}
		`;
		
		export const CreateProduct = gql`
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
		
		export const SaveProduct = gql`
			mutation SaveProduct($product: ProductSaveInput!)
			{
				saveProduct(product: $product)
				{
					id
				}
			}
		`;
		
		export const Login = gql`
			mutation StoreLogin(
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
						name
						username
					}
					token
				}
			}
		`;
		
		export const Register = gql`
			mutation StoreRegister(
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
		
		export const RemoveByIds = gql`
			mutation RemoveByIds($ids: [String!]!)
			{
				removeWarehousesByIds(ids: $ids)
			}
		`;
		
		export const AddProducts = gql`
			mutation AddProducts(
				$storeId: String!
				$products: [WarehouseProductInput!]!
			)
			{
				addWarehouseProducts(
					storeId: $storeId
					products: $products
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
				$productsIds: [String!]!
			)
			{
				removeWarehouseProducts(
					storeId: $storeId
					productsIds: $productsIds
				)
			}
		`;
		
		export namespace Order
		{
			export const Create = gql`
				mutation CreateOrder($createInput: OrderCreateInput!)
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
						customer
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
	}
	
	export const StoreAuthenticated = gql`
		mutation WarehouseAuthenticated(
			$token: String!
		)
		{
			isAuthenticated(
				token: $token
			)
		}
	`;
}

export default GQLMutation;
