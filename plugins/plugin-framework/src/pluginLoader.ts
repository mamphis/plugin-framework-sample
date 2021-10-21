import EventEmitter from 'events';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { valid, gte, gt } from 'semver';
import { PluginContext } from './plugin/pluginContext';

export class PluginLoader {
    private plugins: Array<Plugin> = [];
    private context: PluginContext;
    private readonly eventEmitter: EventEmitter;

    constructor(private appVersion: string) {
        const version = valid(appVersion);
        if (!version) {
            throw new Error(`The version ${appVersion} is not valid.`);
        }

        this.appVersion = version;
        this.eventEmitter = new EventEmitter();
        this.context = new PluginContext(this.eventEmitter);
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

        let pluginFunctions;
        try {
            pluginFunctions = require(join(pluginDir, manifest.entryPoint));
        } catch (e: any) {
            return console.log(`cannot load plugin ${manifest.name}: ${e.message} `);
        }

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

    async activatePlugins<T>(context: T): Promise<PluginContext & T> {
        this.context = Object.assign(this.context, context);
        await Promise.all(
            this.plugins.map((plugin) => {
                return plugin.activate(this.context);
            }),
        );

        return this.context as PluginContext & T;
    }

    fireHook(target: string, event: string, sender: any, e: any) {
        this.eventEmitter.emit('hook', target, event, sender, e);
    }
}

interface Manifest {
    id: string;
    name: string;
    version: string;
    author: string;
    repositryUrl: string;
    entryPoint: string;
}

interface Plugin {
    manifest: Manifest;
    versions: { [pluginVersion: string]: string };
    activate: (context: PluginContext) => void;
    deactivate: () => void;
}
