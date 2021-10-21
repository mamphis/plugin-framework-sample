export type EventHandler<T> = (<T>(sender: any, e: T) => Promise<void>|void);
