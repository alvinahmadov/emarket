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
		
		export const GetAppSettings = gql`
			query adminAppSettings
			{
				adminAppSettings
				{
					adminPasswordReset
					fakeDataGenerator
				}
			}
		`;
	}
	
	export namespace Carrier
	{
		export const GetById = gql`
			query GetCarrierById(
				$id: String!
			)
			{
				getCarrier(id: $id)
				{
					id
					firstName
					lastName
					phone
					logo
					isDeleted
					numberOfDeliveries
					skippedOrderIds
					status
					isActive
					username
					isSharedCarrier
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
		
		export const GetByUsername = gql`
			query GetCarrierByUsername(
				$username: String!
			)
			{
				getCarrierByUsername(username: $username)
				{
					username
				}
			}
		`;
		
		export const GetCurrentOrder = gql`
			query GetCarrierCurrentOrder(
				$carrierId: String!
			)
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
								type
								coordinates
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
								type
								coordinates
							}
						}
					}
				}
			}
		`;
		
		export const Find = gql`
			query GetCarriers(
				$pagingOptions: PagingOptionsInput
				$carriersFindInput: CarriersFindInput
			)
			{
				getCarriers(
					pagingOptions: $pagingOptions
					carriersFindInput: $carriersFindInput
				)
				{
					_id
					id
					firstName
					lastName
					phone
					logo
					isDeleted
					numberOfDeliveries
					skippedOrderIds
					status
					isActive
					username
					isSharedCarrier
					geoLocation {
						city
						streetAddress
						house
						loc {
							type
							coordinates
						}
					}
				}
			}
		`;
		
		export const Count = gql`
			query GetCountOfCarriers(
				$carriersFindInput: CarriersFindInput
			)
			{
				getCountOfCarriers(
					carriersFindInput: $carriersFindInput
				)
			}
		`;
		
		export namespace Orders
		{
			export const GetHistory = gql`
				query GetCarrierOrdersHistory(
					$carrierId: String!
					$options: GeoLocationOrdersOptions
				) {
					getCarrierOrdersHistory(
						carrierId: $carrierId
						options: $options
					) {
						id
						carrierStatus
						carrierStatusText
						warehouseStatusText
						createdAt
						startDeliveryTime
						status
						deliveryTime
						finishedProcessingTime
						customer {
							id
							firstName
							lastName
							avatar
							geoLocation {
								streetAddress
								house
								postcode
								countryName
								city
							}
						}
						warehouse {
							id
							name
							logo
							geoLocation {
								house
								postcode
								countryName
								city
							}
						}
					}
				}
			`;
			
			export const GetHistoryCount = gql`
				query GetCountOfCarrierOrdersHistory(
					$carrierId: String!
				)
				{
					getCountOfCarrierOrdersHistory(carrierId: $carrierId)
				}
			`;
		}
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
		
		export const GetAllWithPaging = gql`
			query GetCustomers(
				$pagingOptions: PagingOptionsInput
			)
			{
				customers(pagingOptions: $pagingOptions)
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
		
		export const IsEmailExists = gql`
			query IsCustomerEmailExists($email: String!)
			{
				isCustomerEmailExists(email: $email)
			}
		`;
		
		export const IsExists = gql`
			query IsCustomerExists($conditions: CustomerMemberInput!)
			{
				isCustomerExists(conditions: $conditions)
			}
		`;
		
		export const Count = gql`
			query GetCountOfCustomers
			{
				getCountOfCustomers
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
		
		export const GenerateCustom = gql`
			query GenerateCustomers(
				$qty: Int!
				$defaultLng: Float!
				$defaultLat: Float!
			)
			{
				generateCustomers(
					qty: $qty
					defaultLng: $defaultLng
					defaultLat: $defaultLat
				)
				{
					success
					message
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
	
	export namespace Device
	{
		export const GetAll = gql`
			query allDevices
			{
				devices
				{
					_id
					language
					type
					uuid
				}
			}
		`;
		
		export const GetByUuid = gql`
			query GetByUuid($findInput: DeviceFindInput)
			{
				devices(findInput: $findInput)
				{
					id
				}
			}
		`;
		
		export const GetByWebsocket = gql`
			query _allDevices
			{
				devices
				{
					_id
					language
					type
					uuid
				}
			}
		`;
	}
	
	export namespace GeoLocation
	{
		export namespace Order
		{
			export const ForWork = gql`
				query GetOrdersForWork(
					$geoLocation: GeoLocationFindInput!
					$skippedOrderIds: [String!]!
					$options: GeoLocationOrdersOptions
					$searchObj: SearchOrdersForWork
				) {
					getOrdersForWork(
						geoLocation: $geoLocation
						skippedOrderIds: $skippedOrderIds
						options: $options
						searchObj: $searchObj
					) {
						id
						carrierStatus
						carrierStatusText
						warehouseStatusText
						createdAt
						customer {
							id
							firstName
							lastName
							avatar
							geoLocation {
								streetAddress
								house
								postcode
								countryName
								city
							}
						}
						warehouse {
							id
							name
							logo
							geoLocation {
								house
								postcode
								countryName
								city
							}
						}
					}
				}
			`;
			
			export const ForWorkCount = gql`
				query GetCountOfOrdersForWork(
					$geoLocation: GeoLocationFindInput!
					$skippedOrderIds: [String!]!
					$searchObj: SearchOrdersForWork
				)
				{
					getCountOfOrdersForWork(
						geoLocation: $geoLocation
						skippedOrderIds: $skippedOrderIds
						searchObj: $searchObj
					)
				}
			`;
		}
		
		export namespace Product
		{
			export const Find = gql`
				query geoLocationProducts(
					$geoLocation: GeoLocationFindInput!
				)
				{
					geoLocationProducts(geoLocation: $geoLocation)
					{
						distance
						warehouseId
						warehouseLogo
						warehouseProduct
						{
							price
							initialPrice
							count
							isManufacturing
							isCarrierRequired
							isDeliveryRequired
							isProductAvailable
							deliveryTimeMin
							deliveryTimeMax
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
						}
					}
				}
			`;
		}
	}
	
	export namespace Invite
	{
		export const GetAll = gql`
			query allInvites
			{
				invites
				{
					id
					code
					geoLocation
					{
						city
						streetAddress
						house
						countryId
						loc
						{
							type
							coordinates
						}
					}
					apartment
				}
			}
		`;
		
		export const GetAllWithPaging = gql`
			query AllInvites($pagingOptions: PagingOptionsInput)
			{
				invites(pagingOptions: $pagingOptions)
				{
					id
					code
					geoLocation
					{
						city
						streetAddress
						house
						countryId
						loc
						{
							type
							coordinates
						}
					}
					apartment
				}
			}
		`;
		
		export const Count = gql`
			query GetCountOfInvites
			{
				getCountOfInvites
			}
		`;
		
		export const GenerateInvitesToInviteRequests = gql`
			query Generate1000InvitesConnectedToInviteRequests(
				$defaultLng: Float!
				$defaultLat: Float!
			) {
				generate1000InvitesConnectedToInviteRequests(
					defaultLng: $defaultLng
					defaultLat: $defaultLat
				)
			}
		`;
	}
	
	export namespace InviteRequest
	{
		export const GetAll = gql`
			query allInvitesRequests {
				invitesRequests {
					id
					isInvited
					invitedDate
					apartment
					geoLocation {
						countryId
						city
						streetAddress
						house
						loc {
							type
							coordinates
						}
					}
				}
			}
		`;
		
		export const GetAllWithPaging = gql`
			query AllInvitesRequests(
				$pagingOptions: PagingOptionsInput
				$invited: Boolean
			)
			{
				invitesRequests(
					pagingOptions: $pagingOptions
					invited: $invited
				)
				{
					id
					isInvited
					invitedDate
					apartment
					geoLocation
					{
						city
						streetAddress
						house
						countryId
						loc
						{
							type
							coordinates
						}
					}
				}
			}
		`;
		
		export const Count = gql`
			query GetCountOfInvitesRequests($invited: Boolean)
			{
				getCountOfInvitesRequests(invited: $invited)
			}
		`;
		
		export const Generate = gql`
			query Generate1000InviteRequests(
				$defaultLng: Float!
				$defaultLat: Float!
			)
			{
				generate1000InviteRequests(
					defaultLng: $defaultLng
					defaultLat: $defaultLat
				)
			}
		`;
	}
	
	export namespace Order
	{
		export const GetById = gql`
			query GetOrderById($id: String!)
			{
				order(id: $id)
				{
					id
					warehouseId
					carrierId
					createdAt
					orderNumber
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
		
		export const GetWithCustomer = gql`
			query Orders
			{
				orders
				{
					customer
					{
						_id
					}
					warehouseId
					totalPrice
					isCompleted
				}
			}
		`;
		
		export const GetChartTotal = gql`
			query GetOrdersChartTotalOrders
			{
				getOrdersChartTotalOrders
				{
					isCancelled
					_createdAt
					totalPrice
				}
			}
		`;
		
		export const GetChartTotalIsCompleted = gql`
			query GetOrdersChartTotalOrders
			{
				getOrdersChartTotalOrders
				{
					isCancelled
					totalPrice
					isCompleted
					_createdAt
				}
			}
		`;
		
		export const GetDashboardCompleted = gql`
			query GetDashboardCompletedOrders
			{
				getDashboardCompletedOrders
				{
					warehouseId
					totalPrice
				}
			}
		`;
		
		export const GetDashboardCompletedToday = gql`
			query GetDashboardCompletedOrdersToday
			{
				getDashboardCompletedOrdersToday
				{
					customer
					{
						_id
					}
					warehouseId
					totalPrice
					isCompleted
				}
			}
		`;
		
		export const GetCompletedInfo = gql`
			query GetCompletedOrdersInfo($storeId: String)
			{
				getCompletedOrdersInfo(storeId: $storeId)
				{
					totalOrders
					totalRevenue
				}
			}
		`;
		
		export const GetCustomersCountInfo = gql`
			query GetCustomersOrdersCountInfo($usersIds: [String!])
			{
				getUsersOrdersCountInfo(usersIds: $usersIds)
				{
					id
					ordersCount
				}
			}
		`;
		
		export const GetMerchantsCountInfo = gql`
			query GetMerchantsOrdersCountInfo(
				$merchantsIds: [String!]
			)
			{
				getMerchantsOrdersCountInfo(
					merchantsIds: $merchantsIds
				)
				{
					id
					ordersCount
				}
			}
		`;
		
		export const AddToTake = gql`
			query AddOrdersToTake
			{
				addOrdersToTake
			}
		`;
		
		export const AddTaken = gql`
			query AddTakenOrders($carrierIds: [String!]!)
			{
				addTakenOrders(carrierIds: $carrierIds)
			}
		`;
		
		export const GerMerchantsOrders = gql`
			query getMerchantsOrders
			{
				getMerchantsOrders
				{
					_id
					ordersCount
				}
			}
		`;
		
		export const GenerateRandomForCurrentStore = gql`
			query GenerateRandomOrdersCurrentStore(
				$storeId: String!
				$storeCreatedAt: Date!
				$ordersLimit: Int!
			)
			{
				generateRandomOrdersCurrentStore(
					storeId: $storeId
					storeCreatedAt: $storeCreatedAt
					ordersLimit: $ordersLimit
				)
				{
					error
					message
				}
			}
		`;
		
		export const GeneratePastPerCarrier = gql`
			query GeneratePastOrdersPerCarrier
			{
				generatePastOrdersPerCarrier
			}
		`;
		
		export const GenerateActiveAndAvailablePerCarrier = gql`
			query GenerateActiveAndAvailableOrdersPerCarrier {
				generateActiveAndAvailableOrdersPerCarrier
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
	
	export namespace ProductCategory
	{
		export const GetAllWithImage = gql`
			query allCategories
			{
				productsCategories
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
					usedCarriersIds
					logo
					geoLocation
					{
						countryId
						countryName
						city
						streetAddress
						house
						loc
						{
							coordinates
						}
					}
					_createdAt
				}
			}
		`;
		
		export const GetAllSimple = gql`
			query GetAllStores
			{
				getAllStores
				{
					id
					_createdAt
					geoLocation
					{
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
						loc
						{
							type
							coordinates
						}
					}
				}
			}
		`;
		
		export const GetByIdSimple = gql`
			query GetStoreById($id: String!)
			{
				warehouse(id: $id)
				{
					id
					name
					logo
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
			export const GetById = gql`
				query GetStoreOrders($storeId: String!)
				{
					getStoreOrders(storeId: $storeId)
					{
						id
						isCompleted
						products
						{
							count
							price
						}
					}
				}
			`;
			
			export const GetDashboardChart = gql`
				query GetDashboardOrdersChartOrders($storeId: String!)
				{
					getDashboardOrdersChartOrders(storeId: $storeId)
					{
						isCompleted
						isCancelled
						_createdAt
						totalPrice
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
						orders
						{
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
							customer
							{
								id
								firstName
								lastName
								geoLocation
								{
									streetAddress
									house
									postcode
									countryName
									city
								}
							}
							warehouse
							{
								id
								name
								geoLocation
								{
									house
									postcode
									countryName
									city
								}
							}

							products
							{
								count
								price
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
							}
						}
					}
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
		
		export namespace Products
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
			
			export const GetAvailableProducts = gql`
				query GetStoreAvailableProducts($storeId: String!)
				{
					getStoreAvailableProducts(storeId: $storeId)
					{
						_id
						id
						price
						initialPrice
						count
						viewsCount
						likesCount
						soldCount
						comments {
							comment
							dislikes
							likes
							isReply
						}
						product {
							id
							title {
								value
								locale
							}
							description {
								locale
								value
							}
							details {
								value
								locale
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
			
			export const GetCount = gql`
				query GetProductsCount($storeId: String!)
				{
					getWarehouseProductsCount(id: $storeId)
				}
			`;
		}
		
	}
}

export default GQLQuery;
