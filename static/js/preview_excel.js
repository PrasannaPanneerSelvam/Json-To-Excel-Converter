const JsonUtils = (function () {
  const pathDelimiter = '/';

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
        const childObj = flattenObj(value);
        for (const [childKey, childValue] of Object.entries(childObj))
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
        length = 1,
        level;

      if (isJsonObject(value)) {
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

  return {
    flattenObj,
    accessNestedParams,
    formHeaderObj,
    setPathDelimiter,
  };
})();

const TablePreviewGenerator = (function () {
  const TablePreviewDomManipulator = (function () {
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

    function addNewContentCell(content, row, col) {
      const div = document.createElement('div');

      if (content !== null && content !== undefined) {
        div.innerText =
          content.constructor === Array
            ? `[${content.length === 0 ? ' ' : content}]`
            : content;
      } else {
        // TODO :: Handle empty cells
      }

      div.classList.add('content-cell');
      div.classList.add(`content-row-${row % 2}`);
      div.classList.add(`content-col-${col % 2}`);

      return div;
    }

    return { addHeaders, addNewContentCell };
  })();

  const PreviewGenerator = (function () {
    // DOM element variables
    const headerGridContainer = document.getElementById('sheet-grid-container');

    function removeTable() {
      [...headerGridContainer.children].forEach(i =>
        headerGridContainer.removeChild(i)
      );
    }

    function createNewTable(inputObjArray) {
      if (inputObjArray.constructor !== Array) inputObjArray = [inputObjArray];
      // Initial processing of object
      const sampleObject = inputObjArray[0] ?? {},
        [headersObj, maxLevel] = JsonUtils.formHeaderObj(sampleObject),
        flattenedKeys = Object.keys(JsonUtils.flattenObj(sampleObject)),
        maxPartitions = headersObj.reduce((acc, val) => acc + val.length, 0);

      // TODO ::- Make proper min width value instead of 50px
      headerGridContainer.style.gridTemplateColumns = `repeat(${maxPartitions}, minmax(50px, auto))`;

      // Adding headers
      TablePreviewDomManipulator.addHeaders(
        headersObj,
        headerGridContainer,
        maxLevel
      );

      // Adding content
      for (const [idx, item] of Object.entries(inputObjArray)) {
        // Adding a new row of content
        flattenedKeys
          .map(key => JsonUtils.accessNestedParams(item, key))
          .forEach((value, col) =>
            headerGridContainer.append(
              TablePreviewDomManipulator.addNewContentCell(value, idx, col)
            )
          );
      }
    }

    function resetTable(newObjArray) {
      removeTable();
      createNewTable(newObjArray);
    }

    return {
      createNewTable,
      resetTable,
    };
  })();

  return {
    createNewTable: PreviewGenerator.createNewTable,
    resetTable: PreviewGenerator.resetTable,
  };
})();

const test = {
  StudentName: 'Bruce Wayne',
  a: { aa: 1, bb: 12 },
  b: {
    c: [1, 2],
    d: {
      e: 12,
      f: 'hello',
      g: [1, 2, 3],
    },
  },
};

const v = [
  {
    Name: 'Student1',
    Marks: { sub1: 100, sub2: 100, sub3: 100, sub4: 100 },
    Address: {
      street: '126 Udhna',
      city: 'san jone',
      state: 'CA',
      phone: '394221',
    },
    SampleList: '[]',
    SampleList1: '[1,2,3]',
    SampleList2: ['First element', 2, 3.0],
    SampleList3: [
      { 'Staff Name': 'Bruce', Subject: 'Biochemistry' },
      { 'Staff Name': 'Tony', Subject: 'Physics & Mechanics' },
    ],
  },

  {
    Name: 'Student2',
    Marks: { sub1: 99, sub2: 99, sub3: 99, sub4: 99 },
    Address: {
      street: '126 Kidhana',
      city: 'New york',
      state: 'PS',
      phone: '098765',
    },
  },

  {
    Name: 'Student3',
    Marks: { sub1: 35, sub2: 36, sub3: 37 },
    Address: {
      street: '126 Kedar',
      city: 'Blore',
      state: 'SP',
      phone: '234567',
    },
  },
];

// TablePreviewGenerator.createNewTable(v);
