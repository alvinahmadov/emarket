**Запрос:**

`geoLocationProductsByPaging`- заполучить товары по геолокации и по фильтру с сортировкой.

**Параметры:**

`geoLocation: GeoLocation` - геолокация клиента, необх.

`pagingOptions: IPagingOptions` - параметр для пагинации показа

`options?: IGeoLocationProductsOptions` - доп. опции

`searchText?: string` - текст поиска товара

**Результат:**

`IProductInfo[] | null`

**GraphQL:**

```graphql
query(
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
		...
	}
}
```

___

**Запрос:**

`getCountOfGeoLocationProducts`- заполучить доступное кол-во товаров по геолокации и по фильтру с сортировкой и поиском.

**Параметры:**

`geoLocation: GeoLocation` - геолокация клиента.

`options?: IGeoLocationProductsOptions` - доп. опции.

`searchText?: string` - текст поиска товара.

**Результат:**

`number` - кол-во товаров

**GraphQL:**

```graphql
query(
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
```

**GraphQL Definitions:**

```graphql
scalar Date

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

# Фильтр магазинов
input GeoLocationFindInput {
	city: String # город
	countryId: Int # ISO номер страны (РФ - 189)
	house: String # дом
	loc: Loc # локация
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

input GetGeoLocationProductsOptions {
	imageOrientation: Int
	isDeliveryRequired: Boolean # с доставкой
	isTakeaway: Boolean # навынос
	locale: String # язык
	merchantIds: [String] # ID магазинов
	trackingDistance: Int # Макс. расстояние для отслеживания (неиспользуется)
	withoutCount: Boolean
}

# сортировка пагинации
input PagingSortInput {
	field: String! # сортировать по полю
	sortBy: String! # по убыванию, по возрастанию
}

# пагинация поиска
input PagingOptionsInput {
	limit: Int # сколько элементов брать
	skip: Int # сколько игнорировать
	sort: PagingSortInput # сортировка
}

# Локализация
type TranslateType {
	locale: String! # язык для перевода названия категории
	value: String! # значение названия категории на выбранном языке
}
```

___

**Typescript:**

* `packages/common/src/interfaces/IPagingOptions.ts`
* `packages/common/src/interfaces/IWarehouseProduct.ts`
* `packages/common/src/interfaces/IProductInfo.ts`

* `packages/common/src/routers/IGeoLocationProductsRouter.ts`
* `packages/common/src/routers/IWarehouseProductsRouter.ts`
