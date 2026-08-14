Page({
  data: {
    pattern: '',            // 纹样图路径
    cameraAuthorized: true, // 相机已授权
    permissionDenied: false,// 相机权限被拒
    patternLeft: 0,         // 纹样左上角 X（px）
    patternTop: 0,          // 纹样左上角 Y（px）
    patternSize: 0,         // 纹样边长（px，方形）
    patternOpacity: 0.8,    // 纹样透明度
    capturing: false,       // 截图合成中
    screenWidth: 0,
    screenHeight: 0,
    statusBarHeight: 0
  },

  // 非 data 的实例字段
  cameraAreaWidth: 0,
  cameraAreaHeight: 0,
  touchState: {
    mode: '',            // 'move' | 'pinch'
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0,
    startDistance: 0,
    startSize: 0
  },

  onLoad(options) {
    const pattern = decodeURIComponent(options.pattern || '')
    const sys = wx.getSystemInfoSync()
    const screenWidth = sys.windowWidth
    const screenHeight = sys.windowHeight
    const statusBarHeight = sys.statusBarHeight || 20
    const patternSize = Math.floor(screenWidth * 0.7)
    this.setData({
      pattern,
      screenWidth,
      screenHeight,
      statusBarHeight,
      patternSize,
      patternLeft: (screenWidth - patternSize) / 2,
      patternTop: (screenHeight - patternSize) / 2
    })
    this.checkCameraAuth()
  },

  onReady() {
    // 取景区实际尺寸，用于精确居中与截图坐标映射
    const query = wx.createSelectorQuery()
    query.select('#cameraArea').boundingClientRect((rect) => {
      if (rect) {
        this.cameraAreaWidth = rect.width
        this.cameraAreaHeight = rect.height
        const size = this.data.patternSize
        this.setData({
          patternLeft: (rect.width - size) / 2,
          patternTop: (rect.height - size) / 2
        })
      }
    }).exec()
  },

  onShow() {
    // 从设置页返回时重新校验权限
    this.checkCameraAuth()
  },

  // ===== 相机权限处理 =====
  checkCameraAuth() {
    wx.getSetting({
      success: (res) => {
        const scope = res.authSetting['scope.camera']
        if (scope === false) {
          this.setData({ permissionDenied: true, cameraAuthorized: false })
        } else {
          // true 或未询问过都允许挂载 camera，由组件自身触发授权弹窗
          this.setData({ permissionDenied: false, cameraAuthorized: true })
        }
      }
    })
  },

  onCameraError() {
    this.setData({ permissionDenied: true, cameraAuthorized: false })
  },

  onGoToSetting() {
    wx.openSetting({
      success: (res) => {
        if (res.authSetting && res.authSetting['scope.camera']) {
          this.setData({ permissionDenied: false, cameraAuthorized: true })
        }
      }
    })
  },

  // ===== 单指拖动 / 双指缩放 =====
  onTouchStart(e) {
    const touches = e.touches
    if (touches.length === 1) {
      this.touchState.mode = 'move'
      this.touchState.startX = touches[0].clientX
      this.touchState.startY = touches[0].clientY
      this.touchState.startLeft = this.data.patternLeft
      this.touchState.startTop = this.data.patternTop
    } else if (touches.length === 2) {
      this.touchState.mode = 'pinch'
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      this.touchState.startDistance = Math.sqrt(dx * dx + dy * dy)
      this.touchState.startSize = this.data.patternSize
    }
  },

  onTouchMove(e) {
    const touches = e.touches
    if (this.touchState.mode === 'move' && touches.length === 1) {
      const dx = touches[0].clientX - this.touchState.startX
      const dy = touches[0].clientY - this.touchState.startY
      this.setData({
        patternLeft: this.touchState.startLeft + dx,
        patternTop: this.touchState.startTop + dy
      })
    } else if (this.touchState.mode === 'pinch' && touches.length === 2) {
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (this.touchState.startDistance > 0) {
        const scale = distance / this.touchState.startDistance
        let newSize = this.touchState.startSize * scale
        const maxSize = this.data.screenWidth * 1.5
        const minSize = 80
        newSize = Math.max(minSize, Math.min(maxSize, newSize))
        // 以纹样中心为锚缩放，避免位置跳变
        const centerX = this.touchState.startLeft + this.touchState.startSize / 2
        const centerY = this.touchState.startTop + this.touchState.startSize / 2
        this.setData({
          patternSize: newSize,
          patternLeft: centerX - newSize / 2,
          patternTop: centerY - newSize / 2
        })
      }
    }
  },

  onTouchEnd() {
    this.touchState.mode = ''
  },

  // ===== 透明度滑块 =====
  onOpacityChange(e) {
    this.setData({ patternOpacity: e.detail.value / 100 })
  },

  // ===== 截图保存：takePhoto + canvas 叠加 + 保存相册 =====
  onCapture() {
    if (this.data.capturing) return
    this.setData({ capturing: true })
    const cameraCtx = wx.createCameraContext()
    cameraCtx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.composeAndSave(res.tempImagePath)
      },
      fail: (err) => {
        this.setData({ capturing: false })
        wx.showToast({ title: '拍照失败', icon: 'none' })
        console.error('takePhoto fail', err)
      }
    })
  },

  composeAndSave(photoPath) {
    const query = wx.createSelectorQuery()
    query.select('#composeCanvas')
      .fields({ node: true })
      .exec((res) => {
        if (!res[0] || !res[0].node) {
          this.setData({ capturing: false })
          wx.showToast({ title: '画布初始化失败', icon: 'none' })
          return
        }
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const photoImg = canvas.createImage()
        const patternImg = canvas.createImage()
        let loaded = 0
        let failed = false
        const tryDraw = () => {
          loaded++
          if (loaded < 2) return
          const photoW = photoImg.width
          const photoH = photoImg.height
          canvas.width = photoW
          canvas.height = photoH
          // 1. 绘制相机底图
          ctx.drawImage(photoImg, 0, 0, photoW, photoH)
          // 2. 屏幕坐标 -> 照片坐标（按宽度等比缩放）
          const areaW = this.cameraAreaWidth || this.data.screenWidth
          const scale = photoW / areaW
          const px = this.data.patternLeft * scale
          const py = this.data.patternTop * scale
          const ps = this.data.patternSize * scale
          // 3. 叠加纹样（半透明）
          ctx.globalAlpha = this.data.patternOpacity
          ctx.drawImage(patternImg, px, py, ps, ps)
          ctx.globalAlpha = 1
          // 4. 导出临时文件
          wx.canvasToTempFilePath({
            canvas,
            success: (out) => {
              this.saveToAlbum(out.tempFilePath)
            },
            fail: () => {
              this.setData({ capturing: false })
              wx.showToast({ title: '合成失败', icon: 'none' })
            }
          }, this)
        }
        photoImg.onload = tryDraw
        photoImg.onerror = () => {
          if (failed) return
          failed = true
          this.setData({ capturing: false })
          wx.showToast({ title: '照片加载失败', icon: 'none' })
        }
        patternImg.onload = tryDraw
        patternImg.onerror = () => {
          if (failed) return
          failed = true
          this.setData({ capturing: false })
          wx.showToast({ title: '纹样加载失败', icon: 'none' })
        }
        photoImg.src = photoPath
        patternImg.src = this.data.pattern
      })
  },

  saveToAlbum(filePath) {
    wx.saveImageToPhotosAlbum({
      filePath,
      success: () => {
        this.setData({ capturing: false })
        wx.showToast({ title: '已保存到相册', icon: 'success' })
      },
      fail: (err) => {
        this.setData({ capturing: false })
        if (err.errMsg && err.errMsg.indexOf('auth deny') !== -1) {
          wx.showModal({
            title: '提示',
            content: '需要相册权限才能保存图片',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) wx.openSetting()
            }
          })
        } else {
          wx.showToast({ title: '保存失败', icon: 'none' })
        }
      }
    })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
