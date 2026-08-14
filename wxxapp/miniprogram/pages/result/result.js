const { callAIImage } = require('../../utils/api.js')
const { composeProductPreview, generateMockPattern, addWatermarkAndExport } = require('../../utils/canvas.js')
const { generateShareImage } = require('../../utils/share.js')

// Mock 开关：真实 AI 资源可用时设为 false
// 保留为降级方案，无 AI 资源包时可临时打开调试其他流程
const MOCK_MODE = false

Page({
  data: {
    generating: true,
    generateError: '',
    desc: '',
    styleId: 1,
    styleName: '',
    stylePrompt: '',
    resultImage: '',
    originalImage: '',
    workId: '',
    productTypes: [
      { id: 'phone', name: '手机壳' },
      { id: 'bag', name: '帆布袋' },
      { id: 'scarf', name: '丝巾' },
      { id: 'cushion', name: '靠垫' }
    ],
    currentProduct: 'phone',
    saved: false,
    shareImagePath: ''
  },

  onLoad(options) {
    const params = JSON.parse(decodeURIComponent(options.data))
    this.setData({
      desc: params.desc,
      styleId: params.styleId,
      styleName: params.styleName,
      stylePrompt: params.stylePrompt,
      optimizedPrompt: params.optimizedPrompt
    })
    this.doGenerate()
  },

  doGenerate() {
    this.setData({ generating: true, generateError: '' })

    if (MOCK_MODE) {
      this.mockGenerate()
      return
    }

    callAIImage({
      desc: this.data.desc,
      stylePrompt: this.data.stylePrompt,
      optimizedPrompt: this.data.optimizedPrompt
    }).then(res => {
      // 保存原图 fileID（用于入库），前端展示用打水印后的临时文件
      this.setData({ originalImage: res.imageUrl })
      return this.applyWatermark(res.imageUrl)
    }).then(watermarkedPath => {
      this.setData({
        generating: false,
        resultImage: watermarkedPath
      })
      this.initPreview()
      this.prepareShareImage()
    }).catch(err => {
      // 真实调用失败时显示错误，不再静默降级到 mock
      this.setData({
        generating: false,
        generateError: err.message || 'AI生成失败，请重试'
      })
    })
  },

  // 给生成图打"AI生成"水印，导出为临时文件用于展示/保存/分享
  applyWatermark(imageUrl) {
    return new Promise((resolve, reject) => {
      const query = wx.createSelectorQuery()
      query.select('#watermarkCanvas')
        .fields({ node: true })
        .exec((res) => {
          if (!res[0] || !res[0].node) {
            // canvas 未就绪时回退：直接用原图（页面层已有 CSS 水印覆盖）
            resolve(imageUrl)
            return
          }
          addWatermarkAndExport(res[0].node, imageUrl).then(resolve).catch(() => {
            // 打水印失败不阻断主流程，回退用原图
            resolve(imageUrl)
          })
        })
    })
  },

  mockGenerate() {
    setTimeout(() => {
      const mockCanvas = wx.createOffscreenCanvas({ type: '2d', width: 768, height: 768 })
      const mockUrl = generateMockPattern(mockCanvas, this.data.styleId, this.data.desc)
      this.setData({
        generating: false,
        resultImage: mockUrl,
        originalImage: mockUrl
      })
      this.initPreview()
      this.prepareShareImage()
    }, 2000)
  },

  prepareShareImage() {
    const query = wx.createSelectorQuery()
    query.select('#shareCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0] || !res[0].node) return
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = wx.getSystemInfoSync().pixelRatio
        const w = 600
        const h = 800
        canvas.width = w * dpr
        canvas.height = h * dpr
        ctx.scale(dpr, dpr)
        generateShareImage(canvas, ctx, {
          patternImage: this.data.resultImage,
          appName: '纹心·AI非遗纹样',
          desc: this.data.desc
        }).then(path => {
          if (path) {
            this.setData({ shareImagePath: path })
          }
        }).catch(() => {})
      })
  },

  onRetry() {
    this.doGenerate()
  },

  initPreview() {
    const query = wx.createSelectorQuery()
    query.select('#previewCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (res[0]) {
          this.canvas = res[0].node
          this.ctx = this.canvas.getContext('2d')
          const dpr = wx.getSystemInfoSync().pixelRatio
          this.canvas.width = res[0].width * dpr
          this.canvas.height = res[0].height * dpr
          this.ctx.scale(dpr, dpr)
          this.drawPreview()
        }
      })
  },

  drawPreview() {
    composeProductPreview(this.ctx, this.canvas, {
      productType: this.data.currentProduct,
      patternImage: this.data.resultImage
    })
  },

  onSelectProduct(e) {
    const id = e.currentTarget.dataset.id
    this.setData({ currentProduct: id })
    if (this.ctx) {
      this.drawPreview()
    }
  },

  onSave() {
    if (!this.data.resultImage) return
    if (this.data.saved) {
      wx.showToast({ title: '已保存', icon: 'none' })
      return
    }

    if (MOCK_MODE) {
      this.setData({ saved: true })
      wx.showToast({ title: '已保存到作品集', icon: 'success' })
      return
    }

    wx.cloud.callFunction({
      name: 'userOps',
      data: {
        action: 'save',
        work: {
          desc: this.data.desc,
          styleId: this.data.styleId,
          styleName: this.data.styleName,
          imageUrl: this.data.originalImage,
          createTime: Date.now()
        }
      },
      success: (res) => {
        // 保存返回的 workId，用于分享统计闭环
        this.setData({
          saved: true,
          workId: (res.result && res.result.id) || ''
        })
        wx.showToast({ title: '已保存到作品集', icon: 'success' })
      },
      fail: () => {
        wx.showToast({ title: '保存失败', icon: 'none' })
      }
    })
  },

  onSaveToAlbum() {
    if (!this.data.resultImage) return
    wx.saveImageToPhotosAlbum({
      filePath: this.data.resultImage,
      success: () => {
        wx.showToast({ title: '已保存到相册', icon: 'success' })
      },
      fail: (err) => {
        if (err.errMsg.includes('auth deny')) {
          wx.showModal({
            title: '提示',
            content: '需要相册权限才能保存图片',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting()
              }
            }
          })
        }
      }
    })
  },

  onARPreview() {
    if (!this.data.resultImage) {
      wx.showToast({ title: '请先生成纹样', icon: 'none' })
      return
    }
    wx.navigateTo({
      url: `/pages/ar/ar?pattern=${encodeURIComponent(this.data.resultImage)}`
    })
  },

  onShareAppMessage() {
    // 分享时记录分享行为（需已保存作品才有 workId）
    if (this.data.workId && !MOCK_MODE) {
      wx.cloud.callFunction({
        name: 'userOps',
        data: { action: 'recordShare', workId: this.data.workId }
      })
    }
    return {
      title: `我用AI创作了${this.data.styleName}纹样："${this.data.desc}"`,
      path: '/pages/index/index',
      imageUrl: this.data.shareImagePath || this.data.resultImage
    }
  }
})
