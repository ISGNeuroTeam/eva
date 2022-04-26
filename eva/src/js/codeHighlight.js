// live demo editor https://ace.c9.io/tool/mode_creator.html
// documentation https://macromates.com/manual/en/language_grammars

// eslint-disable-next-line no-undef
define((require, exports, module) => {
  const oop = require('../lib/oop');
  const { TextHighlightRules } = require('./text_highlight_rules');

  const AbapHighlightRules = function () {
    const keywordMapper = this.createKeywordMapper({
      keyword: 'as|by|or|and',
      'support.function': 'sum|round|int|rand|min|max|p50|avg|dc|case|values|locate|ctime',
    }, 'identifier', true);

    this.$rules = {

      start: [
        {
          token: 'string',
          regex: '"',
          next: 'string',
        },
        {
          token: 'string',
          regex: '\'',
          next: 'qstring',
        },
        {
          token: 'constant.numeric',
          regex: '[+-]?\\d+\\b',
        },
        {
          token: 'keyword.operator',
          regex: /[-+%=<>*]|![><=]/,
        },
        {
          token: 'paren.lparen',
          regex: '[\\(]',
        },
        {
          token: 'paren.rparen',
          regex: '[\\)]',
        },
        {
          token: 'markup.bold',
          regex: /\$\w+\$/,
        },
        {
          token: 'variable.parameter',
          regex: /\w+\s?=/,
          next: 'attr',
        },
        {
          token: 'entity.name.function',
          regex: '\\|[\\s]{0,}',
          next: 'command',
        },
        {
          token: keywordMapper,
          regex: '[a-zA-Z_][a-zA-Z0-9_]*\\b',
        },
        { defaultToken: 'start' },
      ],

      qstring: [
        {
          token: 'constant.language.escape',
          regex: '\'\'',
        },
        {
          token: 'string',
          regex: '\'',
          next: 'start',
        },
        { defaultToken: 'string' },
      ],
      string: [
        {
          token: 'constant.language.escape',
          regex: '""',
        },
        {
          token: 'string',
          regex: '"',
          next: 'start',
        },
        { defaultToken: 'string' },
      ],

      command: [
        {
          token: 'markup.bold',
          regex: /\$\w+\$/,
          next: 'attr',
        },
        {
          token: 'entity.name.function',
          regex: '\\w+\\s?',
          next: 'attr',
        },
        {
          token: 'support.variable',
          regex: '\\s+(.*)',
          next: 'attr',
        },
        { defaultToken: 'command' },
      ],

      attr: [
        {
          token: 'variable.parameter',
          regex: /\w+\s?=/,
          next: 'attr',
        },
        {
          token: 'support.variable',
          regex: '^|',
          next: 'start',
        },
        { defaultToken: 'attr' },
      ],

      list: [
        {
          token: 'support.variable',
          regex: /(-?\s?\w+\s?)+/,
          next: 'start',
        },
        {
          token: 'support.variable',
          regex: /(\w+\s?)+/,
          next: 'start',
        },
        { defaultToken: 'list' },
      ],
    };
  };
  oop.inherits(AbapHighlightRules, TextHighlightRules);

  exports.AbapHighlightRules = AbapHighlightRules;
});
