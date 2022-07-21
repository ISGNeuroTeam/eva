export function filterCompile(filter) {
  let filterOtlText = '';

  if (filter.parts.length > 0) {
    let firstPartWithValuesIndex = 0;

    filter.parts.forEach((item, index) => {
      if (item.values?.length > 0 || item.filterPartType === 'manual') {
        if (index === firstPartWithValuesIndex) {
          filterOtlText += 'search ';

          // If filter inverted to open parenthesis to "NOT" directive of whole search text
          if (filter.invertMatches) filterOtlText += 'NOT (';
        } else {
          filterOtlText += ' AND ';
        }

        // If part inverted
        if (item.invertMatches) filterOtlText += 'NOT ';

        filterOtlText += '(';

        const timeUnits = ['s', 'm', 'h', 'd'];
        let value;

        switch (item.filterPartType) {
          case 'manual':
            switch (item.fieldType) {
              case 'string':
                filterOtlText += `${item.fieldName}="${item.value.trim()}")`;
                break;
              case 'number':
                filterOtlText += `${item.fieldName}${item.operationManual}${item.value})`;
                break;
              case 'date':
                filterOtlText += `${item.fieldName}${item.operationManual}${
                  Date.parse(item.value) / 1000
                })`;
                break;
              case 'time':
                if (timeUnits[item.timeUnits] === 'd') {
                  value = item.value * 3600 * 24;
                } else if (timeUnits[item.timeUnits] === 'h') {
                  value = item.value * 3600;
                } else if (timeUnits[item.timeUnits] === 'm') {
                  value = item.value * 60;
                } else {
                  value = item.value;
                }

                filterOtlText += `${item.fieldName}${item.operationManual}${value})`;
                break;
              default:
                break;
            }
            break;
          case 'token':
            if (item.token.elem === 'multiLine') {
              if (item.token.capture === 'start') {
                item.operationToken = '>';
              } else {
                item.operationToken = '<';
              }
              filterOtlText += `${item.token.filterParam}${item.operationToken}${item.token.value})`;
            } else {
              item.values.forEach((value, valIndex) => {
                if (valIndex === item.values.length - 1) {
                  if (item.values.length > 1) filterOtlText += ` ${item.operationToken} `;
                  filterOtlText += `${item.fieldName}="${value.trim()}")`;
                } else if (valIndex === 0) {
                  filterOtlText += `${item.fieldName}="${value.trim()}"`;
                  if (item.values.length === 0) filterOtlText += ')';
                } else {
                  filterOtlText += ` ${item.operationToken} ${item.fieldName}="${value.trim()}"`;
                }
              });
            }
            break;
          default:
            break;
        }
      } else {
        firstPartWithValuesIndex += 1;
      }
    });

    // If filter inverted to close parenthesis of "NOT" directive
    if (filter.invertMatches && filterOtlText !== '') filterOtlText += ')';
  }

  return filterOtlText;
}

export default {};
