const fs = require('fs');
const path = require('path');
const watch = require('watch');
const ProgressBar = require('progress');
const ngTemplate = require('angular-template-cache');
const ngAnnotate = require('ng-annotate');
const browserListRegexp = require('browserslist-useragent-regexp');

/* Arguments */
const args = process.argv.slice(2);
const doWatch = args.indexOf('--watch') !== -1;
const doVerbose = args.indexOf('--verbose') !== -1;
const log = doVerbose ? console.log : () => {};

/* Paths */
const pathRoot = '..';
const pathTmp = path.join(pathRoot, 'build/cli');
const pathSrc = path.join(pathRoot, 'src/main');
const fileStyles = path.join(pathTmp, 'src/main/_bundle.scss');
const fileTemplates = path.join(pathTmp, 'src/main/app/templates.js');
const fileBrowsers = path.join(pathTmp, 'src/main/browserRegexp.js');

/* Custom watch filter */
const watchFilter = function(path, stats) {
  return _contains(pathSrc, path) && (!stats.isFile() || path.match(/^.+(?:\.js|\.scss|\.html)$/));
};



// create temp directory
ensureParent(pathTmp);
if (!fs.existsSync(pathTmp)) {
  fs.mkdirSync(pathTmp);
}

// build files and start watching
watch.watchTree(pathRoot, {filter: watchFilter, interval: 1}, (result, curr, prev) => {
  if (typeof result === "object" && prev === null && curr === null) {
    // finished walking the tree
    const files = Object.keys(result);
    const scripts = files.filter(_isScript);
    const templates = files.filter(_isTemplate);
    const styles = files.filter(_isStyle).sort();

    log('Processing files:');
    log(('' + scripts.length).padStart(6) + ' scripts');
    log(('' + templates.length).padStart(6) + ' templates');
    log(('' + styles.length).padStart(6) + ' styles');

    // annotate all scripts
    const progressScripts = progress('Annotating scripts', scripts.length);
    scripts.forEach(file => {
      copy(file, data => ngAnnotate(data, {add: true}).src);
      progressScripts.tick();
    });

    // generate style index
    const progressStyles = progress('Generating styles', styles.length + 1);
    styles.forEach(file => {
      copy(file);
      progressStyles.tick();
    });
    fs.writeFileSync(ensureParent(fileStyles), styles
      .filter(s => _contains(path.join(pathSrc, 'app'), s))
      .map(_toStyleImport)
      .join('\n') + '\n', 'utf8');
    progressStyles.tick();

    // generating supported browsers list
    const browserRegexp = browserListRegexp.getUserAgentRegExp({
      allowHigherVersions: true
    });
    const progressBrowsers = progress('Generating supported browser list', 1);
    fs.writeFileSync(fileBrowsers, `module.exports = ${browserRegexp}`);
    progressBrowsers.tick();

    // generate template cache
    const progressTemplates = progress('Generating templates', 2);
    progressTemplates.tick();
    buildTemplateCache(() => {
      progressTemplates.tick();
      if (doWatch) {
        log("Watching...");
      } else {
        process.exit();
      }
    });
  } else if (prev === null) {
    // file was created
    if (_isScript(result)) {
      log('Adding script: ' + result);
      copy(result, data => ngAnnotate(data, {add: true}).src);
    } else if (_isStyle(result)) {
      log('Adding style: ' + result);
      copy(result);
      if (_contains(path.join(pathSrc, 'app'), result)) {
        addLine(fileStyles, _toStyleImport(result) + '\n');
      }
    } else if (_isTemplate(result)) {
      log('Adding template: ' + result);
      buildTemplateCache();
    }
  } else if (curr.nlink === 0) {
    // file was removed
    if (_isScript(result)) {
      log('Removing script: ' + result);
      remove(result);
    } else if (_isStyle(result)) {
      log('Removing style: ' + result);
      remove(result);
      if (_contains(path.join(pathSrc, 'app'), result)) {
        removeLine(fileStyles, _toStyleImport(result) + '\n');
      }
    } else if (_isTemplate(result)) {
      log('Removing template: ' + result);
      buildTemplateCache();
    }
  } else {
    // file was changed
    if (_isScript(result)) {
      log('Updating script: ' + result);
      copy(result, data => ngAnnotate(data, {add: true}).src);
    } else if (_isStyle(result)) {
      log('Updating style: ' + result);
      copy(result);
    } else if (_isTemplate(result)) {
      log('Updating template: ' + result);
      buildTemplateCache();
    }
  }
});



/**
 * Copies the given file and optionally transforms it.
 *
 * @param file      the file path
 * @param transform a transformation function
 */
function copy(file, transform) {
  const data = fs.readFileSync(file, 'utf8');
  const res = transform ? transform(data) : data;
  const tmp = ensureParent(path.join(pathTmp, 'rel', file));
  fs.writeFileSync(tmp, res, 'utf8');
}

/**
 * Builds the template cache using ngTemplate.
 *
 * @param callback a callback to be executed when the process finished
 */
function buildTemplateCache(callback) {
  ngTemplate({
    filesGlob: '../src/**/*.html',
    fileList: [],
    strict: true,
    ignoreMissing: false,
    style: 'browser',
    header: '// auto-generated file automatically generated by angular-template-cache',
    moduleName: 'commons.templates',
    newModule: true,
    basePath: '../src/main/',
    quotmark: 'single',
    whitespace: 'spaces',
    htmlmin: true,
    htmlminOptions: {
      caseSensitive: true,
      collapseWhitespace: true,
      conservativeWhitespace: true,
      includeAutoGeneratedTags: false
    },
    output: ensureParent(fileTemplates)
  }).then(callback);
}

/**
 * Appends the given line to the end of the file.
 *
 * @param file the file path
 * @param line the line to be added
 */
function addLine(file, line) {
  fs.appendFileSync(file, line, 'utf8');
}

/**
 * Removes the given line from the file.
 *
 * @param file the file path
 * @param line the line to be removed
 */
function removeLine(file, line) {
  const data = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, data.replace(line), 'utf8');
}

/**
 * Ensures the existence of the parent folder of the given file.
 *
 * @param file the file path
 * @returns {string} the file path
 */
function ensureParent(file) {
  const name = path.dirname(file);
  if (!fs.existsSync(name)) {
    ensureParent(name);
    fs.mkdirSync(name);
  }
  return file;
}

/**
 * Deletes the given file and recursively deletes the parent folder if it is empty.
 *
 * @param file the file path
 */
function remove(file) {
  const tmp = path.join(pathTmp, file);
  fs.unlink(tmp, err => {
    if (err) throw err;
    removeParentIfEmpty(tmp);
  });
}

/**
 * Recursively deletes the parent folder of the given file if it is empty.
 *
 * @param file the file path
 */
function removeParentIfEmpty(file) {
  const name = path.dirname(file);
  if (name !== pathTmp) {
    fs.readdir(name, (err, files) => {
      if (err) throw err;
      if (files.length === 0) {
        fs.rmdir(name, err => {
          if (err) throw err;
          removeParentIfEmpty(name);
        });
      }
    });
  }
}

/**
 * Creates a new progress bar.
 *
 * @param title the title of the progress bar
 * @param total the total number of steps of the progress bar
 * @returns {ProgressBar} the progress bar
 */
function progress(title, total) {
  return new ProgressBar(title + ': [:bar] :percent in :elapseds', {
    width: 20,
    complete: '=',
    incomplete: ' ',
    total: total,
    stream: process.stdout
  });
}

function _toStyleImport(file) {
  return '@import "./' + path.relative(pathSrc, file).replace(/\\/g,"/") + '";'
}

function _isScript(file) {
  return !file.includes('_scsslint_tmp') && file.endsWith('.js');
}

function _isStyle(file) {
  return file.endsWith('.scss');
}

function _isTemplate(file) {
  return file.endsWith('.html');
}

function _contains(p1, p2) {
  return p1.startsWith(p2) || p2.startsWith(p1);
}
