import { ICallback1, IConstructor } from '../interfaces/stInterfaces';
import { STEnumHTTPErrorCode } from '../enums/stEnumHttpErrorCode';
import { Base64Binary } from '@external-libs-from-st/base64-binary';
import { ISTDebugConsole } from '../interfaces/stDebugConsole';

export class STUtils {

  static staticDebugConsole: ISTDebugConsole;

  private static readonly _regExDate = new RegExp('^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$');

  static isNullOrEmpty(val: string): boolean {
    val = val ? val.toString() : val;
    return val ? val.trim().length === 0 : true;
  }

  static isString(value): boolean {
    return typeof value === 'string' || value instanceof String;
  }

  static isObjectEmpty(obj: Object) {
    return Object.keys(obj).length === 0;
  }

  static ternaryNotNull<T>(param: {}, trueCondition: T, falseCondition: T): T {
    return !!param ? trueCondition : falseCondition;
  }

  static replaceAllInString(sourceString: string, search: string, replacement: string): string {
    return sourceString.split(search).join(replacement);
  }

  static isStringActuallyDateRepresentation(stringDate: string): boolean {
    return STUtils._regExDate.test(stringDate);
  }

  static instanceByClassName (className: string, params?) {
    return new Function('arg1', `return new ${className}(arg1)`)(params);
  }

  static instanceByType<T>(type: IConstructor<T>): T {
    return new type();
  }

  static instanceByTypeWithArgs<T extends Object>(type: IConstructor<T>, ...args: any[]): T {
    return new type(...args);
  }

  static isPowerOfTwo (x: number): boolean {
    return (x & (x - 1)) === 0;
  }

  static nextHighestPowerOfTwo (x: number) {
    --x;

    for (let i = 1; i < 32; i <<= 1) {
        x = x | x >> i;
    }
    return x + 1;
  }

  static createGuid (): string {
    const lut: Array<string> = [];

    for (let i = 0; i < 256; i++) {
      lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
    }

    const d0 = Math.random() * 0x100000000 >>> 0;
    const d1 = Math.random() * 0x100000000 >>> 0;
    const d2 = Math.random() * 0x100000000 >>> 0;
    const d3 = Math.random() * 0x100000000 >>> 0;

    return lut[d0&0xff] + lut[d0>>8&0xff] + lut[d0>>16&0xff] + lut[d0>>24&0xff]+ '-' +
      lut[d1&0xff] + lut[d1>>8&0xff] + '-' + lut[d1>>16&0x0f|0x40] + lut[d1>>24&0xff]+ '-' +
      lut[d2&0x3f|0x80] + lut[d2>>8&0xff] + '-' + lut[d2>>16&0xff] + lut[d2>>24&0xff]+
      lut[d3&0xff] + lut[d3>>8&0xff] + lut[d3>>16&0xff] + lut[d3>>24&0xff];
  }

  static countPropertiesInObject (object: Object) {
    let count = 0;

    for (const k of Object.keys(object)) {
      if (object.hasOwnProperty(k)) {
        ++count;
      }
    }

    return count;
  }

  static arrayInsertArray <T>(arrayTarget: Array<T>, index: number, arrayNew: Array<T>): Array<T> {
    for (let i = arrayNew.length - 1; i >= 0; i--) {
      arrayTarget.splice(index, 0, arrayNew[i]);
    }

    return arrayTarget;
  }

  static isNullOrUndefinedOrWhiteSpace (text: string): boolean {
    let result = text === undefined || text === null;
    result = !result ? text.length === 0 : result;
    return result;
  }

  static getFileNameWithoutExtension (fullPath: string): string {
    return fullPath.substr(0, fullPath.lastIndexOf('.'));
  }

  static getFileNameFromPath (fullPath: string): string {
    return fullPath.replace(/^.*(\\|\/|\:)/, '');
  }

  static getExtensionFromFileName (fullPath: string): string {
    return fullPath.substr(fullPath.lastIndexOf('.') + 1);
  }

  static validateFileType (fileType: string, optionalFileName: string): string {
    if (optionalFileName && fileType.trim().length === 0) {
      fileType = STUtils.getExtensionFromFileName(optionalFileName);
      fileType = 'text/' + fileType;
    }

    return fileType;
  }

  static ajaxJustGetHtml<TArg> (url: string, args?: TArg): Promise<{ content: string, args?: TArg}> {
    return new Promise((resolverSuccess, resolverReject) => {
      const successCallback = (html: string) => { resolverSuccess({ content: html, args }); };
      const rejectCallback = () => { resolverReject(); };

      const jqxhr = $.get(url, successCallback, 'html');
      jqxhr.fail(rejectCallback);
    });
  }

  static ajaxGetHtmlValAndExec<TArg> (url: string, args?: TArg): Promise<{ content: string, args?: TArg}> {
    return new Promise((resolverSuccess, resolverReject) => {
      const successCallback = (html: string) => {
        STUtils.validateAndExecuteHtml(html);
        resolverSuccess({ content: html, args });
      };
      const rejectCallback = () => { resolverReject(); };

      const jqxhr = $.get(url, successCallback, 'html');
      jqxhr.fail(rejectCallback);
    });
  }

  static validateAndExecuteHtml (html: string): void {
    const scriptAttached = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/im);

    if (scriptAttached) {
      try {
        // tslint:disable-next-line: no-eval
        eval(scriptAttached[1]);
      } catch (e) {
        if (e instanceof SyntaxError) {
          STUtils.staticDebugConsole.error(this, e);
        }
      }
    }
  }

  static dynamicLoadAndAppendCss<T>(cssPath: string, args?: T): Promise<{ content: HTMLLinkElement, args?: T }> {
    return new Promise((resolverSuccess) => {
      // Create new link Element
      const link = document.createElement('link');
      // set the attributes for link element
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = cssPath;

      // Get HTML head element to append link element to it
      document.getElementsByTagName('HEAD')[0].appendChild(link);

      resolverSuccess({ content: link, args });
    });
  }

  static mergeObjects<T1 extends Object, T2 extends Object> (obj1: T1, obj2: T2): T1 & T2 {
    const resultObj = {} as T1 & T2;

    for (const attrName of Object.keys(obj1)) { resultObj[attrName.toString()] = obj1[attrName]; }
    for (const attrName of Object.keys(obj2)) { resultObj[attrName.toString()] = obj2[attrName]; }

    return resultObj;
  }

  static onLoseFocus (jqueryElement: JQuery<HTMLElement> | JQuery<Document>, parentId: string, onCallback: ICallback1<boolean>, eventNameSpace: string) {
    const eventType = !eventNameSpace ? 'click' : `click.${eventNameSpace}`;

    jqueryElement.on(eventType, (event) => {
      let result = true;
      const currentTarget = $(event.target);
      const parents = currentTarget.parents();
      const parentArrayIds = parentId.split(',');

      if (STUtils.compareWithMultiple(currentTarget.attr('id'), parentArrayIds)) {
        result = false;
      } else {
        for (const element of parents) {
          if (STUtils.compareWithMultiple($(element).attr('id'), parentArrayIds)) {
            result = false;
            break;
          }
        }
      }

      if (onCallback) { onCallback(result); }
    });
  }

  static compareWithMultiple<T> (value: T, arrayValues: T[]): boolean {
    return arrayValues.some((x) => x === value);
  }

  static verifyFixFileNameExtension (fileName: string, fileExtension: string): string {
    const indexExtension = fileName.lastIndexOf('.');

    // Add extension if doesn't have it, this usually happen when is a new node.
    if (indexExtension === -1) {
      fileName = `${fileName}.${fileExtension}`;
    } else { // Verify the extension and fix it if is neccesary
      const fileNameExt = fileName.substring(indexExtension + 1, fileName.length);

      if (fileNameExt !== fileExtension) {
        const fileNameNoExt = fileName.substr(0, indexExtension);
        fileName = `${fileNameNoExt}.${fileExtension}`;
      }
    }

    return fileName;
  }

  static existsClass (classString: string, className: string) {
    let resultExists = false;

    if (classString) {
      resultExists = classString
        .split(' ')
        .some((x) => x === className);
    }

    return resultExists;
  }

  static cloneObjectContainer<T> (item: T): T {
    const result = {} as T;

    for (const name of Object.keys(item)) {
      result[name] = item[name];
    }

    return result;
  }

  static deepClone<T> (item: T): T {
    return JSON.parse(JSON.stringify(item));
  }

  static isServerHostReachable (): boolean {
    // Handle IE and more capable browsers
    const xhr = new (window.ActiveXObject || XMLHttpRequest)( 'Microsoft.XMLHTTP' ) as XMLHttpRequest;
    // Open new request as a HEAD to the root hostname with a random param to bust the cache
    xhr.open('HEAD', `//${window.location.hostname}/?rand=${Math.floor((1 + Math.random()) * 0x10000)}`, false);

    // Issue request and handle response
    try {
      xhr.send();
      return ( xhr.status >= STEnumHTTPErrorCode.Ok &&
        (xhr.status < STEnumHTTPErrorCode.MultipleChoices || xhr.status === STEnumHTTPErrorCode.NotModified) ||
        xhr.status === STEnumHTTPErrorCode.NotFound);
    } catch (error) {
      return false;
    }
  }

  static downloadToDesktop (strData: string, strFileName: string, strMimeType: string): boolean {
    const D = document,
      a = D.createElement('a');
    strMimeType = strMimeType || 'application/octet-stream';

    if (navigator['msSaveBlob']) { // IE10
      return navigator['msSaveBlob'](new Blob([strData], { type: strMimeType }), strFileName);
    } /* end if(navigator.msSaveBlob) */

    if ('download' in a) { // html5 A[download]
      a.href = `data:${strMimeType},${encodeURIComponent(strData)}`;
      a.setAttribute('download', strFileName);
      a.innerHTML = 'downloading...';
      D.body.appendChild(a);
      setTimeout(() => {
        a.click();
        D.body.removeChild(a);
      }, 66);

      return true;
    } /* end if('download' in a) */

    // do iframe dataURL download (old ch+FF):
    const f = D.createElement('iframe');
    D.body.appendChild(f);
    f.src = `data:${strMimeType},${encodeURIComponent(strData)}`;

    setTimeout(() => D.body.removeChild(f), 333);

    return true;
  }

  static uint8ArrayToBase64 (uint8Array: Uint8Array): string {
    let binary = '';
    const length = uint8Array.byteLength;

    for (let i = 0; i < length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }

    return window.btoa(binary);
  }

  static arrayBufferToBase64 (buffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const length = bytes.byteLength;

    for (let i = 0; i < length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return window.btoa(binary);
  }

  static base64ToArrayBuffer (base64String: string): ArrayBuffer {
    return Base64Binary.decodeArrayBuffer(base64String);
  }

  static getIndexCoincidenceOn (phrase: string, word: string): { word: string, index: number }[] {
    const result: { word: string, index: number }[] = [];

    let cIndex = 0;
    let iterate = true;
    const wordLength = word.length - 1;

    while (iterate) {
      const wordIndex = phrase.indexOf(word, cIndex);
      iterate = wordIndex !== -1;

      if (iterate) {
        cIndex = cIndex = (wordIndex + wordLength);

        result.push({
          word,
          index: wordIndex
        });
      }
    }

    return result;
  }

  static findPreviousChar (word: string, excludeChars: string[], startIndex: number): { previousChar: string, index: number } {
    let resultChar = '';
    let iterate = true;
    let index = startIndex;

    while (iterate) {
      const newChar = word.charAt(index--);

      if (excludeChars.some((x) => x === newChar)) { continue; }

      resultChar = newChar;
      iterate = false;

      if (index < 0) {
        iterate = false;
      }
    }

    return {
      previousChar: resultChar,
      index
    };
  }

  static findNextChar (word: string, excludeChars: string[], startIndex: number): { nextChar: string, index: number } {
    let resultChar = '';
    let iterate = true;
    let index = startIndex;
    const wordLength = word.length;

    while (iterate) {
      const newChar = word.charAt(index++);

      if (excludeChars.some((x) => x === newChar)) { continue; }

      resultChar = newChar;
      iterate = false;

      if (index >= wordLength) {
        iterate = false;
      }
    }

    return {
      nextChar: resultChar,
      index: index - 1
    };
  }

  static findClosingChar (word: string, charStart: string, charEnd: string, startIndex: number) {
    let resultIndex = 0;
    let iterate = true;
    let countChars = 0;
    let countCharStart = 0;
    let countCharEnd = 0;
    const wordLength = word.length;

    while (iterate) {
      const char = word.charAt(startIndex + countChars++);

      if (char === charStart) { countCharStart++; }
      else if (char === charEnd) { countCharEnd++; }

      if (countCharStart === countCharEnd && (countCharStart !== 0 && countCharEnd !== 0)) {
        iterate = false;
        resultIndex = startIndex + (countChars - 1);
      }

      if (iterate && ((startIndex + countChars) >= wordLength)) {
        iterate = false;
      }
    }

    return resultIndex;
  }

  static number2Binary (num: number) {
    return (num >>> 0).toString(2);
  }

  static binary2Number (binaryString: string): number {
    return parseInt(binaryString, 2);
  }

  static rangeLimiter(val: number, min: number, max: number): number {
    val = val >= max ? max : val;
    val = val <= min ? min : val;
    return val;
  }

  static eraseCharsInString(baseString: string, asciiChars: Array<string>): string {
    for (let i = 0; i < asciiChars.length; i++) {
      baseString = baseString.replace(asciiChars[i], '');
    }

    return baseString;
  }

  static existsPropertyAndValue<T>(obj: T, key: keyof T): boolean {
    return obj && obj.hasOwnProperty(key) && !STUtils.isNullOrEmpty(obj[key].toString());
  }

  static getPropertyValueOrDefault<T, K extends keyof T>(obj: T, key: K, defaultValue: T[K]): T[K] {
    return STUtils.existsPropertyAndValue(obj, key)
      ? obj[key]
      : defaultValue;
  }

  static doesObjImplementsFunctionFromInterface<BaseClass, ImplInterface>(obj: BaseClass | ImplInterface, functionName: string): obj is ImplInterface {
    return !!(obj as ImplInterface)[functionName];
  }

  static isFunction(obj): boolean {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  }

  static escapeHtml (html: string) {
    const entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    };

    return String(html).replace(/[&<>"'`=\/]/g, (s) => entityMap[s]);
  }
}
