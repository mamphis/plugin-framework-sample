import { EventHandler } from '../helper/eventHandler';

export interface Hook<T> {
    target: string;
    event: string;
    eventHandler: EventHandler<T>;
}
