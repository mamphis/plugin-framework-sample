import { PluginContext } from 'plugin-framework/out/plugin';

export function activate(context: PluginContext) {
    const name = "PLUGIN_A";
    context.addHook<void>('system', 'start', async (sender, e) => {
        console.log(`Hallo Welt von "${name}"`);
        const response = await context.axios('https://example.com/');
        console.log(response.status);
    });
}