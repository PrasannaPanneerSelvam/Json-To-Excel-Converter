import * as JsonUtils from './JsonUtils';
import * as TablePreviewDomManipulator from './TablePreviewDomManipulator';

// TODO :: Remove this counter & add proper logic based on level, row & column
let dummyCounter = 0;
function getTableId(level: number, row: number, col: number) {
  return dummyCounter++;
}

// DOM element variables
let previewContainer = document.getElementById('preview-container'),
  layoutsArray: HTMLElement[] = [];

function createSpaceForTable(tableId: number, maxPartitions: number): [HTMLDivElement, HTMLTableElement] {
  // Table Header
  const tableTitle = document.createElement('div');
  tableTitle.classList.add('table-title');
  tableTitle.innerText = TablePreviewDomManipulator.tableNamePrefix + tableId;

  // Actual Table node
  const tableNode = document.createElement('table');
  tableNode.classList.add('sheet-grid-container');

  // Table wrapper for title & actual content
  const tableWrapper = document.createElement('div');
  tableWrapper.classList.add('table-wrapper');
  tableWrapper.id = TablePreviewDomManipulator.tableIdPrefix + tableId;

  tableWrapper.appendChild(tableTitle);
  tableWrapper.appendChild(tableNode);

  return [tableWrapper, tableNode];
}

function injectContent(
  inputObjArray: object,
  flattenedKeys: string[],
  tableNode: HTMLTableElement,
  callbacksObject: TablePreviewDomManipulator.CallbacksObject,
  isVerticalTable: boolean
) {
  for (const [idx, item] of Object.entries(inputObjArray)) {
    // Adding a new row of content
    const tableRow = document.createElement('tr');
    flattenedKeys
      .map(key => JsonUtils.accessNestedParams(item, key))
      .forEach((value, col) => {
        const parentToBeAttached = isVerticalTable
          ? tableNode.children[col]
          : tableRow;
        parentToBeAttached.append(
          TablePreviewDomManipulator.addNewContentCell(value, parseInt(idx), col, callbacksObject)
        );
      });

    if (!isVerticalTable) tableNode.appendChild(tableRow);
  }
}

// TODO :: Write this with proper types later
function createSampleObject(objectList: any) {
  function traverseNestedObjects(object: any, inputObject: any = {}) {
    for (const [key, value] of Object.entries(object))
      inputObject[key] =
        value && value.constructor === Object
          ? traverseNestedObjects(value, inputObject[key])
          : '';

    return inputObject;
  }

  const sampleObject = {};
  // Using for loop instead of forEach loop just for perf sake😅
  for (let idx = 0; idx < objectList.length; idx++)
    traverseNestedObjects(objectList[idx], sampleObject);

  return sampleObject;
}

function createNewTable(inputObjOrObjectArray: JsonUtils.JsTypes, levelNo: number, rowNo: number, colNo: number) {
  if (inputObjOrObjectArray == null) return;

  // Initial polyfill for an Object array
  const inputObjArray =
    inputObjOrObjectArray.constructor === Array
      ? inputObjOrObjectArray
      : [inputObjOrObjectArray];

  // Initial processing of object
  const sampleObject = createSampleObject(inputObjArray) ?? {},
    [headersObj, maxLevel] = JsonUtils.formHeaderObj(sampleObject),
    flattenedKeys = Object.keys(JsonUtils.flattenObj(sampleObject)),
    maxPartitions = headersObj.reduce((acc, val) => acc + val.length, 0),
    tableId = getTableId(levelNo, rowNo, colNo),
    createNewTableCallback = (inputValue: JsonUtils.JsTypes, r: number, c: number) =>
      createNewTable(inputValue, levelNo + 1, r, c);

  // Creating a new table space
  const [wrapper, tableNode] = createSpaceForTable(tableId, maxPartitions);

  // To maintain order on adding tables in the container
  layoutsArray.push(wrapper);

  const isVerticalTable = inputObjArray.length < 2;

  // Adding headers
  const createHeaders = isVerticalTable
    ? TablePreviewDomManipulator.createVerticalTable
    : TablePreviewDomManipulator.addHeaders;

  createHeaders(headersObj, tableNode, maxLevel);

  // Adding content
  injectContent(
    inputObjArray,
    flattenedKeys,
    tableNode,
    { createNewTableCallback, lazyLoadingCallback },
    isVerticalTable
  );

  return tableId;
}

function lazyLoadingCallback(cb: () => void) {
  layoutsArray = [];
  cb();
  layoutsArray.forEach(table => previewContainer?.appendChild(table));
  layoutsArray = [];
}

function createNewTableViews(inputObjArray: JsonUtils.JsTypes) {
  lazyLoadingCallback(() => createNewTable(inputObjArray, 0, 0, 0));
}

function removeTables() {
  Array.from(previewContainer?.children ?? []).forEach(i => previewContainer?.removeChild(i));
}

function resetTable(newObjArray: JsonUtils.JsTypes) {
  removeTables();
  createNewTableViews(newObjArray);
}

export { createNewTableViews, resetTable };
