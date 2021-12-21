**Запрос:**

`getNearMerchants`- заполучить ближайшие по геолокации магазины/продавцов.

**Параметры:**

`geoLocation: GeoLocation` - Геолокация клиента
`$options?: IGeoLocationWarehousesOptions` - опции для фильтра

**Результат:**

`Warehouse[] | null`

**GraphQL:**

```graphql
query(
	$geoLocation: GeoLocationFindInput!
	$options: GetGeoLocationWarehousesOptions
)
{
	getNearMerchants(geoLocation: $geoLocation, options: $options)
	{
		...
	}
}
```

```graphql
scalar Date

# Локация
input LocInput {
	coordinates: [Float!]! # координаты [longitude, latitude]
	type: String! # тип координаты, по умолч. "Point"
}

# Фильтр магазинов
input GeoLocationFindInput {
	city: String # город
	countryId: Int # ISO номер страны (РФ - 189)
	house: String # дом
	loc: LocInput # локация
	notes: String # заметки
	postcode: String # zipCode
	streetAddress: String # улица
}

# Опции для магазинов по геолокации
input GetGeoLocationWarehousesOptions {
	activeOnly: Boolean # фильтровать только активные магазины
	fullProducts: Boolean # добавить в результат все товары
	inStoreMode: Boolean # находится ли в режиме магазина
	maxDistance: Int # максимальное расстояние от клиента
}

# Мобильное устройство пользователя
type Device {
	_id: String! # идентификатор, в ts PyroObject
	channelId: String # идентификатор канала для пуш уведомлений 
	id: String! # идентификатор устройства
	language: String # язык устройства
	type: String! # тип операционной системы устройства (android, ios)
	uuid: String!
}

# Изображение товара
type ImageType {
	url: String! # ссылка в CloudInary
	height: Int! # высота в пикселях
	width: Int! # ширина в пикселях
	locale: String! # язык
	orientation: Int! # ориентация 1/2 | вертикальный/горизонтальный
}

# Локация
type Loc {
	coordinates: [Float!]! # координаты [longitude, latitude]
	type: String! # тип координаты, по умолч. "Point"
}

# Координаты геолокации
type GeoLocationCoordinates {
	lat: Float! # широта
	lng: Float! # долгота
}

# Геолокация
type GeoLocation {
	_id: String # идентификатор, в ts PyroObject
	_createdAt: Date # дата создания
	_updatedAt: Date # дата обновления
	city: String! # город
	coordinates: GeoLocationCoordinates! # координаты
	countryId: Int! # ISO номер страны (РФ - 189)
	countryName: String # имя страны
	createdAt: Date # дата создания, геттер
	updatedAt: Date # дата обновления, геттер
	house: String! # дом
	id: String # идентификатор
	loc: Loc! # локация
	notes: String # заметки
	postcode: String # zipCode
	streetAddress: String! # улица
}

# Курьер
type Carrier {
	_id: String!
	apartment: String # апартаменты
	devices: [Device!]! # список устройств
	devicesIds: [String!]! # список идентификаторов устройств
	email: String # почта курьера
	firstName: String! # настоящее имя курьера
	lastName: String! # фамилия курьера
	geoLocation: GeoLocation! # геолокация курьера
	id: String! # идентификатор курьера
	isActive: Boolean # работает
	isDeleted: Boolean! # удален из базы данных
	isSharedCarrier: Boolean # работает в нескольких магазинах
	logo: String! # логотип
	numberOfDeliveries: Int! # количество доставленных заказов
	phone: String! # номер телефона
	skippedOrderIds: [String!] # отклоненные курьером заказы
	status: Int! # статус доставки
	username: String! # имя пользователя курьера
}

# Клиент
type Customer {
	_id: String! # идентификатор клиента, в ts PyroObject
	apartment: String! # апартаменты
	avatar: String # ссылка на автарку в CloudInary
	createdAt: Date # дата создания
	devices: [Device!]! # список устройств
	devicesIds: [String!]! # список идентификаторов устройств
	email: String! # почта пользователя
	firstName: String # настоящее имя клиента
	lastName: String # фамилия клиента
	fullAddress: String # полный адресс клиента
	fullName: String # полное имя клиента, 'firstName lastName' 
	geoLocation: GeoLocation! # геолокация пользователя
	id: String! # идентификатор клиента
	isBanned: Boolean! # статус бана пользователя
	phone: String # номер телефона клиента, если есть
	role: String # роль, всегда customer, если не открыт магазин
	username: String! # имя пользователя в системе
}

# Заказ
type Order {
	_id: String! # идентификатор заказа, в ts PyroObject
	_createdAt: Date # дата создания
	_updatedAt: Date # дата обновления
	carrier: Carrier # курьер, назначенный для заказа
	carrierId: String # идентификатор курьера
	carrierStatus: Int! # статус курьера
	carrierStatusText: String! # текстовый статус курьера
	createdAt: Date # дата создания
	updatedAt: Date # дата обновления
	customer: Customer! # клиент, заказавший товар
	deliveryTime: Date # время, требуемый для доставки
	deliveryTimeEstimate: Int # оставшееся время, требуемый для доставки
	finishedProcessingTime: Date # дата завершения процессинга заказа
	id: String!  # идентификатор заказа
	isCancelled: Boolean! # заказ отменен
	isCompleted: Boolean! # заказ завершен
	isConfirmed: Boolean! # заказ подтвержден
	isPaid: Boolean! # заказ оплачен
	orderCurrency: Int # валюта заказа
	orderNotes: String # заметки заказа
	orderNumber: Int! # номер заказа, автогенерирован
	orderType: Int # тип заказа
	products: [OrderProduct!]! # заказанные товары
	startDeliveryTime: Date # дата начала доставки
	status: Int # статус
	totalPrice: Float! # общая сумма заказа
	waitForCompletion: Boolean # ждать завершение заказа
	warehouse: Warehouse! # магазин
	warehouseId: String! # идентификатор магазина
	warehouseStatus: Int! # статус магазина
	warehouseStatusText: String! # текстовый статус магазина
}

# Заказанный товар
type OrderProduct {
	_id: String! # идентификатор заказанного товара
	comment: String # комментарий заказанного товара
	count: Int! # количество заказанного товара
	initialPrice: Float! # изначальная цена
	isCarrierRequired: Boolean! # требуется курьер
	isDeliveryRequired: Boolean! # требуется доставка
	isManufacturing: Boolean! # производится самим магазином
	isTakeaway: Boolean # на вынос
	price: Float! # текущая цена после применения скидок и акций
	product: Product! # оригинальный товар в базе данных
}

# отмена заказа
type OrderCancelation {
	enabled: Boolean # включена возможность отмены заказа для клиента
	onState: Int # состояние
}

# Товар
type Product {
	_id: String! # идентификатор товара
	_createdAt: Date # дата создания
	_updatedAt: Date # дата обновления
	categories: [String] # категории товара
	description: [TranslateType!]! # описание товара, короче 255 строк
	descriptionHTML: [TranslateType!]! # HTML описание товара, короче 255 строк
	details: [TranslateType!]! # детали товара, без ограничений
	detailsHTML: [TranslateType!]! # HTML детали товара, без ограничений
	id: String! # идентификатор товара
	images: [ImageType!]! # изображения товара
	title: [TranslateType!]! # название товара
}

# Локализация
type TranslateType {
	locale: String! # язык для перевода названия категории
	value: String! # значение названия категории на выбранном языке
}

# Магазин
type Warehouse {
	_createdAt: Date! # дата создания
	_id: String! # идентификатор, в ts PyroObject
	carrierCompetition: Boolean! # нуждается в курьерах
	carriers: [Carrier!] # список курьеров магазина
	carriersIds: [String!] # список id курьеров магазина
	commentsEnabled: Boolean # включена возможность комментирования
	contactEmail: String # контактная почта
	contactPhone: String # контактный телефон
	customers: [Customer!]! # клиенты
	devices: [Device!]! # устройства
	devicesIds: [String!]! # id устройств
	forwardOrdersUsing: [Int!] # использовать в заказах для обратной связи контактный номер, контактную почту или обе сразу
	geoLocation: GeoLocation! # геолокация магазина
	hasRestrictedCarriers: Boolean
	id: String! # идентификатор магазина
	inStoreMode: Boolean! # находится ли в режиме магазина
	isActive: Boolean! # магазин активен
	isCarrierRequired: Boolean # требуется курьер
	isManufacturing: Boolean # производит товар
	isPaymentEnabled: Boolean # включена система оплаты
	logo: String! # логотип магазина
	name: String! # имя магазина
	orderBarcodeType: Int # тип бар-кода для сканирования
	orderCancelation: OrderCancelation! # отмена заказа
	orders: [Order!]! # заказы
	ordersEmail: String # почта заказов
	ordersPhone: String # номер телефона заказов
	ordersShortProcess: Boolean # 
	preferRestrictedCarriersForDelivery: Boolean
	useOnlyRestrictedCarriersForDelivery: Boolean
	usedCarriersIds: [String!] # история курьеров
	username: String! # пользовательское имя владельца магазина 
}
```

___

**Typescript:**

* `packages/common/src/enums/ForwardOrdersMethod.ts`
* `packages/common/src/enums/OrderBarcodeTypes.ts`
* `packages/common/src/interfaces/IWarehouse.ts`
* `packages/common/src/interfaces/IGeoLocation.ts`

* `packages/common/src/entities/GeoLocation.ts`
* `packages/common/src/entities/Warehouse.ts`

* `packages/common/src/routers/IGeoLocationWarehousesRouter.ts`
* `packages/common/src/routers/IWarehouse**Router.ts`
