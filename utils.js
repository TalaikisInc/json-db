import { writeFile, close } from 'fs'

export const closeFile = (descriptor, done) => {
  close(descriptor, (err) => {
    if (!err) {
      done(false, {})
    } else {
      done(`Error closing file: ${err.message}`)
    }
  })
}

export const write = (descriptor, data, done) => {
  writeFile(descriptor, data, (err) => {
    if (!err) {
      closeFile(descriptor, done)
    } else {
      done(`Error writing file: ${err.message}`)
    }
  })
}

export const stringToJson = (msg, done) => {
  try {
    done(false, JSON.parse(msg))
  } catch (e) {
    done(e)
  }
}
