const standardColors = [
  [
    '0, 0, 0',
    '255, 255, 255',
    '66, 133, 244',
    '234, 67, 53',
    '251, 188, 4',
    '52, 168, 83',
    '255, 109, 1',
    '70, 189, 198',
  ],
];

const additionalColors = [
  [
    '0, 0, 0',
    '67, 67, 67',
    '102, 102, 102',
    '153, 153, 153',
    '183, 183, 183',
    '204, 204, 204',
    '217, 217, 217',
    '239, 239, 239',
    '243, 243, 243',
    '255, 255, 255',
  ],
  [
    '230, 184, 175',
    '244, 204, 204',
    '252, 229, 205',
    '255, 242, 204',
    '217, 234, 211',
    '208, 224, 227',
    '201, 218, 248',
    '207, 226, 243',
    '217, 210, 233',
    '234, 209, 220',
  ],
  [
    '221, 126, 107',
    '234, 153, 153',
    '249, 203, 156',
    '255, 229, 153',
    '182, 215, 168',
    '162, 196, 201',
    '164, 194, 244',
    '159, 197, 232',
    '180, 167, 214',
    '213, 166, 189',
  ],
  [
    '204, 65, 37',
    '224, 102, 102',
    '246, 178, 107',
    '255, 217, 102',
    '147, 196, 125',
    '118, 165, 175',
    '109, 158, 235',
    '111, 168, 220',
    '142, 124, 195',
    '194, 123, 160',
  ],
  [
    '166, 28, 0',
    '204, 0, 0',
    '230, 145, 56',
    '241, 194, 50',
    '106, 168, 79',
    '69, 129, 142',
    '60, 120, 216',
    '61, 133, 198',
    '103, 78, 167',
    '166, 77, 121',
  ],
  [
    '133, 32, 12',
    '153, 0, 0',
    '180, 95, 6',
    '191, 144, 0',
    '56, 118, 29',
    '19, 79, 92',
    '17, 85, 204',
    '11, 83, 148',
    '53, 28, 117',
    '116, 27, 71',
  ],
  [
    '91, 15, 0',
    '102, 0, 0',
    '120, 63, 4',
    '127, 96, 0',
    '39, 78, 19',
    '12, 52, 61',
    '28, 69, 135',
    '7, 55, 99',
    '32, 18, 77',
    '76, 17, 48',
  ],
  [
    '152, 0, 0',
    '255, 0, 0',
    '255, 153, 0',
    '255, 255, 0',
    '0, 255, 0',
    '0, 255, 255',
    '74, 134, 232',
    '0, 0, 255',
    '153, 0, 255',
    '255, 0, 255',
  ],
];

let pickColorCallback = color => {
  console.log('Selected color', color);
};

function setPickColorCallback(inputCb) {
  pickColorCallback = inputCb;
}

function addPickColorEvent(gridItem) {
  gridItem.addEventListener('click', e => {
    pickColorCallback(e.target.style.backgroundColor);
  });
}

function addCellsInGrid(attachOn, rowNo, colNo, contentArray) {
  for (let row = rowNo - 1; row >= 0; row--) {
    const rowDiv = document.createElement('div');
    for (let col = 0; col < colNo; col++) {
      const cellDiv = document.createElement('div');
      cellDiv.style.backgroundColor = `rgb(${contentArray[row][col]})`;
      addPickColorEvent(cellDiv);
      rowDiv.appendChild(cellDiv);
    }
    attachOn.appendChild(rowDiv);
  }
}

const primaryColorsGrid = document.getElementById('primary-color-grid'),
  additionalColorsGrid = document.getElementById('additional-color-grid');

addCellsInGrid(primaryColorsGrid, 1, 8, standardColors);
addCellsInGrid(additionalColorsGrid, 8, 10, additionalColors);

export { setPickColorCallback };
