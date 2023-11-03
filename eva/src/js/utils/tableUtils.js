// eslint-disable-next-line func-names
export const colorFixed = () => (cell) => {
  cell.getElement().style.backgroundColor = this.sanitizeHTML(cell.getValue());

  return '&nbsp;';
};

// eslint-disable-next-line func-names
export const headerFilter = function (cell/* , onRendered, success, cancel , editorParams */) {
  const vueComponent = this;
  const filterId = vueComponent.persistenceFilterId;
  const field = cell.getField();
  const elementId = `${filterId}-${field}`;

  const container = document.createElement('div');
  container.id = elementId;
  container.classList.add('dash-table-v2-container__filter-container');

  // create and style select element
  const select = document.createElement('select');
  select.id = `${elementId}-select`;
  select.classList.add('dash-table-v2-container__filter-select');
  const filters = vueComponent.searchSchema[field] === 'STRING'
    ? ['', '>', '<', '=', '==', '>=', '<=', '!=']
    : ['', '>', '<', '=', '>=', '<=', '!='];
  filters.forEach((item) => {
    const option = document.createElement('option');
    option.classList.add('dash-table-v2-container__filter-select-option');
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  });
  select.placeholder = 'Знак';
  select.style.padding = '4px';
  select.style.boxSizing = 'border-box';

  // create and style text input element
  const textInput = document.createElement('input');
  textInput.id = `${elementId}-textInput`;
  textInput.type = 'text';
  textInput.classList.add('dash-table-v2-container__filter-input');

  let selectValue = '';
  let textValue = '';

  function buildValues() {
    vueComponent.persistenceFilterWriter(
      filterId,
      field,
      {
        filterType: {
          el: select.id,
          value: selectValue,
        },
        filterValue: {
          el: textInput.id,
          value: textValue,
        },
      },
    );
  }

  function updateTextValue(value) {
    if (value !== '') {
      textValue = Number.isNaN(+value) ? value : +value;
    } else {
      textValue = value;
    }
    const maxWidth = container.offsetWidth - select.offsetWidth;
    const length = textInput.value.length && textInput.value.length > 1
      ? textInput.value.length + 2
      : 3;
    textInput.style.maxWidth = `${maxWidth - 10}px`;
    textInput.style.width = `calc(${length} * 1ch)`;
  }

  // add event listeners
  select.addEventListener('change', (e) => {
    selectValue = e.target.value;
    updateTextValue(textInput?.value);
    buildValues();
  });

  textInput.addEventListener('input', (e) => {
    updateTextValue(e.target.value);
    selectValue = select.value;
    buildValues();
  });

  // append elements to container
  container.appendChild(select);
  container.appendChild(textInput);

  return container;
};

// eslint-disable-next-line func-names
export const sorterFn = function (a, b/* , aRow, bRow, column, dir, sorterParams */) {
  // a, b - the two values being compared
  // aRow, bRow - the row components for the values being compared
  // (useful if you need to access additional fields in the row data for the sort)
  // column - the column component for the column being sorted
  // dir - the direction of the sort ("asc" or "desc")
  // sorterParams - sorterParams object from column definition array
  return a - b; // you must return the difference between the two values
};

export const formaterForNumbers = ({ numberFormat, decimalPlacesLimits }) => (cell) => {
  const num = cell.getValue();
  if (num === '' || typeof num === 'boolean' || num === null) {
    return num;
  }
  if (typeof num === 'number' || !Number.isNaN(Number(num))) {
    return Number(num).toLocaleString(numberFormat, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimalPlacesLimits || 10,
    });
  }
  return num;
};

export const riskSum = ({ numberFormat, decimalPlacesLimits }) => (cell) => { // plain text value
  const value = cell.getValue();
  if (!value) return value;

  const numberColor = +value >= 0 ? '#00d7ff' : '#ff0000';

  const formattedNum = numberFormat ? (+value).toLocaleString(numberFormat, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimalPlacesLimits || 10,
  }) : value;
  const div = document.createElement('div');
  div.style.whiteSpace = 'pre-line';
  div.style.lineHeight = '1';
  div.style.color = numberColor;
  div.innerHTML = `${formattedNum}`;

  return div;
};

export const riskFact = ({ numberFormat, decimalPlacesLimits }) => (cell) => { // plain text value
  const value = cell.getValue();
  if (!value) return value;
  const cellValArray = value.split(';');
  const pattern = /([^()]+)\s*\((-?\d+(\.\d+)?)\)/;
  try {
    const result = cellValArray.reduce((acc, item) => {
      try {
        const [_, text, number] = item.match(pattern);
        const numberColor = +number >= 0 ? '#00d6ff' : '#ff0000';
        const formattedNum = numberFormat ? (+number).toLocaleString(numberFormat, {
          minimumFractionDigits: 0,
          maximumFractionDigits: decimalPlacesLimits || 10,
        }) : number;
        return `${acc} ${text}(<span style="color:${numberColor}">${formattedNum}</span>)\n\r`;
      } catch (e) {
        return acc;
      }
    }, '');
    const div = document.createElement('div');
    div.style.whiteSpace = 'pre-line';
    div.style.lineHeight = '1';

    div.innerHTML = result;

    return div;
  } catch (e) {
    return '';
  }
};

export const riskAcc = ({ numberFormat, decimalPlacesLimits }) => (cell) => {
  const value = cell.getValue();
  if (!value) return value;

  const parts = value.split(';');
  parts.length = 2;
  const whatBigger = +parts[0] > +parts[1] ? 0 : 1;
  const container = document.createElement('div');
  container.style.width = '100%';

  parts.forEach((accValue, index) => {
    const column = document.createElement('div');
    column.style.display = 'flex';
    column.style.gap = '5px';
    if (index === 0) {
      column.style.marginBottom = '15px';
    }
    container.appendChild(column);

    const columnAcc = document.createElement('div');
    columnAcc.style.backgroundColor = index === 0 ? '#ff0000' : '#00d6ff';
    const width = accValue / (parts[whatBigger] / 100) / 2;
    columnAcc.style.width = `${width > 0 ? width : 1}%`;

    columnAcc.innerHTML = '';
    column.appendChild(columnAcc);

    const valueDiv = document.createElement('div');

    valueDiv.innerHTML = numberFormat ? `${(+accValue).toLocaleString(numberFormat, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimalPlacesLimits || 10,
    })}` : accValue;
    column.appendChild(valueDiv);
  });

  return container;
};

export const customFormatters = new Map([
  ['riskFact', riskFact],
  ['riskAcc', riskAcc],
  ['riskSum', riskSum],
  ['color', colorFixed],
  ['formaterForNumbers', formaterForNumbers],
]);

export const getFormatter = (formatter, numbersFormats) => (customFormatters.has(formatter)
  ? customFormatters.get(formatter)(numbersFormats)
  : formatter);
