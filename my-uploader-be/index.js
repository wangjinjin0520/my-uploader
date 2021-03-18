const http = require("http");
const path = require("path");
const fse = require("fs-extra");
const multiparty = require("multiparty");

const server = http.createServer();
const UPLOAD_DIR = path.resolve(__dirname, "..", "target"); // 大文件存储目录

server.on("request", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.status = 200;
    res.end();
    return;
  }
  const multipart = new multiparty.Form();
  multipart.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      res.status = 500;
      res.end("process file chunk failed");
      return;
    }
    const [chunk] = files.chunk;
    const [hash] = fields.hash;
    const [filename] = fields.filename;
    const chunkDir = path.resolve(UPLOAD_DIR, filename);
    const filePath = path.resolve(
      UPLOAD_DIR,
      `${hash}${extractExt(filename)}`
    );
    console.log('filePath', filePath)
    // 文件存在直接返回
    if (fse.existsSync(filePath)) {
      res.end("file exist");
      return;
    }
    // 切片目录不存在，创建切片目录
    if (!fse.existsSync(chunkDir)) {
      await fse.mkdirSync(chunkDir)
    }

    // fs-extra 专用方法，类似 fs.rename 并且跨平台
    // fs-extra 的 rename 方法 windows 平台会有权限问题
    // https://github.com/meteor/meteor/issues/7852#issuecomment-255767835
    await fse.move(chunk.path, `${chunkDir}/${hash}`);
    res.end("received file chunk");
  });
});

server.listen(3000, () => console.log("正在监听 3000 端口"));
