const cloud = require('wx-server-sdk')
const https = require('https')
const http = require('http')
const Jimp = require('jimp')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// imgSecCheck 单张图片 1MB 上限
const IMG_SEC_CHECK_MAX_SIZE = 1 * 1024 * 1024

// 将远程图片 URL 下载为 Buffer（cloud.uploadFile 的 fileContent 需要 Buffer）
function downloadImageAsBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    const req = client.get(url, (res) => {
      // 处理重定向
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadImageAsBuffer(res.headers.location).then(resolve).catch(reject)
        return
      }
      if (res.statusCode !== 200) {
        reject(new Error(`下载图片失败，状态码: ${res.statusCode}`))
        return
      }
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    })
    req.on('error', reject)
    req.setTimeout(15000, () => {
      req.destroy(new Error('下载图片超时'))
    })
  })
}

// 压缩图片到 1MB 以内，供 imgSecCheck 使用
// 策略：逐步缩小尺寸 + JPEG 质量递降，直到体积达标
// 原图保持不变，仅压缩送检副本
async function compressForSecCheck(buffer) {
  if (buffer.length <= IMG_SEC_CHECK_MAX_SIZE) {
    return { buffer, contentType: 'image/png' }
  }

  let image = await Jimp.read(buffer)
  const qualities = [80, 60, 40, 20]
  for (const quality of qualities) {
    const compressed = await image.quality(quality).getBufferAsync(Jimp.MIME_JPEG)
    if (compressed.length <= IMG_SEC_CHECK_MAX_SIZE) {
      return { buffer: compressed, contentType: 'image/jpeg' }
    }
    // 质量降完仍超限，缩小尺寸后重试
    image = image.resize(Math.round(image.bitmap.width * 0.8), Jimp.AUTO)
  }
  // 兜底：强制缩到 512px + 低质量 JPEG
  image = await Jimp.read(buffer)
  image.resize(512, Jimp.AUTO)
  const finalBuffer = await image.quality(40).getBufferAsync(Jimp.MIME_JPEG)
  return { buffer: finalBuffer, contentType: 'image/jpeg' }
}

exports.main = async (event, context) => {
  const { prompt, desc, stylePrompt } = event
  const wxContext = cloud.getWXContext()

  try {
    // 1. 文本内容安全检测（生成前拦截，避免浪费 AI 资源）
    const textToCheck = `${desc || ''} ${stylePrompt || ''} ${prompt || ''}`.trim()
    if (textToCheck) {
      const textCheck = await cloud.openapi.security.msgSecCheck({
        content: textToCheck
      })
      if (textCheck.errCode !== 0) {
        return { errorMsg: '输入内容含违规信息，请修改后重试' }
      }
    }

    // 2. 调用混元文生图
    const model = cloud.extend.AI.createImageModel('cloudbase')
    const res = await model.generateImage({
      prompt: prompt || `${stylePrompt}, ${desc}`,
      size: '768:768',
      num: 1
    })

    if (!res.data || res.data.length === 0) {
      return { errorMsg: 'AI未返回图片' }
    }

    const tempUrl = res.data[0].url

    // 3. 下载图片为 Buffer
    const imageBuffer = await downloadImageAsBuffer(tempUrl)

    // 4. 图片内容安全检测（生成后拦截，避免违规图入库）
    // imgSecCheck 单张限 1MB，超过时压缩送检（原图不变）
    const { buffer: checkBuffer, contentType } = await compressForSecCheck(imageBuffer)
    const imgCheck = await cloud.openapi.security.imgSecCheck({
      media: { contentType, value: checkBuffer }
    })
    if (imgCheck.errCode !== 0) {
      return { errorMsg: '生成内容含违规信息，请重新创作' }
    }

    // 5. 上传到云存储（原图，不压缩）
    const uploadRes = await cloud.uploadFile({
      cloudPath: `patterns/${wxContext.OPENID}/${Date.now()}.png`,
      fileContent: imageBuffer
    })

    return {
      imageUrl: uploadRes.fileID,
      msg: 'success'
    }
  } catch (err) {
    console.error('callAIImage error:', err)
    return { errorMsg: err.message || 'AI生成失败' }
  }
}
