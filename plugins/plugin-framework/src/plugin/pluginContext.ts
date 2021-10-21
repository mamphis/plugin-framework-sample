import { EventHandler } from '../helper/eventHandler';
import { Hook } from './hook';

export class PluginContext {
    private hooks: Hook<any>[] = [];

    addHook<T>(target: string, event: string, eventHandler: EventHandler<T>): void {
        this.hooks.push({
            target,
            event,
            eventHandler,
        });
    }
}
