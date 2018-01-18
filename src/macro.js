import fs from 'fs'
import path from 'path'
import MacroError from 'babel-plugin-macros'

import convert from './'

const transform = (opts = {}) => {
  let props = ''

  if (opts.expandProps && opts.ref) {
    props = '{svgRef, ...props}'
  } else if (opts.expandProps) {
    props = 'props'
  } else if (opts.ref) {
    props = '{svgRef}'
  }

  return (code, state) => `const ${state.componentName} = (${props}) => ${code}\n\n`
}

const readSvg = filename =>
  new Promise((resolve, reject) => {
    fs.readFile(filename, (err, result) => {
      if (err) reject(err)
      resolve(result)
    })
  })

const asFunction = (argumentsPaths, state) => {
  const identifier = argumentsPaths[0].parentPath.parent.id.name
  const basePath = path.dirname(state.filename)
  const svgFilename = argumentsPaths[0].evaluate().value

  return readSvg(path.resolve(basePath, svgFilename)).then(file => {
    convert(file, { componentName: identifier, template: transform }).then(result => {
      // TODO replace function call with generated code in `result`
      console.log(result)
    })
  })
}

const svgrMacro = ({ references, state }) => {
  references.default.forEach(referencePath => {
    if (referencePath.parentPath.type === 'CallExpression') {
      asFunction(referencePath.parentPath.get('arguments'), state)
    } else {
      throw new MacroError('Macro can only be used as a function')
    }
  })
}

export default svgrMacro
