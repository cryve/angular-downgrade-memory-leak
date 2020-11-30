// Load vendor scripts
require('./vendor');

// Load Coyo base module
require('./app/app.base');

// Collect all angular modules
requireAll(require.context('./app/', true, /^.*\.module\.js$/));

// Collect all angular files
requireAll(require.context('./app/', true, /^.*\.js$/));

/**
 * `require` all modules in the given webpack context
 */
function requireAll(context) { // eslint-disable-line strict
  context.keys().forEach(context);
}
