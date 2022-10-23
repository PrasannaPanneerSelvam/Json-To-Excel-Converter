import { setGlobalStyles } from './Utils.js';

function addContentPositionControl() {
  // const positionArrows = ['↖', '↑', '↗', '←', '•', '→', '↙', '↓', '↘'];
  const positionArrows = ['⇖', '⇑', '⇗', '⇐', '•', '⇒', '⇙', '⇓', '⇘'];

  const horizontalGravityVariable = '--cell-h-gravity',
    verticalGravityVariable = '--cell-v-gravity',
    hPositions = ['start', 'center', 'end'],
    // vPositions = ['start', 'center', 'end'];
    vPositions = ['top', 'middle', 'bottom'];

  const controlHolder = document.createElement('div');
  controlHolder.classList.add('gravity-controller');

  for (let idx = 0; idx < 9; idx++) {
    const arrowDiv = document.createElement('div');
    arrowDiv.textContent = positionArrows[idx];

    const hGravityValue = hPositions[idx % 3],
      vGravityValue = vPositions[Math.floor(idx / 3)];

    arrowDiv.addEventListener('click', () => {
      setGlobalStyles(horizontalGravityVariable, hGravityValue);
      setGlobalStyles(verticalGravityVariable, vGravityValue);
    });

    controlHolder.appendChild(arrowDiv);
  }

  document.body.appendChild(controlHolder);
}

export { addContentPositionControl };
