# API Бэкенда

Это проект API Бэкенда в реальном времени, написанный на [TypeScript](https://www.typescriptlang.org/) с использованием [NodeJS](https://nodejs.org/), [NestJS](https://nestjs.com)
, [ExpressJS](https://expressjs.com/) и других библиотек.

Он включает в себя/имеет функции:

- **API в Real-time** - В проекте используется [Socket.IO](https://socket.io/) и [RxJS](http://reactivex.io/rxjs/) за реактивность и работу в режиме реального времени.
- **БД** - [MongoDB](https://www.mongodb.com/) используется в качестве БД и [Mongoose](http://mongoosejs.com/) в качестве ORM.
- **Развертывание** - Производственные версии могут быть развернуты в [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/), с использованием [PM2](http://pm2.io/) для
  кластеризации и отказоустойчивости.
- **Прием Платежей** - через Stripe API, ЮКасса и Bitpay.

#### Основной стек:

- [TypeScript](https://www.typescriptlang.org).
- [NodeJS](https://nodejs.org) - Среда выполнения.
- [NestJS](https://nestjs.com) - Прогрессивный Node.js платформа для создания эффективных, надежных и масштабируемых серверных приложений.
- [MongoDB](https://www.mongodb.com/) - База данных.
- [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/) -Хостинг (по желанию).
- [Stripe API](https://stripe.com/docs/api/node) - Прием платежей.

#### Также используется:

- [ExpressJS](https://expressjs.com/) - Веб фрэймворк
- [Socket.IO](https://socket.io/) - Для Real-time API
- [RxJS](http://reactivex.io/rxjs/) - Для Реактивного/Событийного программирования
- [InversifyJS](http://inversify.io/) - Управление инверсией (внедрение зависимостей, используемое в дополнение к NestJS DI)
- [Mongoose](http://mongoosejs.com/) - ORM
- [PM2](http://pm2.io/) - Диспетчер производственных процессов Node JS (необязательно, используется в производственных средах)

## Использование

### Установка

1. Установите зависимости, запустив:
    ```
    $ yarn install
    ```
2. Найдите `.env.template`, создайте `.env` с теми же переменными и заполните их соответствующим образом.

### Начало

Просто запустите:

```
$ yarn start
```

_Примечание: убедитесь, что у вас установлен MongoDB локально с настройками по умолчанию_

### Тестирование

Для запуска тестов выполните следующую команду:

```
$ yarn run test
```

## Структура Бэкенда

```
/.ebextensions  - папка с файлами конфигурации AWS Elastic Beanstalk.
/.elasticbeanstalk  - папка с файлами конфигурации AWS Elastic Beanstalk.
/build - каталог сборки транспилера TypeScript.
/certificates - SSL сертификаты (необъязательно)
/dist - каталог вывода сборки WebPack
/docker - конфигурация докера (в настоящее время не используется)
/node_modules - папка с пакетами NPM (созданная после `yarn install`)
/res - Ресурсы, такие как страницы, которые отправляются клиентам в текстовой форме или в формате json.

/src - Весь код проекта
|-->/app.ts - Основной файл приложения.
|-->/inversify.config.ts - Конфигурация Внедрения Зависимостей.
|-->/pm2bootstrap.ts - Файл AWS запускается для запуска программы.
|
|-->/main - Основной файл приложения
|-->/modules -  содержит общие модули, используемые в этом проекте.
|-->/pyro - Пользовательская библиотека для ввода-вывода сокетов и обертывания mongoose классами.
\-->/test - Тестовый код

/tmp/logs - Все журналы, созданные во время работы сервера локально или в рабочей среде

/.env - Файл конфигурации. (который должен быть создан из .env.template)
/.env.template - Шаблон файла конфигурации.
/package.json - Файл конфигурации пакетов NPM.
/tsconfig.json - Конфигурационный файл компилятора TypeScript.
```

## Pyro - Custom-built Micro-Framework

### Pyro DB

Pyro DB это оболочка для mongoose, написанная на TypeScript, которая позволяет объявлять подобные модели:

```typescript
@ModelName('User')
class User extends DBObject<IUser, IUserCreateObject> implements IUser
{
	
	@Schema({ type: String, required: false })
	public firstName?: string;
	
	@Schema({ type: String, required: false })
	public lastName?: string;
	
	@Schema({ type: String, required: false })
	public email?: string;
	
	@Schema(getSchema(GeoLocation)) public geoLocation: GeoLocation;
	@Types.String() public apartment: string;
	
	@Schema({ type: String, required: false })
	public stripeCustomerId?: string;
	
	@Schema([String]) public devicesIds: string[];
}
```

- Декоратор `@ModelName` сигнализирует о том, что класс является моделью.
  `@Schema` указывает схему некоторого поля, `getSchema` используется для использования встраивания другой модели.
- `@Types.String(default)`, `@Types.Number(default)`, `@Types.Boolean(default)` и `@Types.Date(default)` используются для примитивных схем. Все они не могут быть аннулированы по
  умолчанию..
- Чтобы сделать ссылку на какую-то модель в другой коллекции. `@Types.Ref` используется вот так:

  ```typescript
  @Types.Ref(Carrier, { required: false })
  ```

Оно также содержит абстрактный базовый класс `DBService`, который содержит базовые операции для каждой модели с коллекцией в базе данных. Он имеет следующую структуру:

```typescript
export interface IDBService<CreateObject, DBObject extends CreateObject>
{
	create(createObject: CreateObject): Promise<DBObject>;
	
	remove(objectId: string): Promise<void>;
	
	removeAll(): Promise<void>;
	
	get(objectId: string): Observable<DBObject | null>;
	
	getMultiple(ids: string[]): Observable<DBObject[]>;
	
	find(conditions): Promise<DBObject[]>;
	
	findOne(conditions): Promise<DBObject | null>;
	
	update(objectId: string, updateObj: any): Promise<DBObject>;
	
	updateMultiple(findObj: any, updateObj: any): Promise<DBObject[]>;
	
	updateMultipleByIds(ids: string[], updateObj: any): Promise<DBObject[]>;
}
```

Многие услуги в этих проектах расширяют `DBService`, например:

```typescript
class WarehousesService extends DBService<IWarehouseCreateObject, IWarehouse, Warehouse> implements IWarehouseRouter, IService
{
	public readonly DBObject = Warehouse;
	
	//...
	
	@observableListener()
	get(id: string)
	{
		return super.get(id);
	}
}
````

Чтобы сделать любой метод `DBService` общедоступным как часть API, пожалуйста, используйте `@<some>Listener` из Pyro IO.

### Pyro IO

#### Обзор

Позволяет объявлять маршрутизаторы с автоматически сгенерированным API Socket.io прямо внутри существующих сервисов. Это позволяет выполнять соответствующие методы обслуживания из
входящих сообщений WebSocket и отвечать на них без необходимости создания дополнительных контроллеров поверх служб

````typescript
@routerName('users')
class UsersService
{
	// returns Observable!
	@observableListener()
	get(id: string): Observable<User>
	{
		// ...
	}
	
	// returns Promise!
	@asyncListener()
	async register(user: IUserCreateObject): Promise<User>
	{
		// ...
	}
}
````

#### Декораторы

- `@routerName` - помечает класс как маршрутизатор. Это позволяет вызывать методы обслуживания через соединение WebSockets.
- `@observableListener()` используется для пометки методов, возвращающих наблюдаемое, что позволяет передавать данные клиенту в режиме реального времени.
- `@asyncListener()` используется для пометки методов, возвращающих обещание, что позволяет возвращать клиенту однократный ответ.
