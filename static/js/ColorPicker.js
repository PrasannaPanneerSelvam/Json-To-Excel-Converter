import standardColors from './../json/StandardColors.json' assert { type: 'json' };
import customColors from './../json/CustomColors.json' assert { type: 'json' };
import additionalColors from './../json/AdditionalColors.json' assert { type: 'json' };

let pickColorCallback = (color) => {
  console.log('Selected color', color);
};

function setPickColorCallback(inputCb) {
  pickColorCallback = inputCb;
}

function addPickColorEvent(gridItem, cssColor) {
  gridItem.addEventListener('click', () => {
    pickColorCallback(cssColor);
  });
}

const maxColumns = 10;

function addColorCellsInGrid(attachOn, contentArray) {
  const totalNumberOfValues = contentArray.length,
    numberOfRows =
      parseInt(totalNumberOfValues / maxColumns) +
      (totalNumberOfValues % maxColumns !== 0),
    numberOfColumns = maxColumns;

  for (let row = 0, index = 0; row < numberOfRows && index < totalNumberOfValues; row++) {
    const rowDiv = document.createElement('tr');
    for (let col = 0; col < numberOfColumns && index < totalNumberOfValues; col++, index++) {
      const cellDiv = document.createElement('td'),
        cssColor = `rgb(${contentArray[index]})`;
      cellDiv.style.backgroundColor = cssColor;
      addPickColorEvent(cellDiv, cssColor);
      rowDiv.appendChild(cellDiv);
    }
    attachOn.appendChild(rowDiv);
  }
}

function addColorGrids() {
  const primaryColorsGrid = document.getElementById('primary-color-grid'),
    additionalColorsGrid = document.getElementById('additional-color-grid'),
    customColorsGrid = document.getElementById('custom-color-grid');

  addColorCellsInGrid(primaryColorsGrid, standardColors);
  addColorCellsInGrid(additionalColorsGrid, additionalColors);
  addColorCellsInGrid(customColorsGrid, customColors);

  // Adding a transparent color cell
  const transparentCellDiv = document.createElement('td');
  transparentCellDiv.classList.add('slash-bar');

  addPickColorEvent(transparentCellDiv, 'transparent');
  primaryColorsGrid.lastChild.appendChild(transparentCellDiv);
}

addColorGrids();

export { setPickColorCallback };
