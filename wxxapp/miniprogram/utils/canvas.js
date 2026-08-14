function composeProductPreview(ctx, canvas, options) {
  const { productType, patternImage, productTemplate } = options
  const width = canvas.width / wx.getSystemInfoSync().pixelRatio
  const height = canvas.height / wx.getSystemInfoSync().pixelRatio

  ctx.clearRect(0, 0, width, height)

  // 优先加载真实产品模板图作为底图
  if (productTemplate) {
    const tplImg = canvas.createImage()
    tplImg.onload = () => {
      // 模板作为底图先绘制到 canvas
      ctx.drawImage(tplImg, 0, 0, width, height)
      // 再将纹样合成到模板的纹样区域
      if (patternImage) {
        const pImg = canvas.createImage()
        pImg.onload = () => {
          const area = getProductPatternArea(productType, width, height)
          ctx.save()
          ctx.globalAlpha = 0.88
          drawRoundedRect(ctx, area.x, area.y, area.w, area.h, 8)
          ctx.clip()
          ctx.drawImage(pImg, area.x, area.y, area.w, area.h)
          ctx.restore()
          drawProductLabel(ctx, productType, width, height)
        }
        pImg.onerror = () => {
          drawProductLabel(ctx, productType, width, height)
        }
        pImg.src = patternImage
      } else {
        drawProductLabel(ctx, productType, width, height)
      }
    }
    tplImg.onerror = () => {
      // 模板加载失败，降级到增强绘制
      drawEnhancedProductPreview(ctx, canvas, productType, patternImage, width, height)
    }
    tplImg.src = productTemplate
    return
  }

  // 无模板时走增强绘制（产品形状轮廓 + 阴影 + 纹样半透明叠加）
  drawEnhancedProductPreview(ctx, canvas, productType, patternImage, width, height)
}

// 增强版产品预览绘制（无模板时使用）
function drawEnhancedProductPreview(ctx, canvas, productType, patternImage, width, height) {
  drawProductBackground(ctx, productType, width, height)

  if (patternImage) {
    const img = canvas.createImage()
    img.onload = () => {
      const area = getProductPatternArea(productType, width, height)
      ctx.save()
      ctx.globalAlpha = 0.88
      // 按产品形状裁剪纹样，让纹样自然贴合产品外形
      buildProductPath(ctx, productType, width, height)
      ctx.clip()
      ctx.drawImage(img, area.x, area.y, area.w, area.h)
      ctx.restore()
      // 顶层装饰（描边、听筒、手提带、流苏、缝线等）
      drawProductDecorations(ctx, productType, width, height)
      drawProductLabel(ctx, productType, width, height)
    }
    img.onerror = () => {
      drawProductDecorations(ctx, productType, width, height)
      drawProductLabel(ctx, productType, width, height)
    }
    img.src = patternImage
  } else {
    drawProductDecorations(ctx, productType, width, height)
    drawProductLabel(ctx, productType, width, height)
  }
}

// 获取产品形状信息（位置、尺寸、特殊参数）
function getProductShape(type, w, h) {
  if (type === 'phone') {
    const pw = w * 0.58
    const ph = h * 0.78
    return { x: (w - pw) / 2, y: h * 0.07, w: pw, h: ph, r: 24 }
  }
  if (type === 'bag') {
    const bw = w * 0.68
    const bh = h * 0.65
    const topInset = bw * 0.08
    return { x: (w - bw) / 2, y: h * 0.2, w: bw, h: bh, topInset: topInset }
  }
  if (type === 'scarf') {
    const sw = w * 0.78
    const sh = h * 0.5
    const skew = sw * 0.06
    return { x: (w - sw) / 2, y: h * 0.22, w: sw, h: sh, skew: skew }
  }
  if (type === 'cushion') {
    const cw = w * 0.66
    const ch = h * 0.66
    return { x: (w - cw) / 2, y: h * 0.1, w: cw, h: ch, r: 12 }
  }
  // 默认 phone
  const pw = w * 0.58
  const ph = h * 0.78
  return { x: (w - pw) / 2, y: h * 0.07, w: pw, h: ph, r: 24 }
}

// 构建产品形状路径（不填充/描边，仅构建路径供 fill/stroke/clip 使用）
function buildProductPath(ctx, type, w, h) {
  const shape = getProductShape(type, w, h)
  ctx.beginPath()
  if (type === 'bag') {
    // 梯形（上窄下宽）
    ctx.moveTo(shape.x + shape.topInset, shape.y)
    ctx.lineTo(shape.x + shape.w - shape.topInset, shape.y)
    ctx.lineTo(shape.x + shape.w, shape.y + shape.h)
    ctx.lineTo(shape.x, shape.y + shape.h)
    ctx.closePath()
  } else if (type === 'scarf') {
    // 平行四边形（带轻微倾斜）
    ctx.moveTo(shape.x + shape.skew, shape.y)
    ctx.lineTo(shape.x + shape.w, shape.y)
    ctx.lineTo(shape.x + shape.w - shape.skew, shape.y + shape.h)
    ctx.lineTo(shape.x, shape.y + shape.h)
    ctx.closePath()
  } else {
    // phone / cushion 为圆角矩形
    drawRoundedRect(ctx, shape.x, shape.y, shape.w, shape.h, shape.r)
  }
  return shape
}

// 绘制产品背景：产品形状轮廓 + 柔和阴影 + 填充底色
function drawProductBackground(ctx, type, w, h) {
  // 整体浅色画布底
  ctx.fillStyle = '#FAF8F4'
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  // 柔和阴影让产品有立体感
  ctx.shadowColor = 'rgba(0, 0, 0, 0.22)'
  ctx.shadowBlur = 24
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 10

  const fillColors = {
    phone: '#F5F2ED',
    bag: '#EDE8E0',
    scarf: '#F0EDE8',
    cushion: '#E8E0D5'
  }
  ctx.fillStyle = fillColors[type] || '#F5F2ED'
  buildProductPath(ctx, type, w, h)
  ctx.fill()
  ctx.restore()
}

// 获取纹样在产品上的填充区域
function getProductPatternArea(type, w, h) {
  const shape = getProductShape(type, w, h)
  if (type === 'phone') {
    // 顶部留出听筒区域，纹样填充中下部
    return {
      x: shape.x + 4,
      y: shape.y + shape.h * 0.14,
      w: shape.w - 8,
      h: shape.h * 0.82
    }
  }
  if (type === 'bag') {
    // 纹样填充正面中央
    const inset = shape.w * 0.08
    return {
      x: shape.x + inset,
      y: shape.y + shape.h * 0.12,
      w: shape.w - inset * 2,
      h: shape.h * 0.76
    }
  }
  if (type === 'scarf') {
    // 纹样填充丝巾内部（留出边缘给流苏）
    return {
      x: shape.x + shape.skew + 6,
      y: shape.y + 6,
      w: shape.w - shape.skew * 2 - 12,
      h: shape.h - 12
    }
  }
  if (type === 'cushion') {
    // 纹样填充中央（留出缝线边缘）
    const inset = 14
    return {
      x: shape.x + inset,
      y: shape.y + inset,
      w: shape.w - inset * 2,
      h: shape.h - inset * 2
    }
  }
  // 默认 phone
  return {
    x: shape.x + 4,
    y: shape.y + shape.h * 0.14,
    w: shape.w - 8,
    h: shape.h * 0.82
  }
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// 绘制产品装饰（按类型分发）
function drawProductDecorations(ctx, type, w, h) {
  if (type === 'phone') {
    drawPhoneDecorations(ctx, w, h)
  } else if (type === 'bag') {
    drawBagDecorations(ctx, w, h)
  } else if (type === 'scarf') {
    drawScarfDecorations(ctx, w, h)
  } else if (type === 'cushion') {
    drawCushionDecorations(ctx, w, h)
  } else {
    drawPhoneDecorations(ctx, w, h)
  }
}

// 手机壳装饰：顶部听筒线、摄像头、外壳描边
function drawPhoneDecorations(ctx, w, h) {
  const shape = getProductShape('phone', w, h)
  ctx.save()
  // 顶部听筒线
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
  ctx.fillRect(shape.x + shape.w / 2 - 22, shape.y + 14, 44, 4)
  // 摄像头小圆点
  ctx.beginPath()
  ctx.arc(shape.x + shape.w - 22, shape.y + 18, 5, 0, Math.PI * 2)
  ctx.fill()
  // 外壳描边
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)'
  ctx.lineWidth = 1.5
  drawRoundedRect(ctx, shape.x, shape.y, shape.w, shape.h, shape.r)
  ctx.stroke()
  ctx.restore()
}

// 帆布袋装饰：两个手提带、袋身描边
function drawBagDecorations(ctx, w, h) {
  const shape = getProductShape('bag', w, h)
  ctx.save()
  // 手提带（弧形）
  ctx.strokeStyle = '#8B7355'
  ctx.lineWidth = 5
  ctx.lineCap = 'round'
  const handleTop = shape.y - shape.h * 0.2
  // 左手提带
  ctx.beginPath()
  ctx.moveTo(shape.x + shape.w * 0.28, shape.y)
  ctx.quadraticCurveTo(shape.x + shape.w * 0.28, handleTop, shape.x + shape.w * 0.4, handleTop)
  ctx.stroke()
  // 右手提带
  ctx.beginPath()
  ctx.moveTo(shape.x + shape.w * 0.72, shape.y)
  ctx.quadraticCurveTo(shape.x + shape.w * 0.72, handleTop, shape.x + shape.w * 0.6, handleTop)
  ctx.stroke()
  // 袋身描边
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'
  ctx.lineWidth = 1.5
  buildProductPath(ctx, 'bag', w, h)
  ctx.stroke()
  ctx.restore()
}

// 丝巾装饰：边缘流苏、描边
function drawScarfDecorations(ctx, w, h) {
  const shape = getProductShape('scarf', w, h)
  ctx.save()
  ctx.strokeStyle = 'rgba(139, 115, 85, 0.55)'
  ctx.lineWidth = 1
  const fringeLen = 8
  const fringeSpacing = 6
  // 顶边流苏
  for (let i = 0; i <= shape.w; i += fringeSpacing) {
    const sx = shape.x + shape.skew + i
    const sy = shape.y
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.lineTo(sx, sy - fringeLen)
    ctx.stroke()
  }
  // 底边流苏
  for (let i = 0; i <= shape.w; i += fringeSpacing) {
    const sx = shape.x + i
    const sy = shape.y + shape.h
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.lineTo(sx, sy + fringeLen)
    ctx.stroke()
  }
  // 边缘描边
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'
  ctx.lineWidth = 1
  buildProductPath(ctx, 'scarf', w, h)
  ctx.stroke()
  ctx.restore()
}

// 靠垫装饰：缝线、四角纽扣点、描边
function drawCushionDecorations(ctx, w, h) {
  const shape = getProductShape('cushion', w, h)
  ctx.save()
  // 双线缝边（内缩的圆角矩形描边）
  ctx.strokeStyle = 'rgba(139, 115, 85, 0.5)'
  ctx.lineWidth = 1
  const inset = 8
  drawRoundedRect(ctx, shape.x + inset, shape.y + inset, shape.w - 2 * inset, shape.h - 2 * inset, Math.max(2, shape.r - inset))
  ctx.stroke()
  // 四角纽扣点
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)'
  const dotR = 4
  const dotInset = 16
  const corners = [
    [shape.x + dotInset, shape.y + dotInset],
    [shape.x + shape.w - dotInset, shape.y + dotInset],
    [shape.x + dotInset, shape.y + shape.h - dotInset],
    [shape.x + shape.w - dotInset, shape.y + shape.h - dotInset]
  ]
  corners.forEach(function (c) {
    ctx.beginPath()
    ctx.arc(c[0], c[1], dotR, 0, Math.PI * 2)
    ctx.fill()
  })
  // 外边描边
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'
  ctx.lineWidth = 1.5
  drawRoundedRect(ctx, shape.x, shape.y, shape.w, shape.h, shape.r)
  ctx.stroke()
  ctx.restore()
}

// 产品名称标签（胶囊式背景 + 美化字体，绘制在产品形状下方）
function drawProductLabel(ctx, type, w, h) {
  const labels = {
    phone: '手机壳',
    bag: '帆布袋',
    scarf: '丝巾',
    cushion: '靠垫'
  }
  const label = labels[type] || ''
  if (!label) return

  ctx.save()
  const fontSize = 13
  ctx.font = fontSize + 'px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const textW = ctx.measureText(label).width
  const padX = 14
  const padY = 6
  const boxW = textW + padX * 2
  const boxH = fontSize + padY * 2
  const boxX = (w - boxW) / 2
  const boxY = h - boxH - 14

  // 胶囊式半透明背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.06)'
  drawRoundedRect(ctx, boxX, boxY, boxW, boxH, boxH / 2)
  ctx.fill()
  // 标签文字
  ctx.fillStyle = '#666666'
  ctx.fillText(label, w / 2, boxY + boxH / 2)
  ctx.restore()
}

function addAIWatermark(ctx, canvas, x, y) {
  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  const w = 60
  const h = 20
  ctx.fillRect(x - w, y - h, w, h)
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('AI生成', x - w / 2, y - h / 2)
  ctx.restore()
}

// 将云存储图片打上"AI生成"水印，导出为临时文件路径
// 用于保存到相册、分享时携带合规水印
function addWatermarkAndExport(canvas, imagePath) {
  return new Promise((resolve, reject) => {
    const ctx = canvas.getContext('2d')
    const img = canvas.createImage()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      // 右下角水印
      const w = Math.max(80, img.width * 0.12)
      const h = Math.max(24, img.width * 0.035)
      const padding = Math.max(10, img.width * 0.02)
      const x = img.width - w - padding
      const y = img.height - h - padding
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillRect(x, y, w, h)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = `${Math.max(14, img.width * 0.022)}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('AI生成', x + w / 2, y + h / 2)
      wx.canvasToTempFilePath({
        canvas: canvas,
        fileType: 'png',
        success: (res) => resolve(res.tempFilePath),
        fail: (err) => reject(new Error(err.errMsg || '导出水印图失败'))
      })
    }
    img.onerror = () => reject(new Error('加载图片失败，无法打水印'))
    img.src = imagePath
  })
}

const styleColors = {
  1: ['#1B3A5C', '#2C5F7C', '#4A7FA8'],
  2: ['#A0522D', '#C4783E', '#D4A017'],
  3: ['#2C5F7C', '#5B8BAF', '#A0522D'],
  4: ['#A0522D', '#1B3A5C', '#D4A017'],
  5: ['#0D2137', '#1B3A5C', '#2C5F7C'],
  6: ['#D4A017', '#A0522D', '#1B3A5C']
}

function generateMockPattern(canvas, styleId, desc) {
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height
  const colors = styleColors[styleId] || styleColors[1]

  const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
  gradient.addColorStop(0, colors[0])
  gradient.addColorStop(0.5, colors[1])
  gradient.addColorStop(1, colors[2])
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, w, h)

  for (let i = 0; i < 30; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const r = 20 + Math.random() * 80
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = colors[i % 3]
    ctx.globalAlpha = 0.15 + Math.random() * 0.2
    ctx.fill()
  }
  ctx.globalAlpha = 1

  for (let i = 0; i < 8; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const r = 30 + Math.random() * 60
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.strokeStyle = colors[i % 3]
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.3
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.font = '20px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('AI生成预览图', w / 2, h - 30)

  return canvas.toDataURL('image/png')
}

module.exports = {
  composeProductPreview,
  addAIWatermark,
  addWatermarkAndExport,
  generateMockPattern
}