import gql from "graphql-tag";

namespace GQLQueries
{
    // #Admin
	
	export const Admin = gql`
		query admin($id: String!)
		{
			admin(id: $id)
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
	
	export const AdminByEmail = gql`
		query GetAdminByEmail($email: String!)
		{
			adminByEmail(email: $email)
			{
				_id
			}
		}
	`;

    // #Carriers
	
	export const CarrierAll = gql`
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
	
	// noinspection JSUnusedGlobalSymbols
	export const CarrierCarriers = gql`
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
	
	export const CarrierCarriersBy = gql`
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
	
	export const CarrierById = gql`
		query GetCarrierById($id: String!)
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
	
	export const CarrierByUsername = gql`
		query GetCarrierByUsername($username: String!)
		{
			getCarrierByUsername(username: $username)
			{
				username
			}
		}
	`;
	
	export const CarrierCount = gql`
		query GetCountOfCarriers(
			$carriersFindInput: CarriersFindInput
		)
		{
			getCountOfCarriers(
				carriersFindInput: $carriersFindInput
			)
		}
	`;
	
	export const CarrierCurrentOrder = gql`
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
	
	export const CarrierOrdersHistory = gql`
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
	
	export const CarrierOrdersHistoryCount = gql`
		query GetCountOfCarrierOrdersHistory($carrierId: String!)
		{
			getCountOfCarrierOrdersHistory(carrierId: $carrierId)
		}
	`;

    // #Currencies
	
	export const CurrenciesAll = gql`
		query allCurrencies
		{
			currencies
			{
				currencyCode
			}
		}
	`;

    // #Data
	
	// noinspection JSUnusedGlobalSymbols
	export const DataClearAll = gql`
		query ClearAll {
			clearAll
		}
	`;

    // #Devices
	
	export const DeviceAll = gql`
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
	
	export const DeviceByUuid = gql`
		query GetByUuid($findInput: DeviceFindInput)
		{
			devices(findInput: $findInput)
			{
				id
			}
		}
	`;
	
	export const DeviceByWebsocket = gql`
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

    // #GeolocationProducts
	
	export const GeoLocationProduct = gql`
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
	
	export const GeoLocationProductByPaging = gql`
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
	
	export const GeoLocationProductCount = gql`
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
	
	export const GeoLocationOrdersForTask = gql`
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
	
	export const GeoLocationOrdersForTaskCount = gql`
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

    // #Invites
	
	export const InviteAll = gql`
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
						coordinates
						type
					}
				}
				apartment
			}
		}
	`;
	
	export const InviteByPaging = gql`
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
						coordinates
						type
					}
				}
				apartment
			}
		}
	`;
	
	export const InviteBy = gql`
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
				geoLocation
				{
					city
					streetAddress
					house
					countryId
					loc
					{
						coordinates
						type
					}
				}
				isInvited
				invitedDate
				apartment
			}
		}
	`;
	
	export const InviteCount = gql`
		query GetCountOfInvites
		{
			getCountOfInvites
		}
	`
	
	export const InviteRequestsAll = gql`
		query allInvitesRequests {
			invitesRequests {
				id
				geoLocation {
					city
					streetAddress
					house
					countryId
					loc {
						coordinates
						type
					}
				}
				isInvited
				invitedDate
				apartment
			}
		}
	`;
	
	export const InviteFake = gql`
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
	
	export const InviteRequestFake = gql`
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
	
	export const InviteRequestCount = gql`
		query GetCountOfInvitesRequests($invited: Boolean)
		{
			getCountOfInvitesRequests(invited: $invited)
		}
	`

    // #Orders
	
	export const OrderOrders = gql`
		query Orders
		{
			orders
			{
				carrierId
				isCompleted
			}
		}
	`;
	
	export const OrderDetails = gql`
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
	
	export const OrderDashboardChartOrders = gql`
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
	
	export const OrderStoreOrders = gql`
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
	
	export const OrderStoreOrdersTableData = gql`
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
	
	export const OrderStoreOrdersCount = gql`
		query getCountOfStoreOrders(
			$storeId: String!
			$status: String!
		) {
			getCountOfStoreOrders(
				storeId: $storeId
				status: $status
			)
		}
	`;
	
	export const OrderById = gql`
		query GetOrderById($id: String!)
		{
			getOrder(id: $id)
			{
				id
				warehouseId
				carrierId
				createdAt
				orderNumber
			}
		}
	`;
	
	export const OrderOrderedUsersInfo = gql`
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
	
	export const OrderMerchants = gql`
		query getMerchantsOrders
		{
			getMerchantsOrders
			{
				_id
				ordersCount
			}
		}
	`;
	
	export const OrderUsersCountInfo = gql`
		query GetUsersOrdersCountInfo($usersIds: [String!])
		{
			getUsersOrdersCountInfo(usersIds: $usersIds)
			{
				id
				ordersCount
			}
		}
	`;
	
	export const OrderMerchantsCountInfo = gql`
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
	
	export const OrderPastGeneratePerCarrier = gql`
		query GeneratePastOrdersPerCarrier
		{
			generatePastOrdersPerCarrier
		}
	`;
	
	export const OrderGenerateActiveAndAvailablePerCarrier = gql`
		query GenerateActiveAndAvailableOrdersPerCarrier {
			generateActiveAndAvailableOrdersPerCarrier
		}
	`;
	
	export const OrderAddTaken = gql`
		query AddTakenOrders($carrierIds: [String!]!)
		{
			addTakenOrders(carrierIds: $carrierIds)
		}
	`;
	
	export const OrderAddToTake = gql`
		query AddOrdersToTake
		{
			addOrdersToTake
		}
	`;
	
	export const OrderGenerateRandomCurrentStore = gql`
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
	
	export const OrderChartTotalOrders = gql`
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
	
	export const OrderChartTotalOrdersIsCompleted = gql`
		query GetOrdersChartTotalOrders
		{
			getOrdersChartTotalOrders
			{
				isCancelled
				_createdAt
				totalPrice
				isCompleted
			}
		}
	`;
	
	export const OrderDashboardCompleted = gql`
		query GetDashboardCompletedOrders
		{
			getDashboardCompletedOrders
			{
				warehouseId
				totalPrice
			}
		}
	`;
	
	export const OrderCompletedInfo = gql`
		query GetCompletedOrdersInfo($storeId: String)
		{
			getCompletedOrdersInfo(storeId: $storeId)
			{
				totalOrders
				totalRevenue
			}
		}
	`;
	
	export const OrderDashboardCompletedToday = gql`
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

    // #Promotion
	
	export const PromotionAll = gql`
		query allPromotions($findInput: PromotionsFindInput)
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

    // #Product
	
	export const ProductAll = gql`
		query AllProducts(
			$pagingOptions: PagingOptionsInput
			$existedProductsIds: [String]
		) {
			products(
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
	
	export const ProductById = gql`
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
	
	export const ProductCount = gql`
		query GetCountOfProducts($existedProductsIds: [String])
		{
			getCountOfProducts(
				existedProductsIds: $existedProductsIds
			)
		}
	`;

    // #ProductCategory
	
	export const ProductCategoryAll = gql`
		query allCategories {
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
	
	export const ProductCategoryAllWithImage = gql`
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

    // #Users
	
	export const UserAll = gql`
		query AllUsers
		{
			customers {
				_id
				firstName
				lastName
				email
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
	
	export const UserAllBy = gql`
		query AllUsers($pagingOptions: PagingOptionsInput)
		{
			customers(pagingOptions: $pagingOptions)
			{
				_id
				firstName
				lastName
				avatar
				email
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
	
	export const CustomerById = gql`
		query GetCustomerById($id: String!)
		{
			customer(id: $id)
			{
				_id
				firstName
				lastName
				avatar
				email
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
	
	export const CustomersCount = gql`
		query GetCountOfCustomers
		{
			getCountOfCustomers
		}
	`;
	
	export const CustomerEmailExists = gql`
		query IsCustomerEmailExists($email: String!)
		{
			isCustomerEmailExists(email: $email)
		}
	`;
	
	export const CustomerExists = gql`
		query IsCustomerExists($conditions: CustomerMemberInput!)
		{
			isCustomerExists(conditions: $conditions)
		}
	`;
	
	export const UserMetrics = gql`
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
	
	export const UserGenerateCustom = gql`
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

    // #Warehouses
	
	export const StoreAllFull = gql`
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
	
	export const StoreAllLight = gql`
		query GetAllStores {
			getAllStores {
				id
				_createdAt
				geoLocation {
					loc {
						coordinates
					}
				}
			}
		}
	`;
	
	export const StoreAllBy = gql`
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
				carriersIds
				geoLocation
				{
					city
					streetAddress
					house
				}
			}
		}
	`;
	
	export const StoreLivePosition = gql`
		query GetAllStores
		{
			getAllStores
			{
				id
				_createdAt
				name
				logo
				geoLocation
				{
					loc
					{
						coordinates
					}
					city
					countryId
				}
			}
		}
	`;
	
	export const StoreNearbyStores = gql`
		query GetNearbyStores($geoLocation: GeoLocationFindInput!) {
			nearbyStores(geoLocation: $geoLocation) {
				_id
				name
				contactEmail
				contactPhone
				logo
				geoLocation {
					city
					streetAddress
					house
				}
			}
		}
	`;
	
	export const WarehouseAll = gql`
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
	
	export const WarehouseExistingCustomersCount = gql`
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
	
	export const WarehouseExistingCustomersTodayCount = gql`
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
	
	export const WarehouseHasExistingStores = gql`
		query HasExistingStores
		{
			hasExistingStores
		}
	`;
	
	export const WarehouseNearbyStores = gql`
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
	
	export const WarehouseProduct = gql`
		query GetWarehouseProduct(
			$warehouseId: String!
			$warehouseProductId: String!
		)
		{
			getWarehouseProduct(
				warehouseId: $warehouseId
				warehouseProductId: $warehouseProductId
			)
			{
				id
				price
				initialPrice
				count
				soldCount

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
	
	export const WarehouseStoreById = gql`
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
	
	export const WarehouseStoreByIdLight = gql`
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
	
	export const WarehouseOrderProcess = gql`
		query GetWarehouseOrderProcess($id: String!)
		{
			warehouse(id: $id)
			{
				ordersShortProcess
			}
		}
	`;
	
	export const WarehouseMerchantsCount = gql`
		query GetCountOfMerchants
		{
			getCountOfMerchants
		}
	`;
	
	export const StoreOrdersTableData = gql`
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
	
	export const StoreOrdersCount = gql`
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
	
	export const StoreOrdersRemoveOrders = gql`
		query RemoveUserOrders(
			$storeId: String!
			$customerId: String!
		)
		{
			removeCustomerOrders(storeId: $storeId, customerId: $customerId)
			{
				number
				modified
			}
		}
	`;
	
	export const OrdersInDelivery = gql`
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
	
	export const WarehouseProductProductsWithPagination = gql`
		query GetProductsWithPagination(
			$id: String!
			$pagingOptions: PagingOptionsInput
		)
		{
			getProductsWithPagination(
				id: $id
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
				isCarrierRequired
				isTakeaway
				deliveryTimeMin
				deliveryTimeMax
				isCarrierRequired
				isDeliveryRequired
				isManufacturing
				isTakeaway
			}
		}
	`;
	
	export const WarehouseProductProductsCount = gql`
		query GetProductsCount($id: String!)
		{
			getProductsCount(id: $id)
		}
	`;

}

export default GQLQueries;
