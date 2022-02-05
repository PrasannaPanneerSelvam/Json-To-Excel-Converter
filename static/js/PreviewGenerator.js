import * as JsonUtils from './JsonUtils.js';
import * as TablePreviewDomManipulator from './TablePreviewDomManipulator.js';

// TODO :: Remove this counter & add proper logic based on level, row & column
let dummyCounter = 0;
function getTableId(row, col, level) {
  return dummyCounter++;
}

// DOM element variables
let previewContainer = document.getElementById('preview-container'),
  layoutsArray = [];

function removeTables() {
  [...previewContainer.children].forEach(i => previewContainer.removeChild(i));
}

function createNewTable(inputObjArray, levelNo, row, col) {
  if (inputObjArray.constructor !== Array) inputObjArray = [inputObjArray];
  // Initial processing of object
  const sampleObject = inputObjArray[0] ?? {},
    [headersObj, maxLevel] = JsonUtils.formHeaderObj(sampleObject),
    flattenedKeys = Object.keys(JsonUtils.flattenObj(sampleObject)),
    maxPartitions = headersObj.reduce((acc, val) => acc + val.length, 0),
    tableNode = document.createElement('div'),
    tableId = getTableId(row, col, levelNo);

  // To maintain order on adding tables in the container
  layoutsArray.push(tableNode);

  tableNode.classList.add('sheet-grid-container');
  tableNode.id = TablePreviewDomManipulator.tableIdPrefix + tableId;

  // TODO ::- Make proper min width value instead of 50px
  tableNode.style.gridTemplateColumns = `repeat(${maxPartitions}, minmax(50px, auto))`;

  // Adding headers
  TablePreviewDomManipulator.addHeaders(headersObj, tableNode, maxLevel);

  // Adding content
  const createNewTableCallback = (inputValue, r, c) =>
    createNewTable(inputValue, levelNo + 1, r, c);

  for (const [idx, item] of Object.entries(inputObjArray)) {
    // Adding a new row of content
    flattenedKeys
      .map(key => JsonUtils.accessNestedParams(item, key))
      .forEach((value, col) =>
        tableNode.append(
          TablePreviewDomManipulator.addNewContentCell(value, idx, col, {
            createNewTableCallback,
          })
        )
      );
  }

  return tableId;
}

function createNewTableViews(inputObjArray) {
  createNewTable(inputObjArray, 0, 0, 0);

  layoutsArray.forEach(table => previewContainer.appendChild(table));
}

function resetTable(newObjArray) {
  removeTables();
  createNewTableViews(newObjArray);
}

export { createNewTableViews, resetTable };
