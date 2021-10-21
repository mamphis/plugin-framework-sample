
import axios from 'axios';
import { resolve } from 'path';
import { PluginLoader } from 'plugin-framework/out';

const pluginLoader = new PluginLoader('1.0.0');

function start() {
    pluginLoader.loadFrom(resolve(__dirname, '../plugins')).then(async () => {
        const context = await pluginLoader.activatePlugins({ axios });
        pluginLoader.fire('system', 'start', undefined, undefined);
    });
}

start();
