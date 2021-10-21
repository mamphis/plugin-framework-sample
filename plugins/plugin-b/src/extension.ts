import { PluginContext } from 'plugin-framework/out/plugin';

export function activate(context: PluginContext) {
    const name = "PLUGIN_B";

    context.addHook<void>('system', 'start', (sender, e) => {
        console.log(`Hallo Welt von "${name}"`)
    });
}