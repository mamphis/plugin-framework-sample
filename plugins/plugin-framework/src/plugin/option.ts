import { Plugin } from "../pluginLoader";

export type ValidOptionValueTypes = boolean | string | number;
export type OptionChangeEvent<T extends ValidOptionValueTypes> = { newValue: T; oldValue: T };

export class Option<T extends ValidOptionValueTypes> {
    constructor(
        public readonly plugin: Plugin,
        public readonly key: string,
        public value: T,
        public readonly name: string,
        public readonly description: string,
    ) {}

    onchange?: (<K extends T>(this: Option<K>, ev: OptionChangeEvent<K>) => void | Promise<void>);
}
