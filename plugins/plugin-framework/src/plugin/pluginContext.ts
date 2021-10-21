import EventEmitter from 'events';
import { PluginLoader } from '..';
import { EventHandler } from '../helper/eventHandler';
import { Hook } from './hook';

export class PluginContext {
    private hooks: Hook<any>[] = [];

    constructor(eventEmitter: EventEmitter) {
        eventEmitter.on('hook', (target: string, event: string, sender: any, e: any) => {
            this.hooks
                .filter((hook) => hook.target === target && hook.event === event)
                .forEach(async (hook) => {
                    await hook.eventHandler(sender, e);
                });
        });
    }

    addHook<T>(
        target: string,
        event: string,
        eventHandler: EventHandler<T>,
    ): void {
        this.hooks.push({
            target,
            event,
            eventHandler,
        });
    }
}
