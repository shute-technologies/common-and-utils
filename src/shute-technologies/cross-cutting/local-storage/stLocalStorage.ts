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

  static createTempJSObject(uid: string, data: string): void {
    localStorage.setItem(uid, JSON.stringify(data));
  }

  static getTempJSObject(uid: string) {
    const resultData = localStorage.getItem(uid);

    if (resultData) {
      STLocalStorage.removeData(uid);
      return JSON.parse(resultData);
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
