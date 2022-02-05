console.log('Hello');
const jsonTextArea = document.getElementById('json-input'),
  submitButton = document.getElementById('submit-button'),
  prettifyButton = document.getElementById('prettify-button'),
  previewButton = document.getElementById('preview-button');

function convertJsontoExcel(data) {
  fetch('http://localhost:5000/convertJsonToExcel', {
    method: 'POST',
    headers: {
      Accept:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
    body: JSON.stringify(data),
  })
    .then(resp => resp.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;

      // the filename you want
      a.download = 'Sheet from json.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch(() => console.error('Error!'));
}

function JsonValidatorWrapper(successCb = () => {}, failureCb = () => {}) {
  function validateString(inp) {
    try {
      const parsedData = JSON.parse(inp);
      return parsedData;
    } catch (e) {
      console.warn('Erroring on parsing entered data', inp, e);
    }
    return null;
  }

  return function () {
    const validatedJson = validateString(jsonTextArea.value);

    if (validatedJson === null) {
      failureCb();
      return;
    }
    successCb(validatedJson);
  };
}

submitButton.addEventListener(
  'click',
  JsonValidatorWrapper(
    validatedJson => {
      convertJsontoExcel(validatedJson);
    },
    // TODO :: Handle UX
    () => {}
  )
);

prettifyButton.addEventListener(
  'click',
  JsonValidatorWrapper(
    validatedJson => {
      const prettifiedJson = JSON.stringify(validatedJson, null, 4);
      jsonTextArea.value = prettifiedJson;
    },
    // TODO :: Handle UX
    () => {}
  )
);

previewButton.addEventListener(
  'click',
  JsonValidatorWrapper(
    validatedJson => {
      TablePreviewGenerator.resetTable(validatedJson);
    },
    // TODO :: Handle UX
    () => {}
  )
);
