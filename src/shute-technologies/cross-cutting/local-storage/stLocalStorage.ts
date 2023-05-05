export class STLocalStorage {

  private constructor() {}

  static hasSuport() {
    return typeof(Storage) !== 'undefined';
  }

  static existsData(uid): boolean {
    return !!localStorage.getItem(uid);
  }

  static retrieveData(uid: string): string | null {
    return localStorage.getItem(uid);
  }

  static createData(uid: string, data: string): void {
    localStorage.setItem(uid, data);
  }

  static createTempJSObject<TObj extends Object>(uid: string, data: TObj): void {
    localStorage.setItem(uid, JSON.stringify(data));
  }

  static getTempJSObject<TObj extends Object>(uid: string): TObj {
    const resultData = localStorage.getItem(uid);

    if (resultData) {
      STLocalStorage.removeData(uid);
      return JSON.parse(resultData) as TObj;
    }

    return null;
  }

  static removeData(uid: string): boolean {
    const resultData = localStorage.getItem(uid);

    if (resultData) {
      localStorage.removeItem(uid);
    }

    return !!resultData;
  }
}
