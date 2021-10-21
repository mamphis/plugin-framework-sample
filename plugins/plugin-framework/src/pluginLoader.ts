import { readdir } from 'fs/promises';
import { join } from 'path';
import { valid, gte, gt } from 'semver';
import { PluginContext } from './plugin/pluginContext';

export class PluginLoader {
    private plugins: Array<Plugin> = [];

    constructor(private appVersion: string) {
        const version = valid(appVersion);
        if (!version) {
            throw new Error(`The version ${appVersion} is not valid.`);
        }

        this.appVersion = version;
    }

    async loadFrom(directory: string) {
        const pluginDirs = await readdir(directory);
        await Promise.all(
            pluginDirs.map((dir) => {
                return this.loadPlugin(join(directory, dir));
            }),
        );
    }

    private async loadPlugin(pluginDir: string) {
        // Load Manifest:
        const manifest: Manifest = require(join(pluginDir, 'manifest.json'));
        // Load VersionFile
        const versions: { [pluginVersion: string]: string } = require(join(
            pluginDir,
            'versions.json',
        ));

        let minPluginVersion;
        // Get Maximum Plugin Version for this appVersion
        for (const pluginVersion in versions) {
            const minAppVersion = versions[pluginVersion];

            // is the minimum app version greater or equal to the current app version
            if (gte(minAppVersion, this.appVersion)) {
                if (!minPluginVersion) {
                    minPluginVersion = pluginVersion;
                } else {
                    // check if the plugin version is greater then the current greatest version
                    if (gt(pluginVersion, minPluginVersion)) {
                        minPluginVersion = pluginVersion;
                    }
                }
            }
        }

        if (!minPluginVersion) {
            // Cannot load Plugin
            return console.warn(
                `cannot load plugin ${manifest.name}, because no version was found that is compatible with the available plugins`,
            );
        }

        if (gt(minPluginVersion, manifest.version)) {
            return console.warn(
                `cannot load plugin ${manifest.name}, because the minimum plugin version (${minPluginVersion}) is greater than the current plugin version (${manifest.version})`,
            );
        }

        const pluginFunctions = require(join(pluginDir, 'main.js'));
        if (!('activate' in pluginFunctions && typeof pluginFunctions.activate === 'function')) {
            return console.warn(
                `cannot load plugin ${manifest.name}, because no activation function was found`,
            );
        }

        const plugin: Plugin = {
            manifest,
            versions,
            activate: pluginFunctions.activate.bind(pluginFunctions),
            deactivate: pluginFunctions.deactivate
                ? pluginFunctions.deactivate.bind(pluginFunctions)
                : () => {},
        };

        this.plugins.push(plugin);
    }

    async activatePlugins(): Promise<PluginContext> {
        const context = new PluginContext();

        await Promise.all(this.plugins.map((plugin) => {
            return plugin.activate(context);
        }));
        
        return context;
    }
}

interface Manifest {
    id: string;
    name: string;
    version: string;
    author: string;
    repositryUrl: string;
}

interface Plugin {
    manifest: Manifest;
    versions: { [pluginVersion: string]: string };
    activate: (context: PluginContext) => void;
    deactivate: () => void;
}
