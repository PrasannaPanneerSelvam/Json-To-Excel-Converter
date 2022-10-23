import * as JsonUtils from './JsonUtils.js';
import * as TablePreviewDomManipulator from './TablePreviewDomManipulator.js';

// TODO :: Remove this counter & add proper logic based on level, row & column
let dummyCounter = 0;
function getTableId(level, row, col) {
  return dummyCounter++;
}

// DOM element variables
let previewContainer = document.getElementById('preview-container'),
  layoutsArray = [];

function createSpaceForTable(tableId, maxPartitions) {
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
  inputObjArray,
  flattenedKeys,
  tableNode,
  createNewTableCallback,
  lazyLoadingCallback,
  isVerticalTable
) {
  for (const [idx, item] of Object.entries(inputObjArray)) {
    // Adding a new row of content
    const tableRow = document.createElement('tr');
    flattenedKeys
      .map(key => JsonUtils.accessNestedParams(item, key))
      .forEach((value, col) => {
        const parentToBeAttached = isVerticalTable ? tableNode.children[col] : tableRow;
        parentToBeAttached.append(
          TablePreviewDomManipulator.addNewContentCell(value, idx, col, {
            createNewTableCallback,
            lazyLoadingCallback,
          })
        )
      });

    if(!isVerticalTable)
      tableNode.appendChild(tableRow);
  }
}

function createNewTable(inputObjArray, levelNo, rowNo, colNo) {
  // Initial polyfill for an Object array
  if (inputObjArray.constructor !== Array) {
    inputObjArray = [inputObjArray];
  }

  // Initial processing of object
  const sampleObject = inputObjArray[0] ?? {},
    [headersObj, maxLevel] = JsonUtils.formHeaderObj(sampleObject),
    flattenedKeys = Object.keys(JsonUtils.flattenObj(sampleObject)),
    maxPartitions = headersObj.reduce((acc, val) => acc + val.length, 0),
    tableId = getTableId(levelNo, rowNo, colNo),
    createNewTableCallback = (inputValue, r, c) =>
      createNewTable(inputValue, levelNo + 1, r, c);

  // Creating a new table space
  const [wrapper, tableNode] = createSpaceForTable(tableId, maxPartitions);

  // To maintain order on adding tables in the container
  layoutsArray.push(wrapper);

  const isVerticalTable = inputObjArray.length < 2;

  // Adding headers
  if(isVerticalTable) TablePreviewDomManipulator.createVerticalTable(headersObj, tableNode, maxLevel);
  else TablePreviewDomManipulator.addHeaders(headersObj, tableNode, maxLevel); 

  // Adding content
  injectContent(
    inputObjArray,
    flattenedKeys,
    tableNode,
    createNewTableCallback,
    lazyLoadingCallback,
    isVerticalTable
  );

  return tableId;
}

function lazyLoadingCallback(cb) {
  layoutsArray = [];
  cb();
  layoutsArray.forEach(table => previewContainer.appendChild(table));
  layoutsArray = [];
}

function createNewTableViews(inputObjArray) {
  lazyLoadingCallback(() => createNewTable(inputObjArray, 0, 0, 0));
}

function removeTables() {
  [...previewContainer.children].forEach(i => previewContainer.removeChild(i));
}

function resetTable(newObjArray) {
  removeTables();
  createNewTableViews(newObjArray);
}

export { createNewTableViews, resetTable };
