const express = require('express')
const app = express()
const nunjucks = require('nunjucks')
const fs = require('fs')
const path = require('path')
const port = (process.env.PORT || 3000)
const yaml = require('js-yaml')

const helperFunctions = require('../lib/helper-functions')
const directoryToObject = require('../lib/directory-to-object')
const configPaths = require('../config/paths.json')

// Read the component data from its YAML file
function getComponentData (name) {
  let yamlPath = configPaths.src + `${name}/${name}.yaml`

  try {
    return yaml.safeLoad(
      fs.readFileSync(yamlPath, 'utf8'), { json: true }
    )
  } catch (error) {
    throw new Error(error)
  }
}

function titlecase (string) {
  string = string.replace('-', ' ')
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// Set up views
const appViews = [
  configPaths.layouts,
  configPaths.partials,
  configPaths.examples,
  configPaths.src
]

// Configure nunjucks
let env = nunjucks.configure(appViews, {
  autoescape: true, // output with dangerous characters are escaped automatically
  express: app, // the express app that nunjucks should install to
  noCache: true, // never use a cache and recompile templates each time
  trimBlocks: true, // automatically remove trailing newlines from a block/tag
  lstripBlocks: true, // automatically remove leading whitespace from a block/tag
  watch: true // reload templates when they are changed. needs chokidar dependency to be installed
})

// make the function available as a filter for all templates
env.addFilter('componentNameToMacroName', helperFunctions.componentNameToMacroName)

// Set view engine
app.set('view engine', 'njk')

// Set up middleware to serve static assets
app.use('/public', express.static(configPaths.public))

// serve html5-shiv from node modules
app.use('/vendor/html5-shiv/', express.static('node_modules/html5shiv/dist/'))
app.use('/icons', express.static(path.join(configPaths.src, 'icons')))

const server = app.listen(port, () => {
  console.log('Listening on port ' + port + '   url: http://localhost:' + port)
})

// Disallow search index indexing
app.use(function (req, res, next) {
  // none - Equivalent to noindex, nofollow
  // noindex - Do not show this page in search results and do not show a "Cached" link in search results.
  // nofollow - Do not follow the links on this page
  res.setHeader('X-Robots-Tag', 'none')
  next()
})

// Define routes

// Index page - render the component list template
app.get('/', function (req, res) {
  Promise.all([
    directoryToObject(path.resolve(configPaths.src)),
    directoryToObject(path.resolve(configPaths.examples))
  ]).then(result => {
    const [components, examples] = result

    // filter out globals, all and icons package
    const {globals, all, icons, ...filteredComponents} = components

    res.render('index', {
      componentsDirectory: filteredComponents,
      examplesDirectory: examples
    })
  })
})

// Component 'README' page
app.get('/components/:component', function (req, res, next) {
  let componentName = req.params.component

  res.render('component.njk', {
    data: getComponentData(componentName),
    name: componentName,
    title: titlecase(componentName)
  })
})

// Component example preview
app.get('/components/:component/:example*?/preview', function (req, res, next) {
  // Find the data for the specified example (or the default example)
  let componentName = req.params.component
  let componentData = getComponentData(componentName)

  let requestedExampleName = req.params.example || 'default'
  let exampleConfig = componentData.examples.find(
    example => example.name === requestedExampleName
  )

  if (!exampleConfig) {
    next()
  }

  // Construct and evaluate the component with the data for this example
  let macroName = helperFunctions.componentNameToMacroName(componentName)
  let macroParameters = JSON.stringify(exampleConfig.data, null, '\t')

  let componentView = env.renderString(
    `{% from '${componentName}/macro.njk' import ${macroName} %}
    {{ ${macroName}(${macroParameters}) }}`
  )

  let bodyClasses = ''
  if (req.query.iframe) {
    bodyClasses = 'app-iframe-in-component-preview'
  }

  res.render('component-preview', {
    bodyClasses,
    componentData,
    componentView
  })
})

// Example view
app.get('/examples/:example', function (req, res, next) {
  res.render(`${req.params.example}/index`, function (error, html) {
    if (error) {
      next(error)
    } else {
      res.send(html)
    }
  })
})

app.get('/robots.txt', function (req, res) {
  res.type('text/plain')
  res.send('User-agent: *\nDisallow: /')
})

// Since this is the last non-error-handling middleware, we assume 404, as nothing else responded.
app.use(function (req, res, next) {
  res.status(404)
  res.format({
    html: function () {
      res.render('http-error', { error: 'Page not found', message: 'If you entered a web address please check it was correct.', url: req.url })
    },
    json: function () {
      res.json({ error: 'Not found' })
    },
    default: function () {
      res.type('txt').send('Not found')
    }
  })
  next()
})

// Error-handling middleware, take the same form require an arity of 4.
// When connect has an error, it will invoke ONLY error-handling middleware
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.render('http-error', { error: 'Internal server error', message: err })
})

module.exports = server
