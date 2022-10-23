import {setGlobalStyles} from './Utils.js'
import * as TablePreviewGenerator from './PreviewGenerator.js';
import * as ColorPicker from './ColorPicker.js';
import * as Gravity from './ContentCellGravity.js';

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

const ps = {
  prasanna: [{ mobile: '8220125068', state: 'tamil nadu' }],
  hi: 123,
};

TablePreviewGenerator.createNewTableViews(test);

// TablePreviewGenerator.createNewTableViews(ps);

const colorDropDownArray = [...document.getElementsByClassName('pick-color')];

colorDropDownArray.forEach(dropDown => {
  const key = '--preview-' + dropDown.id;
  dropDown.addEventListener('click', () =>
    ColorPicker.setPickColorCallback(colorValue => {
      setGlobalStyles(key, colorValue);
      // Resetting with empty callback
      ColorPicker.setPickColorCallback(() => {});
    })
  );
});

Gravity.addContentPositionControl();