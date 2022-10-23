const tableIdPrefix = 'table-id:',
  tableNamePrefix = 'Table no. ';

// const ArrayStylingEnum = {
//     NoSpace: ',',

//     SpaceAfter: ' ,',
//     SpaceBefore: ', ',
//     SpaceOnBothSides: ' , ',

//     StartingComma: '\n, ',
//     TrailingComma: ',\n ',
//   },
//   DataStylingEnum = {
//     Normal: Symbol(),
//     Programmer: Symbol(),
//   };

// let arrayStylingType = ArrayStylingEnum.StartingComma,
//   dataStylingType = DataStylingEnum.Normal;

const getFormattedArrayValues = (tableDataCell, array) => {
  const table = document.createElement('table');
  table.classList.add('array-table');

  for(let idx = 0; idx < array.length; idx++) {
    const tableRow = document.createElement('tr'),
      indexText = document.createElement('th'),
      valueText = document.createElement('td');

    indexText.innerText = idx + 1;
    valueText.innerText = array[idx];

    tableRow.appendChild(indexText);
    tableRow.appendChild(valueText);
    table.appendChild(tableRow);
  }

  tableDataCell.appendChild(table);

  // const actualValue = array.join(arrayStylingType);

  // if (dataStylingType === DataStylingEnum.Normal) return actualValue;

  // if (arrayStylingType === ArrayStylingEnum.NoSpace) return `[${actualValue}]`;

  // return `[ ${actualValue}\n]`;
};

function createHeader({ text, row, length, extend, maxLevel }) {
  const tableHeaderCell = document.createElement('th');

  tableHeaderCell.rowSpan = extend ? maxLevel - row + 1 : 1;

  // How much width it have to occupy
  tableHeaderCell.colSpan = length;

  tableHeaderCell.classList.add('header-elem');
  tableHeaderCell.classList.add(`header-row-${row % 3}`);

  tableHeaderCell.innerText = text;
  return tableHeaderCell;
}

function addHeaders(obj, rootElem, maxLevel, row = 0) {
  if (obj.length === 0) return;

  const childrenQueue = [],
    tableRow = document.createElement('tr');
  for (const item of obj) {
    const newHeader = createHeader({
      text: item.key,
      row,
      length: item.length,
      extend: !item.children,
      maxLevel,
    });
    tableRow.append(newHeader);

    if (item.children) childrenQueue.push(...item.children);
  }
  rootElem.appendChild(tableRow);

  addHeaders(childrenQueue, rootElem, maxLevel, row + 1);
}

function createVerticalTable(obj, rootElem, maxLevel) {
  if (obj.length === 0) return;

  const totalSpan = obj.reduce((acc, { length }) => acc + length, 0);

  for (let rowIdx = 0; rowIdx < totalSpan; rowIdx++) {
    const tableRow = document.createElement('tr');
    rootElem.appendChild(tableRow);
  }

  addVerticalHeaders(obj, rootElem, maxLevel, 0, 0);
}

function addVerticalHeaders(obj, rootElem, maxLevel, row, currentLevel) {
  if (obj.length === 0) return;

  const childrenQueue = [],
    tableRows = rootElem.children;

  for (
    let idx = 0, start = 0, item = obj[idx];
    idx < obj.length;
    item = obj[++idx]
  ) {
    const newHeader = createHeader({
      text: item.key,
      row: currentLevel,
      length: item.length,
      extend: !item.children,
      maxLevel,
    });
    tableRows[row + start].append(newHeader);
    childrenQueue.push(item.children);

    start += obj[idx].length;

    // Swapping span values
    const temp = newHeader.colSpan;
    newHeader.colSpan = newHeader.rowSpan;
    newHeader.rowSpan = temp;
  }

  let startingRowNo = row;
  for (let idx = 0, item; idx < obj.length; idx++) {
    item = childrenQueue[idx];
    startingRowNo += obj[idx].length;

    if (item)
      addVerticalHeaders(
        item,
        rootElem,
        maxLevel,
        startingRowNo - obj[idx].length, // Done this here just for less code
        currentLevel + 1,
        false
      );
  }
}

function handleObjectArrayValues(
  tableDataCell,
  row,
  col,
  content,
  { createNewTableCallback, lazyLoadingCallback }
) {
  // TODO :: Lazy loading for more number of tables

  const aTag = document.createElement('a');

  const createNewTableLazily = () => {
    const newTableId = createNewTableCallback(content, row, col);
    aTag.href = '#' + tableIdPrefix + newTableId;
    aTag.innerText = tableNamePrefix + newTableId;
  };

  const useLazyLoading = true;

  if (useLazyLoading) {
    // Setting lazy load click text
    // TODO :: Use loader at the bottom for better UX
    aTag.innerText = '[+] Expand';
    aTag.href = '#';

    // Create a table only once
    const lazyCb = () => {
      lazyLoadingCallback(createNewTableLazily);
      aTag.removeEventListener('click', lazyCb);
    };

    aTag.addEventListener('click', lazyCb);
  } else {
    createNewTableLazily();
  }

  tableDataCell.appendChild(aTag);

  return tableDataCell;
}

function addNewContentCell(content, row, col, callbacksObject) {
  const tableDataCell = document.createElement('td');

  tableDataCell.classList.add('content-cell');
  tableDataCell.classList.add(`content-row-${row % 2}`);
  tableDataCell.classList.add(`content-col-${col % 2}`);

  if (content === null || content === undefined) {
    // TODO :: Handle empty cells
    return tableDataCell;
  }

  if (content.constructor === Object) {
    tableDataCell.innerText = JSON.stringify(content);
    return tableDataCell;
  }

  // Json Flattening will remove all nested objects
  if (content.constructor !== Array) {
    tableDataCell.innerText = content;
    return tableDataCell;
  }

  if (content.length === 0) {
    tableDataCell.innerText = '[ ]';
    return tableDataCell;
  }

  if (content[0]?.constructor !== Object) {
    getFormattedArrayValues(tableDataCell, content);
    return tableDataCell;
  }

  return handleObjectArrayValues(
    tableDataCell,
    row,
    col,
    content,
    callbacksObject
  );
}

export {
  addHeaders,
  addNewContentCell,
  tableIdPrefix,
  tableNamePrefix,
  createVerticalTable,
};
