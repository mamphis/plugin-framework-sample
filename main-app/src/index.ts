import axios from 'axios';
import { resolve } from 'path';
import { PluginLoader } from 'plugin-framework/out';

const pluginLoader = new PluginLoader('1.0.0');

function start() {
    pluginLoader.loadFrom(resolve(__dirname, '../plugins')).then(async () => {
        const context = await pluginLoader.activatePlugins({ axios });
        pluginLoader.fireHook('system', 'start', undefined, undefined);

        console.log(pluginLoader.options);
        const p = pluginLoader.options[0];
        if (p) {
            pluginLoader.fireOptionChanged(p.pluginName, p.key, "Das ist voll der test");
        }
    });
}

start();
