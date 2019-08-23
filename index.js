const { open, unlink, ftruncate, readdir, readFile, stat, writeFile, close, mkdir, rmdir } = require('fs')
const { join } = require('path')
const { promisify } = require('util')

const closeFile = (descriptor, done) => {
  close(descriptor, (err) => {
    if (!err) {
      done(false, {})
    } else {
      done(`Error closing file: ${err.message}`)
    }
  })
}

const write = (descriptor, data, done) => {
  writeFile(descriptor, data, (err) => {
    if (!err) {
      closeFile(descriptor, done)
    } else {
      done(`Error writing file: ${err.message}`)
    }
  })
}

const stringToJson = (msg, done) => {
  try {
    done(false, JSON.parse(msg))
  } catch (e) {
    done(e.message)
  }
}

const createTable = (dir, done) => {
  mkdir(dir, (err) => {
    if (err) {
      if (err.code == 'EEXIST') {
        done(false)
      } else {
        done(err)
      }
    } else {
      done(false)
    }
  })
}

const _create = (baseDir, dir, file, data, done) => {
  const dataDir = join(baseDir, dir)
  const fileName = join(dataDir, `${file}.json`)
  createTable(dataDir, (err) => {
    if (!err) {
      open(fileName, 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
          const dataString = typeof data === 'string' ? data : JSON.stringify(data)
          write(fileDescriptor, dataString, done)
        } else {
          done('Cannot create new item, it may exist already.')
        }
      })
    } else {
      done(`Cannot create table: ${err.message}`)
    }
  })
}

const _read = (baseDir, dir, file, done) => {
  const filePath = join(baseDir, dir, `${file}.json`)
  stat(filePath, (err, _) => {
    if (!err) {
      readFile(filePath, 'utf8', (err, data) => {
        if (!err && data) {
          stringToJson(data, (err, parsed) => {
            if (!err && parsed) {
              done(false, parsed)
            } else {
              done(err)
            }
          })
        } else {
          done(err, data)
        }
      })
    } else {
      done('No such item or table.')
    }
  })
}

const _update = (baseDir, dir, file, data, done) => {
  open(join(baseDir, dir, `${file}.json`), 'r+', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data)
      ftruncate(fileDescriptor, () => {
        if (!err) {
          write(fileDescriptor, dataString, done)
        } else {
          done('Error truncating file.')
        }
      })
    } else {
      done('Cannot open file for updating, file may not exist.')
    }
  })
}

const _destroy = (baseDir, dir, file, done) => {
  const filepath = join(baseDir, dir, `${file}.json`)
  stat(filepath, (err, _) => {
    if (!err) {
      unlink(filepath, (err) => {
        if (!err) {
          done(false, {})
        } else {
          done('Error deleting file.')
        }
      })
    } else {
      done('File doens\'t exist.')
    }
  })
}

const _list = (baseDir, dir, done) => {
  const filePath = join(baseDir, dir)
  stat(filePath, (err, r) => {
    if (err === null) {
      readdir(filePath, (err, data) => {
        if (!err && data && data.length > 0) {
          const out = []
          data.forEach((filename) => {
            if (filename.indexOf('.json') > -1) {
              out.push(filename.replace('.json', ''))
            }
          })
          done(false, out)
        } else {
          done(err)
        }
      })
    } else {
      done(false, [])
    }
  })
}

const _deleteTable = (baseDir, dir, done) => {
  const path = join(baseDir, dir)
  _list(baseDir, dir, (err, toDelete) => {
    if (!err && toDelete) {
      let errors = 0
      let i = 1
      toDelete.forEach((el) => {
        _destroy(baseDir, dir, el, (err, _) => {
          if (err) {
            errors++  
            i++
          } else {
            if (toDelete.length === i && errors === 0) {
              try {
                stat(path, (err, r) => {
                  if (err === null) {
                    rmdir(path, (err) => {
                      if (err === null) {
                        done(false)
                      } else {
                        done(`Error deleting table: ${err.message} with ${errors} other errrors.`)
                      }
                    })
                  } else {
                    done(false)
                  }
                })
              } catch (e) {
                // console.error(e.message)
                done(false)
              }
            }
            i++
          }
        })
      })
    } else {
      done(err)
    }
  })
}

module.exports.create = promisify(_create)
module.exports.read = promisify(_read)
module.exports.destroy = promisify(_destroy)
module.exports.list = promisify(_list)
module.exports.update = promisify(_update)
module.exports.destroyTable = promisify(_deleteTable)
