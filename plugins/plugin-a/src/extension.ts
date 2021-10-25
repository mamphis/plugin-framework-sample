import { PluginContext } from 'plugin-framework/out/plugin';
import { OptionChangeEvent } from 'plugin-framework/out/plugin/option';

export function activate(context: PluginContext) {
    const name = 'PLUGIN_A';
    context.addHook<void>('system', 'start', async (sender, e) => {
        console.log(`Hallo Welt von "${name}"`);
        const response = await context.axios('https://example.com/');
        console.log(response.status);
    });

    const option = context.addOption<string>('importantSetting', '', '', '');
    option.onchange = (ev) => {
        console.log('Settings were changed.', ev);
    };
}
