import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

// Tema escuro no estilo VS Code Dark+.
const C = {
  bg: '#1e1e1e',
  gutter: '#1e1e1e',
  gutterText: '#858585',
  activeLine: '#2a2d2e',
  activeGutter: '#c6c6c6',
  selection: '#264f78',
  cursor: '#aeafad',
  text: '#d4d4d4',
  keyword: '#569cd6',
  control: '#c586c0',
  string: '#ce9178',
  number: '#b5cea8',
  comment: '#6a9955',
  function: '#dcdcaa',
  variable: '#9cdcfe',
  type: '#4ec9b0',
  constant: '#4fc1ff',
  operator: '#d4d4d4',
  bracket: '#ffd700',
  invalid: '#f44747',
};

export const darkPlusTheme = EditorView.theme(
  {
    '&': { color: C.text, backgroundColor: C.bg, height: '100%' },
    '.cm-scroller': { fontFamily: "'JetBrains Mono', Consolas, 'Courier New', monospace", lineHeight: '1.55' },
    '.cm-content': { caretColor: C.cursor, padding: '6px 0' },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: C.cursor, borderLeftWidth: '2px' },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': { backgroundColor: C.selection },
    '.cm-activeLine': { backgroundColor: C.activeLine },
    '.cm-gutters': { backgroundColor: C.gutter, color: C.gutterText, border: 'none', paddingRight: '6px' },
    '.cm-activeLineGutter': { backgroundColor: 'transparent', color: C.activeGutter },
    '.cm-lineNumbers .cm-gutterElement': { padding: '0 8px 0 14px', minWidth: '40px' },
    '&.cm-focused .cm-matchingBracket': { backgroundColor: '#0064001a', outline: '1px solid #888' },
    '&.cm-focused .cm-nonmatchingBracket': { backgroundColor: '#f4474733' },
    '.cm-searchMatch': { backgroundColor: '#623315', outline: '1px solid #9e6a03' },
    '.cm-searchMatch.cm-searchMatch-selected': { backgroundColor: '#515c6a' },
    '.cm-selectionMatch': { backgroundColor: '#3a3d41' },
    '.cm-tooltip': { backgroundColor: '#252526', border: '1px solid #454545', color: C.text },
    '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: '#04395e', color: '#fff' },
    '.cm-completionIcon': { opacity: 0.8 },
    '.cm-panels': { backgroundColor: '#252526', color: C.text },
    '.cm-panels.cm-panels-top': { borderBottom: '1px solid #454545' },
    '.cm-panel.cm-search input, .cm-panel.cm-search button': { fontFamily: 'inherit', fontSize: '13px' },
    '.cm-panel.cm-search input': { background: '#3c3c3c', color: C.text, border: '1px solid #3c3c3c' },
    '.cm-panel.cm-search button': { background: '#0e639c', color: '#fff', border: 'none', backgroundImage: 'none' },
    '.cm-panel.cm-search label': { fontSize: '13px' },
    '.cm-diagnostic-error': { borderLeft: '3px solid #f14c4c' },
    '.cm-lintRange-error': { backgroundImage: 'none', textDecoration: 'underline wavy #f14c4c', textUnderlineOffset: '3px' },
    '.cm-error-line': { backgroundColor: '#5a1d1d66' },
    '.cm-gutter-lint .cm-gutterElement': { padding: '0 2px' },
  },
  { dark: true },
);

export const darkPlusHighlight = syntaxHighlighting(
  HighlightStyle.define([
    { tag: [t.keyword, t.definitionKeyword, t.modifier], color: C.keyword },
    { tag: [t.controlKeyword, t.moduleKeyword], color: C.control },
    { tag: [t.string, t.special(t.string), t.regexp], color: C.string },
    { tag: [t.number, t.integer, t.float], color: C.number },
    { tag: [t.bool, t.null, t.atom], color: C.keyword },
    { tag: [t.comment, t.lineComment, t.blockComment], color: C.comment, fontStyle: 'italic' },
    { tag: [t.function(t.variableName), t.function(t.propertyName), t.function(t.definition(t.variableName))], color: C.function },
    { tag: [t.definition(t.variableName), t.variableName], color: C.variable },
    { tag: [t.propertyName], color: C.variable },
    { tag: [t.typeName, t.className, t.namespace, t.standard(t.variableName)], color: C.type },
    { tag: [t.self, t.constant(t.variableName)], color: C.constant },
    { tag: [t.operator, t.punctuation, t.separator], color: C.operator },
    { tag: [t.paren, t.squareBracket, t.brace], color: C.bracket },
    { tag: t.invalid, color: C.invalid },
  ]),
);
