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
