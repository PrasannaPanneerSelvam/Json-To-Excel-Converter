import * as JsonUtils from './JsonUtils.js';

const tableIdPrefix = 'table-id:';

function createHeader({ text, row, length, extend, maxLevel }) {
  const div = document.createElement('div');
  div.innerText = text;

  div.classList.add('header-elem');
  div.classList.add(`header-row-${row % 3}`);

  const styles = div.style;
  styles.gridColumn = `span ${length}`;
  styles.gridRow = `${row + 1} / ${(extend ? maxLevel : row) + 2}`;
  return div;
}

function addHeaders(obj, rootElem, maxLevel, row = 0) {
  if (obj.length === 0) return;

  const childrenQueue = [];
  for (const item of obj) {
    const newDiv = createHeader({
      text: item.key,
      row,
      length: item.length,
      extend: !item.children,
      maxLevel,
    });
    rootElem.append(newDiv);

    if (item.children) childrenQueue.push(...item.children);
  }

  addHeaders(childrenQueue, rootElem, maxLevel, row + 1);
}

function handleObjectArrayValues(
  div,
  row,
  col,
  content,
  createNewTableCallback
) {
  // TODO :: Lazy loading for more number of tables

  const newTableId = createNewTableCallback(content, row, col);

  const aTag = document.createElement('a');
  aTag.href = '#' + tableIdPrefix + newTableId;
  aTag.innerText = `Table no. ${newTableId}`;
  div.appendChild(aTag);

  return div;
}

function addNewContentCell(content, row, col, { createNewTableCallback }) {
  const div = document.createElement('div');

  div.classList.add('content-cell');
  div.classList.add(`content-row-${row % 2}`);
  div.classList.add(`content-col-${col % 2}`);

  if (content === null || content === undefined) {
    // TODO :: Handle empty cells
    return div;
  }

  // Json Flattening will remove all nested objects
  if (content.constructor !== Array) {
    div.innerText = content;
    return div;
  }

  if (content.length === 0) {
    div.innerText = '[ ]';
    return div;
  }

  if (content[0]?.constructor !== Object) {
    div.innerText = `[${content}]`;
    return div;
  }

  return handleObjectArrayValues(
    div,
    row,
    col,
    content,
    createNewTableCallback
  );
}

export { addHeaders, addNewContentCell, tableIdPrefix };
