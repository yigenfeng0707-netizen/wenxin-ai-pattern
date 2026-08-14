function generateShareImage(canvas, ctx, options) {
  const { patternImage, appName, desc } = options
  const width = canvas.width / wx.getSystemInfoSync().pixelRatio
  const height = canvas.height / wx.getSystemInfoSync().pixelRatio

  return new Promise((resolve) => {
    ctx.fillStyle = '#F5F2ED'
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = '#1B3A5C'
    ctx.font = 'bold 24px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(appName || '纹心·AI非遗纹样', width / 2, 40)

    if (patternImage) {
      const img = canvas.createImage()
      img.onload = () => {
        const imgW = width * 0.8
        const imgH = imgW * (img.height / img.width)
        const imgX = (width - imgW) / 2
        const imgY = 70
        ctx.drawImage(img, imgX, imgY, imgW, imgH)

        ctx.fillStyle = '#A0522D'
        ctx.font = '14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(desc || '', width / 2, imgY + imgH + 30)

        ctx.fillStyle = '#AAAAAA'
        ctx.font = '12px sans-serif'
        ctx.fillText('AI辅助创作 · 扫码体验', width / 2, height - 20)

        wx.canvasToTempFilePath({
          canvas,
          success: (res) => resolve(res.tempFilePath)
        })
      }
      img.src = patternImage
    } else {
      resolve(null)
    }
  })
}

module.exports = {
  generateShareImage
}