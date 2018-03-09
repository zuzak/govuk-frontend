const express = require('express')
const app = express()
const nunjucks = require('nunjucks')
const fs = require('fs')
const path = require('path')
const port = (process.env.PORT || 3000)
const yaml = require('js-yaml')

const { componentNameToMacroName } = require('../lib/helper-functions')
const directoryToObject = require('../lib/directory-to-object')
const configPaths = require('../config/paths.json')

// Read the component data from its YAML file
function getComponentData (name) {
  let yamlPath = configPaths.src + `${name}/${name}.yaml`

  console.log(yamlPath)

  try {
    return yaml.safeLoad(
      fs.readFileSync(yamlPath, 'utf8'), { json: true }
    )
  } catch (error) {
    throw error
  }
}

function titlecase (string) {
  string = string.replace('-', ' ')
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function prettyPrint (data) {
  // return JSON.stringify(data, null, 2).replace(/"([^"]+)":/g, '$1:')
  return JSON.stringify(data, null, 2)
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
app.get('/components/:name', function (req, res, next) {
  const name = req.params.name

  const macroName = componentNameToMacroName(name)
  const { examples } = getComponentData(name)

  const extendedExamples = examples.map(example => {
    console.log(example)
    const data = example.data

    const macroParameters = prettyPrint(data)

    const snippet = (
      `{% from '${name}/macro.njk' import ${macroName} %}

{{ ${macroName}(${macroParameters}) }}`
    )

    const markup = env.renderString(snippet).trim()

    return {
      ...example,
      markup,
      snippet
    }
  })

  res.render('component.njk', {
    examples: extendedExamples,
    name,
    macroName,
    title: titlecase(name)
  })
})

// Component example preview
app.get('/components/:name/:example*?/preview', function (req, res, next) {
  // Find the data for the specified example (or the default example)
  const componentName = req.params.name
  const { examples } = getComponentData(componentName)

  const requestedExampleName = req.params.example
  const exampleConfig = examples.find(example => {
    return example.name === requestedExampleName
  })

  if (!exampleConfig) {
    next()
  }

  // Construct and evaluate the component with the data for this example
  let macroName = componentNameToMacroName(componentName)
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
    examples,
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

// Disallow search index indexing
app.use(function (req, res, next) {
  // none - Equivalent to noindex, nofollow
  // noindex - Do not show this page in search results and do not show a "Cached" link in search results.
  // nofollow - Do not follow the links on this page
  res.setHeader('X-Robots-Tag', 'none')
  next()
})

module.exports = server
