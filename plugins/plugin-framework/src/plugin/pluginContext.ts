import EventEmitter from 'events';
import { EventHandler } from '../helper/eventHandler';
import { Plugin } from '../pluginLoader';
import { Hook } from './hook';
import { Option, ValidOptionValueTypes } from './option';

export class PluginContext {
    private hooks: Hook<any>[] = [];
    private options: Option<ValidOptionValueTypes>[] = [];

    constructor(eventEmitter: EventEmitter) {
        eventEmitter.on('hook', (target: string, event: string, sender: any, e: any) => {
            this.hooks
                .filter((hook) => hook.target === target && hook.event === event)
                .forEach(async (hook) => {
                    await hook.eventHandler(sender, e);
                });
        });
        eventEmitter.on(
            'optionChange',
            async (pluginName: string, key: string, newValue: ValidOptionValueTypes) => {
                const option: Option<ValidOptionValueTypes> | undefined = this.options.find(
                    (option) => option.key === key && option.plugin.manifest.name === pluginName,
                );

                if (!option) {
                    return;
                }

                const oldValue = { oldValue: option.value };
                option.value = newValue;
                option.onchange?.call(option, { newValue, ...oldValue });
                // await option.onChange?.call(option, option, { newValue, oldValue });
            },
        );
    }

    getOptions() {
        return this.options.map((option) => ({
            pluginName: option.plugin.manifest.name,
            key: option.key,
            value: option.value,
            caption: option.name,
            description: option.description,
        }));
    }

    addHook<T>(target: string, event: string, eventHandler: EventHandler<T>): void {
        this.hooks.push({
            target,
            event,
            eventHandler,
        });
    }

    addOption<T extends ValidOptionValueTypes>(
        key: string,
        defaultValue: T,
        caption: string,
        description: string,
    ): Option<T> {
        if (!this.plugin) {
            throw new Error(`Cannot create option, because internal plugin was not set.`);
        }

        const option = new Option(this.plugin, key, defaultValue, caption, description);

        this.options.push(option);

        return option;
    }

    private plugin?: Plugin;

    inContextOf(plugin: Plugin) {
        this.plugin = plugin;
        return this;
    }
}
