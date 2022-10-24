let pathDelimiter = '/';

type ExceptObject
  = boolean
  | number
  | string
  | null
  | undefined
  | ExceptObject[]

type JsTypes
  = boolean
  | number
  | string
  | null
  | undefined
  | object
  | JsTypes[]

// TODO :: Fix this `any` type later
function isJsonObject(obj: any) {
  if (obj === undefined || obj === null) return false;

  const primitiveConstructor = [Number, String, Boolean];
  if (primitiveConstructor.includes(obj.constructor)) return false;
  if (obj.constructor === Array) return false;

  return obj.constructor === Object;
}

function flattenObj(obj: object) {
  if (!isJsonObject(obj)) return obj;

  const resultObj: { [key: string]: ExceptObject } = {};

  for (const [key, value] of Object.entries(obj)) {
    if (isJsonObject(value)) {
      const childObj = flattenObj(value),
        childEntries = Object.entries(childObj);

      if (childEntries.length === 0) {
        resultObj[key] = '{}';
        continue;
      }

      for (const [childKey, childValue] of childEntries)
        resultObj[key + pathDelimiter + childKey] = childValue;
    } else {
      resultObj[key] = value;
    }
  }

  return resultObj;
}

function accessNestedParams(nestedObj: { [key: string]: JsTypes }, flattenedKey: string) {
  const splittedKeys = flattenedKey.split(pathDelimiter);

  let valueRef: { [key: string]: JsTypes } | string | number | boolean | any[] = nestedObj;

  for (const key of splittedKeys) {
    if (
      valueRef === undefined ||
      valueRef === null ||
      valueRef.constructor !== Object
    ) return valueRef;

    if (valueRef && valueRef.constructor === Object)
      valueRef = valueRef[key] as { [key: string]: JsTypes };
  }
  return valueRef;
}

type Children = HeaderObject[] | null

interface HeaderObject {
  key: string
  , children: Children
  , length: number
}

function formHeaderObj(obj: object, row = 0): [HeaderObject[], number] {
  const result: HeaderObject[] = [];

  let localMaxLevel = row;

  for (const [key, value] of Object.entries(obj)) {
    let children: Children = null,
      length = 1, // Width in units
      level;

    if (isJsonObject(value) && Object.keys(value).length) {
      [children, level] = formHeaderObj(value, row + 1);
      length = children.reduce((acc, val) => acc + val.length, 0);
      localMaxLevel = Math.max(localMaxLevel, level);
    }
    result.push({ key, children, length });
  }

  return [result, localMaxLevel];
}

function setPathDelimiter(inp: string) {
  pathDelimiter = inp + '';
}

export { Children, HeaderObject, JsTypes, flattenObj, accessNestedParams, formHeaderObj, setPathDelimiter };
