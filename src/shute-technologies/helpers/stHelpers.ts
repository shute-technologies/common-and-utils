import { STUtils } from "../utils/stUtils";
import { ICallback1 } from '../interfaces/stInterfaces';

interface IPPDetails {
  isFirstParameter: boolean;
  firstIndex: number;
  lastIndex: number;
  hasNextParameter: boolean;
}

export class STHelpers {

  static callIn<TArg>(time: number, functionCallback: ICallback1<TArg>, args?: TArg) {
    return setTimeout(
      (inputArgs?) => functionCallback(inputArgs),
      time,
      args
    );
  }

  static getDigitsByValue(value: number, numDigits: number): string {
    let s = value.toString();
    const offset = numDigits - s.length;

    for (let i = 0; i < offset; i++) {
      s = '0' + s;
    }

    return s;
  }

  static clone(from) {
    const wasDate = from instanceof Date;
    const cloned = JSON.parse(JSON.stringify(from));

    /* istanbul ignore else */
    if (!wasDate) {
      STHelpers.cloneIterate(cloned);
    }

    return wasDate ? new Date(cloned) : cloned;
  }

  private static cloneIterate(objIterate: Object) {
    if (objIterate) {
      Object.entries(objIterate).forEach(entry => {
        const key = entry[0];

        if (typeof objIterate[key] === 'object') {
          STHelpers.cloneIterate(objIterate[key]);
        } else {
          if (STUtils.isStringActuallyDateRepresentation(objIterate[key])) {
            objIterate[key] = new Date(objIterate[key]);
          }
        }
      });
    }
  }

  static removeTrailingComma(val: string): string {
    val = val.trim();

    const hasComma = val.lastIndexOf(',');

    /* istanbul ignore else */
    if (hasComma !== -1 && hasComma === val.length - 1) {
      return val.substring(0, hasComma);
    }

    return val;
  }

  static formatString(path: string, ...args: string[]): string {
    args.forEach((val, index) => {
      if (!STUtils.isNullOrEmpty(val)) {
        path = path.replace(`{${index}}`, val);
      } else {
        path = STHelpers.removeEmptyParameter(path, index);
      }
    });

    // verify path if have typos at the end
    if (path.indexOf('?') !== -1 && (path.length - 1) === path.indexOf('?')) {
      path = path.substring(0, path.indexOf('?'));
    }

    return path;
  }

  static removeEmptyParameter(path: string, index: number) {
    /* istanbul ignore else */
    if (STHelpers.isParameterProperty(path, index)) {
      const paramPropDetails = STHelpers.getParameterPropertyDetails(path, index);
      path = STHelpers.removeParameterPropOfPath(path, paramPropDetails);
    }

    return path;
  }

  private static isParameterProperty(path: string, index: number): boolean {
    const parameterValueIndex = path.indexOf(`{${index}}`);
    return path[parameterValueIndex - 1] === '=';
  }

  private static getParameterPropertyDetails(path: string, index: number): IPPDetails {
    const parameterValueIndex = path.indexOf(`{${index}}`);
    let newIndex = 1;
    let canStillIterate = true;
    let isFirstParameter = false;

    while (canStillIterate) {
      /* istanbul ignore else */
      if (path[parameterValueIndex - newIndex] === '?') {
        canStillIterate = false;
        isFirstParameter = true;
      } else if (path[parameterValueIndex - newIndex] === '&'){
        canStillIterate = false;
      }

      newIndex++;
    }

    return {
      isFirstParameter,
      firstIndex: parameterValueIndex - newIndex + 1,
      lastIndex: path.indexOf('}', parameterValueIndex) + 1,
      hasNextParameter: path.indexOf(`{${index}}`, parameterValueIndex) !== -1
    };
  }

  private static removeParameterPropOfPath(path: string, ppDetails: IPPDetails): string {
    return ppDetails.isFirstParameter
      ? `${path.substring(0, ppDetails.firstIndex)}${'?'}${path.substring(ppDetails.hasNextParameter ? ppDetails.lastIndex + 1 : ppDetails.lastIndex)}`
      : path.substring(0, ppDetails.firstIndex) + (ppDetails.hasNextParameter ? '' : '&') + path.substring(ppDetails.lastIndex);
  }
  
  static eraseCharsInString(baseString: string, asciiChars: Array<string>): string {
    for (const char of asciiChars) {
      baseString = baseString.replace(char, '');
    }

    return baseString;
  }
}
