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

// #Carriers
	
	export const CarriersCurrentOrder = gql`
		query GetCarrierCurrentOrder($carrierId: String!) {
			getCarrierCurrentOrder(carrierId: $carrierId) {
				id
				carrierStatus
				carrierStatusText
				warehouseStatusText
				createdAt
				startDeliveryTime
				status
				deliveryTime
				finishedProcessingTime
				user {
					id
					phone
					email
					apartment
					firstName
					lastName
					image
					geoLocation {
						house
						postcode
						notes
						countryName
						city
						streetAddress
						loc {
							coordinates
							type
						}
					}
				}
				warehouse {
					id
					name
					logo
					contactEmail
					contactPhone
					geoLocation {
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
	
	export const CarriersGet = gql`
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
	
	export const CarriersWatch = gql`
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
	
	export const CarrierByUsername = gql`
		query GetCarrierByUsername($username: String!)
		{
			getCarrierByUsername(username: $username)
			{
				username
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
				user
				{
					id
					phone
					email
					apartment
					firstName
					lastName
					image
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
				user {
					id
					firstName
					lastName
					image
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
	`
	
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
	
	/*
	 #Data
	 */
	
	export const DataClearAll = gql`
		query ClearAll {
			clearAll
		}
	`;

// #Devices
	
	export const DevicesAll = gql`
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
	
	export const DevicesByUuid = gql`
		query GetByUuid($findInput: DeviceFindInput)
		{
			devices(findInput: $findInput)
			{
				id
			}
		}
	`;
	
	export const DevicesByWebsocket = gql`
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
	
	export const GeoLocationProducts = gql`
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
	
	export const GeoLocationProductsByPaging = gql`
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
	
	export const GeoLocationProductsCount = gql`
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
				user {
					id
					firstName
					lastName
					image
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
	
	export const InvitesAll = gql`
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
	
	export const InvitesByPaging = gql`
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
	
	export const InvitesGet = gql`
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
	
	export const InvitesCount = gql`
		query GetCountOfInvites
		{
			getCountOfInvites
		}
	`
	
	export const InvitesRequestsAll = gql`
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
	
	export const InvitesFake = gql`
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
	
	export const Orders = gql`
		query Orders
		{
			orders
			{
				carrierId
				isCompleted
			}
		}
	`;
	
	export const OrdersOrderedUsersInfo = gql`
		query GetOrderedUsersInfo($storeId: String!)
		{
			getOrderedUsersInfo(storeId: $storeId)
			{
				user {
					_id
					id
					image
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
	
	export const OrderPastGeneratePerCarrier = gql`
		query GeneratePastOrdersPerCarrier
		{
			generatePastOrdersPerCarrier
		}
	`;
	
	export const OrdersGenerateActiveAndAvailablePerCarrier = gql`
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
	
	export const OrderGenerateRandomCurrentStore = gql`
		query GenerateRandomOrdersCurrentStore(
			$storeId: String!
			$storeCreatedAt: Date!
			$ordersLimit: Int!
		) {
			generateRandomOrdersCurrentStore(
				storeId: $storeId
				storeCreatedAt: $storeCreatedAt
				ordersLimit: $ordersLimit
			) {
				error
				message
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
	
	export const ProductCategoriesAll = gql`
		query allCategories {
			productsCategories {
				id
				name {
					locale
					value
				}
			}
		}
	`;

// #Users
	
	export const UsersAll = gql`
		query AllUsers
		{
			users
			{
				_id
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
		}
	`;

// #Warehouses
	
	export const StoreAll = gql`
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
					user
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
			$userId: String!
		)
		{
			removeUserOrders(storeId: $storeId, userId: $userId)
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
				user
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
