import { EventHandler } from 'plugin-framework/out/helper/eventHandler';
import axios from 'axios';

declare module 'plugin-framework/out/plugin' {
    export declare class PluginContext {
        addHook<T>(
            target: 'system',
            event: 'start',
            handler: (sender: any, e: EventHandler<void>) => void,
        );
        axios: typeof axios;
    }
}
