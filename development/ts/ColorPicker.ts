import standardColors from '../jsonData/StandardColors';
import customColors from '../jsonData/CustomColors';
import additionalColors from '../jsonData/AdditionalColors';

type Maybe<T> = T | null

let pickColorCallback = (color: string) => {
  console.log('Selected color', color);
};

function setPickColorCallback(inputCb: (color: string) => void) {
  pickColorCallback = inputCb;
}

function addPickColorEvent(gridItem: Maybe<HTMLElement>, cssColor: string) {
  gridItem?.addEventListener('click', () => {
    pickColorCallback(cssColor);
  });
}

const maxColumns = 10;

function addColorCellsInGrid(attachOn: Maybe<HTMLElement>, contentArray: string[]) {
  const totalNumberOfValues = contentArray.length,
    numberOfRows =
      Math.floor(totalNumberOfValues / maxColumns) +
      (totalNumberOfValues % maxColumns === 0 ? 0 : 1),
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
    attachOn?.appendChild(rowDiv);
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
  primaryColorsGrid?.lastChild?.appendChild(transparentCellDiv);
}

addColorGrids();

export { setPickColorCallback };
