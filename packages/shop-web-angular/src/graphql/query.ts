import gql from 'graphql-tag';

export namespace GQLQuery
{
	export namespace Admin
	{
		export const GetById = gql`
			query GetAdmin($id: String!)
			{
				admin(id: $id)
				{
					_id
					id
					username
					email
					avatar
					role
					firstName
					lastName
				}
			}
		`;
		
		export const Find = gql`
			query SearchAdmin($findInput: AdminFindInput)
			{
				adminSearch(findInput: $findInput)
				{
					_id
					id
					username
					firstName
					lastName
					role
					email
					avatar
				}
			}
		`;
	}
	
	export namespace Category
	{
		export const GetAll = gql`
			query allCategories
			{
				productsCategories
				{
					id
					name
					{
						locale
						value
					}
				}
			}
		`;
		
		export const GetAllWithImage = gql`
			query allCategories
			{
				productsCategories
				{
					id
					name
					{
						locale
						value
					}
					image
				}
			}
		`;
		
		export const GetById = gql`
			query GetCategory($id: String!)
			{
				productsCategory(id: $id)
				{
					name
					{
						value
						locale
					}
					image
					_createdAt
					_updatedAt
				}
			}
		`;
	}
	
	export namespace Customer
	{
		export const GetById = gql`
			query GetCustomerById($id: String!)
			{
				customer(id: $id)
				{
					_id
					firstName
					lastName
					avatar
					email
					role
					apartment
					phone
					isBanned
					geoLocation
					{
						streetAddress
						city
						house
						notes
						loc
						{
							type
							coordinates
						}
					}
				}
			}
		`;
		
		export const Find = gql`
			query FindCustomers(
				$findInput: CustomerFindInput
				$pagingOptions: PagingOptionsInput
			)
			{
				findCustomers(findInput: $findInput, pagingOptions: $pagingOptions)
				{
					_id
					username
					firstName
					lastName
					fullName
					fullAddress
					avatar
					email
					role
					apartment
					phone
					isBanned
					geoLocation
					{
						countryId
						city
						house
						streetAddress
						loc
						{
							type
							coordinates
						}
					}
				}
			}
		`;
		
		export const GetAll = gql`
			query GetAllCustomers
			{
				customers {
					_id
					id
					firstName
					lastName
					avatar
					fullName
					fullAddress
					email
					role
					apartment
					phone
					geoLocation {
						countryId
						city
						house
						streetAddress
						loc
						{
							type
							coordinates
						}
					}
				}
			}
		`;
		
		export const IsExists = gql`
			query IsCustomerExists($conditions: CustomerMemberInput!)
			{
				isCustomerExists(conditions: $conditions)
			}
		`;
		
		export const Metrics = gql`
			query GetCustomerMetrics($id: String!)
			{
				getCustomerMetrics(id: $id)
				{
					totalOrders
					canceledOrders
					completedOrdersTotalSum
				}
			}
		`;
	}
	
	export namespace Currency
	{
		export const GetAll = gql`
			query GetAllCurrencies
			{
				currencies
				{
					code
					name
					sign
					order
				}
			}
		`;
	}
	
	export namespace GeoLocation
	{
		export namespace Store
		{
			export const Get = gql`
				query GeoLocationWarehouses(
					$geoLocation: GeoLocationFindInput!
					$options: GetGeoLocationWarehousesOptions
				)
				{
					getNearMerchants(geoLocation: $geoLocation, options: $options)
					{
						id
						isActive
						isPaymentEnabled
						name
						logo
						contactEmail
						contactPhone
						ordersEmail
						ordersPhone
						inStoreMode
					}
				}
			`;
			
		}
		
		export namespace Product
		{
			export const GetByPaging = gql`
				query GeoLocationProductsByPaging(
					$geoLocation: GeoLocationFindInput!
					$options: GetGeoLocationProductsOptions
					$pagingOptions: PagingOptionsInput
					$searchText: String
				)
				{
					geoLocationProductsByPaging(
						geoLocation: $geoLocation
						options: $options
						pagingOptions: $pagingOptions
						searchText: $searchText
					)
					{
						distance
						warehouseId
						warehouseLogo
						warehouseProduct
						{
							id
							price
							initialPrice
							count
							soldCount
							rating {
								rate
								ratedBy
							}
							promotion{
								active
								activeFrom
								activeTo
								requested
							}
							viewsCount
							comments {
								id
								userId
								productId
								message
								likes
								dislikes
								likesBy
								dislikesBy
								_id
							}

							product
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
							isManufacturing
							isCarrierRequired
							isDeliveryRequired
							isProductAvailable
							isTakeaway
							deliveryTimeMin
							deliveryTimeMax
						}
					}
				}
			`;
			
			export const Count = gql`
				query GetCountOfGeoLocationProducts(
					$geoLocation: GeoLocationFindInput!
					$options: GetGeoLocationProductsOptions
					$searchText: String
				)
				{
					getCountOfGeoLocationProducts(
						geoLocation: $geoLocation
						options: $options
						searchText: $searchText
					)
				}
			`;
		}
	}
	
	export namespace Order
	{
		export const GetOrderedUsersInfo = gql`
			query GetOrderedUsersInfo($storeId: String!)
			{
				getOrderedUsersInfo(storeId: $storeId)
				{
					customer {
						_id
						id
						avatar
						firstName
						lastName
						email
						apartment
						phone
						geoLocation
						{
							countryId
							city
							house
							streetAddress
							loc
							{
								type
								coordinates
							}
						}
					}
					ordersCount
					totalPrice
				}
			}
		`;
		
		export const GetAll = gql`
			query GetAllOrders
			{
				orders
				{
					carrierId
					isCompleted
				}
			}
		`;
	}
	
	export namespace Product
	{
		export const GetAll = gql`
			query AllProducts(
				$findInput: ProductsFindInput
				$pagingOptions: PagingOptionsInput
				$existedProductsIds: [String]
			) {
				products(
					findInput: $findInput
					pagingOptions: $pagingOptions
					existedProductsIds: $existedProductsIds
				) {
					id
					title {
						locale
						value
					}
					description {
						locale
						value
					}
					details {
						locale
						value
					}
					images {
						locale
						url
						width
						height
						orientation
					}
					categories
				}
			}
		`;
		
		export const GetById = gql`
			query GetProductById($id: String!)
			{
				product(id: $id)
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
					categories
				}
			}
		`;
		
		export const GetCount = gql`
			query GetCountOfProducts($existedProductsIds: [String])
			{
				getCountOfProducts(
					existedProductsIds: $existedProductsIds
				)
			}
		`;
	}
	
	export namespace Promotion
	{
		export const GetAll = gql`
			query GetAllPromotions($findInput: PromotionsFindInput)
			{
				promotions(findInput: $findInput)
				{
					_id
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
					active
					activeFrom
					activeTo
					image
					promoPrice
					purchasesCount
					warehouseId
					productId
				}
			}
		`;
		
		export const Create = gql`
			mutation CreatePromotion($promotion: PromotionInput)
			{
				createPromotion(createInput: $promotion)
				{
					_id
				}
			}
		`;
	}
	
	export namespace Store
	{
		export const HasExistingStores = gql`
			query HasExistingStores
			{
				hasExistingStores
			}
		`;
		
		export const GetCountExistingCustomers = gql`
			query GetCountExistingCustomers
			{
				getCountExistingCustomers
				{
					total
					perStore
					{
						storeId
						customersCount
					}
				}
			}
		`;
		
		export const GetAll = gql`
			query GetAllStores
			{
				getAllStores
				{
					id
					_createdAt
					usedCarriersIds
					geoLocation
					{
						city
						streetAddress
						house
						loc
						{
							coordinates
						}
					}
				}
			}
		`;
		
		export const GetAllWithPagination = gql`
			query AllWarehouses($pagingOptions: PagingOptionsInput)
			{
				warehouses(pagingOptions: $pagingOptions)
				{
					_id
					_createdAt
					name
					contactEmail
					contactPhone
					logo
					username
					usedCarriersIds
					geoLocation
					{
						city
						streetAddress
						house
					}
				}
			}
		`;
		
		export const GetNearby = gql`
			query GetNearbyStores($geoLocation: GeoLocationFindInput!)
			{
				nearbyStores(geoLocation: $geoLocation)
				{
					_id
					name
					contactEmail
					contactPhone
					logo
					geoLocation
					{
						city
						streetAddress
						house
					}
				}
			}
		`;
		
		export const GetById = gql`
			query GetStoreById($id: String!)
			{
				warehouse(id: $id)
				{
					id
					name
					logo
					usedCarriersIds
					contactEmail
					contactPhone
					orderCancelation
					{
						enabled
						onState
					}
					geoLocation
					{
						city
						streetAddress
						house
						loc
						{
							coordinates
						}
					}
				}
			}
		`;
		
		export const GetCount = gql`
			query GetCountOfMerchants
			{
				getCountOfMerchants
			}
		`;
		
		export namespace Orders
		{
			export const GetTableData = gql`
				query GetStoreOrdersTableData(
					$storeId: String!
					$pagingOptions: PagingOptionsInput
					$status: String
				)
				{
					getStoreOrdersTableData(
						storeId: $storeId
						pagingOptions: $pagingOptions
						status: $status
					)
					{
						page
						orders
						{
							_id
							id
							carrierStatus
							carrierStatusText
							warehouseStatusText
							createdAt
							warehouseStatus
							deliveryTime
							status
							isConfirmed
							finishedProcessingTime
							isCancelled
							isPaid
							orderType
							orderNumber
							_createdAt
							warehouseId
							customer
							{
								id
								_id
								firstName
								lastName
								phone
								geoLocation
								{
									streetAddress
									house
									postcode
									notes
									countryName
									city
									loc {
										coordinates
									}
								}
							}
							warehouse {
								id
								_id
								name
								geoLocation
								{
									house
									postcode
									countryName
									city
									loc {
										coordinates
									}
								}
							}
							carrier
							{
								id
								logo
								email
								firstName
								lastName
								apartment
								phone
								geoLocation
								{
									city
									streetAddress
									house
									loc
									{
										coordinates
									}
								}
							}
							products
							{
								count
								price
								comment
								product
								{
									id
									_id
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
						}
					}
				}
			`;
			
			export const GetCount = gql`
				query getCountOfStoreOrders(
					$storeId: String!
					$status: String!
				)
				{
					getCountOfStoreOrders(
						storeId: $storeId
						status: $status
					)
				}
			`;
			
			export const GetInDelivery = gql`
				query GetOrdersInDelivery($storeId: String!)
				{
					getOrdersInDelivery(storeId: $storeId)
					{
						carrier
						{
							id
							geoLocation
							{
								loc
								{
									coordinates
								}
							}
						}
						customer
						{
							geoLocation
							{
								loc
								{
									coordinates
								}
							}
						}
					}
				}
			`;
			
			export const Remove = gql`
				query RemoveUserOrders(
					$storeId: String!
					$customerId: String!
				)
				{
					removeCustomerOrders(storeId: $storeId, customerId: $customerId)
					{
						num
						modified
					}
				}
			`;
		}
		
		export namespace Product
		{
			export const Get = gql`
				query GetWarehouseProduct(
					$storeId: String!
					$productId: String!
				)
				{
					getWarehouseProduct(
						storeId: $storeId
						productId: $productId
					)
					{
						id
						price
						initialPrice
						count
						soldCount
						viewsCount
						rating
						{
							rate
							ratedBy
						}
						promotion
						{
							active
							requested
							activeFrom
							activeTo
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
							replyTo
							_createdAt
							_updatedAt
						}
						product
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
						isManufacturing
						isCarrierRequired
						isDeliveryRequired
						isProductAvailable
						isTakeaway
						deliveryTimeMin
						deliveryTimeMax
					}
				}
			`;
			
			export const GetWithPagination = gql`
				query GetProductsWithPagination(
					$storeId: String!
					$pagingOptions: PagingOptionsInput
				)
				{
					getWarehouseProductsWithPagination(
						storeId: $storeId
						pagingOptions: $pagingOptions
					)
					{
						id
						_id
						price
						initialPrice
						count
						soldCount
						viewsCount
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
						promotion
						{
							active
							requested
							activeFrom
							activeTo
						}
						deliveryTimeMin
						deliveryTimeMax
						isCarrierRequired
						isDeliveryRequired
						isManufacturing
						isTakeaway
					}
				}
			`;
			
			export const Count = gql`
				query GetProductsCount($storeId: String!)
				{
					getWarehouseProductsCount(storeId: $storeId)
				}
			`;
			
			export const GetAvailable = gql`
				query GetAvailableWarehouseProducts(
					$storeId: String!
				){
					getWarehouseProductsAvailable(storeId: $storeId)
					{
						id
						price
						initialPrice
						count
						soldCount
						viewsCount
						rating
						{
							rate
							ratedBy
						}
						promotion
						{
							active
							requested
							activeFrom
							activeTo
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
						product
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
						isManufacturing
						isCarrierRequired
						isDeliveryRequired
						isProductAvailable
						isTakeaway
						deliveryTimeMin
						deliveryTimeMax
					}
				}
			`;
			
			export const GetTop = gql`
				query GetWarehouseProductsTop(
					$storeId: String!
					$quantity: Int!
				)
				{
					getWarehouseProductsTop(storeId: $storeId, quantity: $quantity)
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
			
			export namespace Comment
			{
				export const GetById = gql`
					query GetComment(
						$storeId: String!
						$storeProductId: String!
						$commentId: String!
					)
					{
						comment(
							storeId: $storeId,
							storeProductId: $storeProductId,
							commentId: $commentId
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
				
				export const GetMultiple = gql`
					query GetComments(
						$storeId: String!
						$storeProductId: String!
						$pagingOptions: PagingOptionsInput
					)
					{
						comments(
							storeId: $storeId,
							storeProductId: $storeProductId,
							pagingOptions: $pagingOptions
						)
						{
							id
							_id
							userId
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
				
				export const Count = gql`
					query GetCountOfComments(
						$storeId: String!
						$storeProductId: String!
					) {
						getCountOfComments(
							storeId: $storeId,
							storeProductId: $storeProductId
						)
					}
				`
			}
		}
		
	}
}

export default GQLQuery;
