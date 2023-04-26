export type IFunction0<TResult> = () => TResult;
export type IFunction1<T, TResult> = (args?: T) => TResult;
export type IRqFunction1<T, TResult> = (args: T) => TResult;
export type IFunction2<T0, T1, TResult> = (a0?: T0, a1?: T1) => TResult;
export type IFunction3<T0, T1, T2, TResult> = (a0?: T0, a1?: T1, a2?: T2) => TResult;
export type IFunction4<T0, T1, T2, T3, TResult> = (a0?: T0, a1?: T1, a2?: T2, a3?: T3) => TResult;
export type IFunction5<T0, T1, T2, T3, T4, TResult> = (a0?: T0, a1?: T1, a2?: T2, a3?: T3, a4?: T4) => TResult;

export type ICallback0 = () => void;
export type ICallback1<T> = (args?: T) => void;
export type ICallback2<T0, T1> = (a0?: T0, a1?: T1) => void;
export type ICallback3<T0, T1, T2> = (a0?: T0, a1?: T1, a2?: T2) => void;
export type ICallback4<T0, T1, T2, T3> = (a0?: T0, a1?: T1, a2?: T2, a3?: T3) => void;
export type ICallback5<T0, T1, T2, T3, T4> = (a0?: T0, a1?: T1, a2?: T2, a3?: T3, a4?: T4) => void;

export interface IDictionary<T> { [Key: string]: T; }
export type IConstructor<TClassDefinition> = new (...args: unknown[]) => TClassDefinition;

export interface WEJSNativeObject<TClassDefinition> {
  type: IConstructor<TClassDefinition>;
  typeName: string;
}
