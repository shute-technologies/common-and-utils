export type SimpleCallback = (args?) => void;
export type SimpleGCallback<T> = (args?: T) => void;
export type SimpleGRequiredCallback<T> = (args: T) => void;
export interface IDictionary<T> { [Key: string]: T; }
export interface IConstructor<T> { new(): T; }