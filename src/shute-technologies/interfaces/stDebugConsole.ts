export interface ISTDebugConsole {
  log<TInstance extends Object>(fromClass: TInstance, message?: string | unknown, ...args: string[]): void;
  warn<TInstance extends Object>(fromClass: TInstance, message?: string | unknown, ...args: string[]): void;
  error<TInstance extends Object>(fromClass: TInstance, message?: string | unknown, ...args: string[]): void;
  throwError<TInstance extends Object>(fromClass: TInstance, message?: string | unknown, ...args: string[]): Error;
}
