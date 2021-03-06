import { routerMetadata } from './metadata';
import { Listener }       from '../listener/listener';

export const RouterSymbol = Symbol('Router');

export interface IRouter {}

export const routerName = (name: string): ClassDecorator =>
		Reflect.metadata(routerMetadata.name, name);

export const getRouterName = (router: IRouter): string =>
		Reflect.getMetadata(routerMetadata.name, router.constructor);

export const getListeners = (router: IRouter): Array<Listener<any>> =>
		Reflect.getMetadata(routerMetadata.listeners, router.constructor);
