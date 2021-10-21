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
	
	export namespace Carrier
	{
		export const GetAll = gql`
			query getCarriers
			{
				getCarriers
				{
					_id
					firstName
					lastName
					phone
					logo
					isDeleted
					numberOfDeliveries
					skippedOrderIds
					status
					geoLocation
					{
						city
						streetAddress
						house
						loc
						{
							type
							coordinates
						}
					}
				}
			}
		`;
		
		export const GetCurrentOrder = gql`
			query GetCarrierCurrentOrder($carrierId: String!)
			{
				getCarrierCurrentOrder(carrierId: $carrierId)
				{
					id
					carrierStatus
					carrierStatusText
					warehouseStatusText
					createdAt
					startDeliveryTime
					status
					deliveryTime
					finishedProcessingTime
					customer
					{
						id
						phone
						email
						apartment
						firstName
						lastName
						avatar
						geoLocation
						{
							house
							postcode
							countryName
							city
							streetAddress
							loc
							{
								coordinates
								type
							}
						}
					}
					warehouse
					{
						id
						name
						logo
						contactEmail
						contactPhone
						geoLocation
						{
							house
							postcode
							countryName
							city
							streetAddress
							loc {
								coordinates
								type
							}
						}
					}
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
					firstName
					lastName
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
		
		export const GetCountExistingCustomersToday = gql`
			query GetCountExistingCustomersToday
			{
				getCountExistingCustomersToday
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
		
		export namespace Order
		{
			export const GetOrderProcess = gql`
				query GetStoreOrderProcess($id: String!)
				{
					warehouse(id: $id)
					{
						ordersShortProcess
					}
				}
			`;
			
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
			
			export const Count = gql`
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
						comments {
							comment
							likes
							dislikes
							isReply
							replyTo
						}
						viewsCount
						likesCount
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
					getWarehouseProductsCount(id: $storeId)
				}
			`;
		}
		
	}
}

export default GQLQuery;
