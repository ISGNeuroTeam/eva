export function filterCompile(filter) {
  let filterOtlText = '';

  if (filter.parts.length > 0) {
    let firstPartWithValuesIndex = 0;

    for (const idxPart in filter.parts) {
      const part = filter.parts[+idxPart];

      if (part.values?.length > 0 || part.filterPartType === 'manual') {
        if (idxPart === String(firstPartWithValuesIndex)) {
          filterOtlText += 'search ';

          // If filter inverted to open parenthesis to "NOT" directive of whole search text
          if (filter.invertMatches) filterOtlText += 'NOT (';
        } else {
          filterOtlText += ' AND ';
        }

        // If part inverted
        if (part.invertMatches) filterOtlText += 'NOT ';

        filterOtlText += '(';

        switch (part.filterPartType) {
          case 'manual':
            switch (part.fieldType) {
              case 'string':
                filterOtlText += `${part.fieldName}="${part.value.trim()}")`;
                break;
              case 'number':
                filterOtlText += `${part.fieldName}${part.operationManual}${part.value})`;
                break;
              case 'date':
                filterOtlText += `${part.fieldName}${part.operationManual}${
                  Date.parse(part.value) / 1000
                })`;
                break;
            }
            break;
          case 'token':
            if (part.token.elem === 'multiLine') {
              if (part.token.capture === 'start') {
                part.operationToken = '>';
              } else {
                part.operationToken = '<';
              }
              filterOtlText += `${part.token.filterParam}${part.operationToken}${part.token.value})`;
            } else {
              for (const idxVal in part.values) {
                const value = part.values[+idxVal];
                if (idxVal === String(part.values.length - 1)) {
                  if (part.values.length > 1) filterOtlText += ` ${part.operationToken} `;
                  filterOtlText += `${part.fieldName}="${value.trim()}")`;
                } else if (idxVal === '0') {
                  filterOtlText += `${part.fieldName}="${value.trim()}"`;
                  if (part.values.length === 0) filterOtlText += ')';
                } else {
                  filterOtlText += ` ${part.operationToken} ${part.fieldName}="${value.trim()}"`;
                }
              }
            }
            break;
        }
      } else {
        firstPartWithValuesIndex += 1;
      }
    }

    // If filter inverted to close parenthesis of "NOT" directive
    if (filter.invertMatches && filterOtlText !== '') filterOtlText += ')';
  }

  return filterOtlText;
}
