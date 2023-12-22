import * as multer from 'multer'
import * as fs from 'fs'

//multer.distkStorage 是磁盘存储，
//通过 destination、filename 的参数分别指定保存的目录和文件名。
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      fs.mkdirSync('uploads')
    } catch (e) {}

    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      '-' +
      file.originalname
    cb(null, uniqueSuffix)
  }
})

export { storage }
