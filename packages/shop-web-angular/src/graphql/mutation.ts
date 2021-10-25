import gql from 'graphql-tag';

export namespace GQLMutation
{
	export namespace Customer
	{
		export const Login = gql`
			mutation CustomerLogin(
				$email: String!,
				$password: String!
			)
			{
				customerLogin(
					email: $email,
					password: $password
				)
				{
					user
					{
						_id
						id
						username
						email
						firstName
						lastName
						role
						geoLocation{
							loc
							{
								type
								coordinates
							}
						}
					}
					token
				}
			}
		`;
		
		export const Register = gql`
			mutation CustomerRegister($registerInput: CustomerRegisterInput!)
			{
				registerCustomer(registerInput: $registerInput)
				{
					_id
					id
					username
					firstName
					lastName
					email
					role
					geoLocation
					{
						loc
						{
							type
							coordinates
						}
					}
				}
			}
		`;
		
		export const UpdatePassword = gql`
			mutation UpdateCustomerPassword(
				$id: String!
				$password: CustomerPasswordUpdateInput!
			)
			{
				updateCustomerPassword(id: $id , password: $password)
			}
		`;
		
		export const Update = gql`
			mutation UpdateCustomer(
				$id: String!
				$updateObject: CustomerUpdateObjectInput!
			)
			{
				updateCustomer(id: $id, updateObject: $updateObject)
				{
					id
				}
			}
		`;
	}
	
	export namespace Store
	{
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
		
		export namespace Product
		{
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
		}
		
		export namespace Orders
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
}

export default GQLMutation;
