let pathDelimiter = '/';

function isJsonObject(obj) {
  if (obj === undefined || obj === null) return false;

  const primitiveConstructor = [Number, String, Boolean];
  if (primitiveConstructor.includes(obj.constructor)) return false;
  if (obj.constructor === Array) return false;

  return obj.constructor === Object;
}

function flattenObj(obj) {
  if (!isJsonObject(obj)) return obj;

  const resultObj = {};

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

function accessNestedParams(nestedObj, flattenedKey) {
  const splittedKeys = flattenedKey.split(pathDelimiter);

  let valueRef = nestedObj;
  for (const key of splittedKeys) {
    if (
      valueRef === undefined ||
      valueRef === null ||
      valueRef.constructor !== Object
    )
      return valueRef;

    valueRef = valueRef[key];
  }
  return valueRef;
}

function formHeaderObj(obj, row = 0) {
  const result = [];

  let localMaxLevel = row;

  for (const [key, value] of Object.entries(obj)) {
    let children = null,
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

function setPathDelimiter(inp) {
  pathDelimiter = inp + '';
}

export { flattenObj, accessNestedParams, formHeaderObj, setPathDelimiter };
