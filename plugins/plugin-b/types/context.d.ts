import { EventHandler } from 'plugin-framework/out/helper/eventHandler';

declare module 'plugin-framework' {
    export declare class PluginContext {
        addHook<T>(
            target: 'system',
            event: 'start',
            handler: (sender: any, e: EventHandler<void>) => void,
        );
    }
}
