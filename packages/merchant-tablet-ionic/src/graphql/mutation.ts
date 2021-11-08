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
					{
						product{
							id
						}
					}
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
					$price: Float!
				){
					changeWarehouseProductPrice(
						storeId: $storeId
						storeProductId: $storeProductId
						price: $price
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
					decreaseWarehouseProductCount(
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
