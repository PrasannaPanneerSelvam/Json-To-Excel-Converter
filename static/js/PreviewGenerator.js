import * as JsonUtils from './JsonUtils.js';
import * as TablePreviewDomManipulator from './TablePreviewDomManipulator.js';

// DOM element variables
let previewContainer = document.getElementById('preview-container'),
  layoutsArray = [];

function removeTables() {
  [...previewContainer.children].forEach(i => previewContainer.removeChild(i));
}

function createNewTable(inputObjArray) {
  if (inputObjArray.constructor !== Array) inputObjArray = [inputObjArray];
  // Initial processing of object
  const sampleObject = inputObjArray[0] ?? {},
    [headersObj, maxLevel] = JsonUtils.formHeaderObj(sampleObject),
    flattenedKeys = Object.keys(JsonUtils.flattenObj(sampleObject)),
    maxPartitions = headersObj.reduce((acc, val) => acc + val.length, 0),
    tableNode = document.createElement('div');

  // To maintain order on adding tables in the container
  layoutsArray.push(tableNode);

  tableNode.classList.add('sheet-grid-container');

  // TODO ::- Make proper min width value instead of 50px
  tableNode.style.gridTemplateColumns = `repeat(${maxPartitions}, minmax(50px, auto))`;

  // Adding headers
  TablePreviewDomManipulator.addHeaders(headersObj, tableNode, maxLevel);

  // Adding content
  for (const [idx, item] of Object.entries(inputObjArray)) {
    // Adding a new row of content
    flattenedKeys
      .map(key => JsonUtils.accessNestedParams(item, key))
      .forEach((value, col) =>
        tableNode.append(
          TablePreviewDomManipulator.addNewContentCell(value, idx, col, {
            createNewTableCallback: createNewTable,
          })
        )
      );
  }
}

function createNewTableViews(inputObjArray) {
  createNewTable(inputObjArray);

  layoutsArray.forEach(table => previewContainer.appendChild(table));
}

function resetTable(newObjArray) {
  removeTables();
  createNewTableViews(newObjArray);
}

export { createNewTableViews, resetTable };
