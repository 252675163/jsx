const transformIgnorePatterns = [
  '/dist/',
  'node_modules/[^/]+?/(?!(es|node_modules)/)', // Ignore modules without es dir
];

module.exports = {
  testURL: 'http://localhost/',
  moduleFileExtensions: ['js', 'jsx', 'json'],
  testPathIgnorePatterns: ['/node_modules/', 'node'],
  transform: {
    '^.+\\.(js|jsx)$': '<rootDir>/node_modules/babel-jest',
  },
  moduleNameMapper: {
    '^vue$': 'vue/dist/vue.global.js',
    'babel-plugin-transform-jsx-vue3/injectCode/dynamicRender': './injectCode/dynamicRender',
    'babel-plugin-transform-jsx-vue3/injectCode/mergeJSXProps': './injectCode/mergeJSXProps',
  },
  testRegex: '.*\\.test\\.js$',
  moduleNameMapper: {},
  transformIgnorePatterns,
};
