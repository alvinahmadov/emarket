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
			export const Add = gql`
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
			
			export const Remove = gql`
				mutation RemoveWarehouseProducts(
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
			
			export const Update = gql`
				mutation UpdateWarehouseProduct(
					$storeId: String!
					$storeProductId: String!
					$updateInput: WarehouseProductUpdateInput!
				)
				{
					updateWarehouseProduct(
						storeId: $storeId
						storeProductId: $storeProductId
						updateInput: $updateInput
					)
					{
						id
						_id
						price
						initialPrice
						count
						soldCount
						product
						{
							description
							{
								value
								locale
							}
							_id
							id
							title
							{
								value
								locale
							}
							details
							{
								value
								locale
							}
							images
							{
								locale
								url
								orientation
								width
								height
							}
							categories
							_createdAt
							_updatedAt
						}
						comments
						{
							id
							_id
							userId
							productId
							message
							likes
							dislikes
							likesBy
							dislikesBy
							replyTo
							_createdAt
							_updatedAt
						}
						rating
						{
							rate
							ratedBy
						}
						viewsCount
						deliveryTimeMin
						deliveryTimeMax
						isCarrierRequired
						isDeliveryRequired
						isManufacturing
						isTakeaway
					}
				}
			`;
			
			export const UpdateRating = gql`
				mutation ChangeRate(
					$storeId: String!
					$storeProductId: String!
					$customerId: String!
					$count: Int!
				){
					changeWarehouseProductRating(
						storeId: $storeId
						storeProductId: $storeProductId
						customerId: $customerId
						count: $count
					)
					{
						id
						_id
						rating {
							rate
							ratedBy
						}
					}
				}
			`;
			
			export const UpdatePrice = gql`
				mutation ChangeWarehouseProductRating(
					$storeId: String!
					$storeProductId: String!
					$customerId: String!
					$count: Int!
				){
					changeWarehouseProductRating(
						storeId: $storeId
						storeProductId: $storeProductId
						customerId: $customerId
						count: $count
					)
					{
						id
						_id
						price
						initialPrice
						product{
							id
							_id
						}
					}
				}
			`
			
			export const UpdateAvailability = gql`
				mutation ChangeStoreProductAvailability(
					$storeId: String!
					$storeProductId: String!
					$isAvailable: Boolean!
				)
				{
					changeWarehouseProductAvailability(
						storeId: $storeId,
						storeProductId: $storeProductId,
						isAvailable: $isAvailable
					)
					{
						id
						_id
						isProductAvailable
					}
				}
			`;
			
			export const UpdateTakeaway = gql`
				mutation ChangeStoreProductTakeaway(
					$storeId: String!
					$storeProductId: String!
					$isTakeaway: Boolean!
				)
				{
					changeWarehouseProductTakeaway(
						storeId: $storeId,
						storeProductId: $storeProductId,
						isTakeaway: $isTakeaway
					)
					{
						id
						_id
						isTakeaway
					}
				}
			`;
			
			export const UpdateDelivery = gql`
				mutation ChangeStoreProductDelivery(
					$storeId: String!
					$storeProductId: String!
					$isDelivery: Boolean!
				)
				{
					changeWarehouseProductDelivery(
						storeId: $storeId,
						storeProductId: $storeProductId,
						isDelivery: $isDelivery
					)
					{
						id
						_id
						isDeliveryRequired
						deliveryTimeMin
						deliveryTimeMax
					}
				}
			`;
			
			export const IncreaseCount = gql`
				mutation IncreaseWarehouseProductCount(
					$storeId: String!,
					$storeProductId: String!,
					$count: Int!
				)
				{
					increaseWarehouseProductCount(
						storeId: $storeId
						storeProductId: $storeProductId
						count: $count
					)
					{
						id
						_id
						count
						soldCount
						viewsCount
						deliveryTimeMin
						deliveryTimeMax
						isCarrierRequired
						isDeliveryRequired
						isManufacturing
						isTakeaway
					}
				}
			`;
			
			export const IncreaseSoldCount = gql`
				mutation IncreaseWarehouseProductSoldCount(
					$storeId: String!,
					$storeProductId: String!,
					$count: Int!
				)
				{
					increaseWarehouseProductSoldCount(
						storeId: $storeId
						storeProductId: $storeProductId
						count: $count
					)
					{
						id
						_id
						count
						soldCount
						viewsCount
						deliveryTimeMin
						deliveryTimeMax
						isCarrierRequired
						isDeliveryRequired
						isManufacturing
						isTakeaway
					}
				}
			`;
			
			export const IncreaseViewsCount = gql`
				mutation IncreaseWarehouseProductViewsCount(
					$storeId: String!,
					$storeProductId: String!,
					$count: Int!
				)
				{
					increaseWarehouseProductViewsCount(
						storeId: $storeId
						storeProductId: $storeProductId
						count: $count
					)
					{
						id
						_id
						count
						soldCount
						viewsCount
						deliveryTimeMin
						deliveryTimeMax
						isCarrierRequired
						isDeliveryRequired
						isManufacturing
						isTakeaway
					}
				}
			`;
			
			export const DecreaseCount = gql`
				mutation DecreaseWarehouseProductCount(
					$storeId: String!,
					$storeProductId: String!,
					$count: Int!
				)
				{
					increaseWarehouseProductCount(
						storeId: $storeId
						storeProductId: $storeProductId
						count: $count
					)
					{
						id
						_id
						count
						soldCount
						viewsCount
						deliveryTimeMin
						deliveryTimeMax
						isCarrierRequired
						isDeliveryRequired
						isManufacturing
						isTakeaway
					}
				}
			`;
			
			export const DecreaseSoldCount = gql`
				mutation DecreaseWarehouseProductSoldCount(
					$storeId: String!,
					$storeProductId: String!,
					$count: Int!
				)
				{
					decreaseWarehouseProductSoldCount(
						storeId: $storeId
						storeProductId: $storeProductId
						count: $count
					)
					{
						id
						_id
						count
						soldCount
						viewsCount
						deliveryTimeMin
						deliveryTimeMax
						isCarrierRequired
						isDeliveryRequired
						isManufacturing
						isTakeaway
					}
				}
			`;
			
			export const DecreaseViewsCount = gql`
				mutation DecreaseWarehouseProductViewsCount(
					$storeId: String!,
					$storeProductId: String!,
					$count: Int!
				)
				{
					increaseWarehouseProductViewsCount(
						storeId: $storeId
						storeProductId: $storeProductId
						count: $count
					)
					{
						id
						_id
						count
						soldCount
						viewsCount
						deliveryTimeMin
						deliveryTimeMax
						isCarrierRequired
						isDeliveryRequired
						isManufacturing
						isTakeaway
					}
				}
			`;
			
			export namespace Comment
			{
				export const Add = gql`
					mutation AddComment(
						$storeId: String!
						$storeProductId: String!
						$comment: CommentCreateInput!
					) {
						addComment(
							storeId: $storeId,
							storeProductId: $storeProductId,
							comment: $comment
						)
						{
							id
							_id
							userId
							productId
							message
							likes
							dislikes
							likesBy
							dislikesBy
							replyTo
							_createdAt
							_updatedAt
						}
					}
				`;
				
				export const Update = gql`
					mutation UpdateComment(
						$storeId: String!
						$storeProductId: String!
						$commentId: String!
						$comment: CommentSaveInput!
					) {
						updateComment(
							storeId: $storeId,
							storeProductId: $storeProductId,
							commentId: $commentId,
							comment: $comment
						)
						{
							id
							_id
							userId
							productId
							message
							likes
							dislikes
							likesBy
							dislikesBy
							replyTo
							_createdAt
							_updatedAt
						}
					}
				`;
				
				export const IncreaseLikes = gql`
					mutation IncreaseLikes(
						$storeId: String!
						$storeProductId: String!
						$userId: String!,
						$commentId: String!
					) {
						increaseCommentLikes(
							storeId: $storeId
							storeProductId: $storeProductId
							userId: $userId
							commentId: $commentId
						)
						{
							_id
							userId
							likes
							likesBy
							dislikes
							dislikesBy
						}
					}
				`;
				
				export const IncreaseDislikes = gql`
					mutation IncreaseLikes(
						$storeId: String!
						$storeProductId: String!
						$userId: String!,
						$commentId: String!
					) {
						increaseCommentDislikes(
							storeId: $storeId
							storeProductId: $storeProductId
							userId: $userId
							commentId: $commentId
						)
						{
							_id
							userId
							likes
							likesBy
							dislikes
							dislikesBy
							_updatedAt
						}
					}
				`;
				
				/**
				
	increaseCommentLikes(
		storeId: String!
		storeProductId: String!,
		userId: String!,
		commentId: String!,
	): Comment

	increaseCommentDislikes(
		storeId: String!
		storeProductId: String!,
		userId: String!,
		commentId: String!,
	): Comment
				 * */
				
				export const Delete = gql`
					mutation DeleteCommentsByIds(
						$storeId: String!
						$storeProductId: String!
						$commentIds: [String!]!
					) {
						deleteCommentsByIds(
							storeId: $storeId,
							storeProductId: $storeProductId,
							commentIds: $commentIds
						)
						{
							id
							_id
							userId
							productId
							message
							likes
							dislikes
							likesBy
							dislikesBy
							replyTo
							_createdAt
							_updatedAt
						}
					}
				`;
			}
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
