Page({
  data: {
    userInfo: {},
    editingNick: false,
    stats: {
      workCount: 0,
      shareCount: 0,
      likeCount: 0
    }
  },

  onLoad() {
    const saved = wx.getStorageSync('userInfo')
    if (saved) {
      this.setData({ userInfo: saved })
    }
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
    this.loadStats()
  },

  onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl
    const userInfo = { ...this.data.userInfo, avatarUrl }
    this.setData({ userInfo })
    wx.setStorageSync('userInfo', userInfo)
  },

  onEditNick() {
    this.setData({ editingNick: true })
  },

  onNickNameBlur(e) {
    const nickName = (e.detail.value || '').trim()
    const userInfo = { ...this.data.userInfo, nickName: nickName || this.data.userInfo.nickName }
    this.setData({ userInfo, editingNick: false })
    wx.setStorageSync('userInfo', userInfo)
  },

  loadStats() {
    wx.cloud.callFunction({
      name: 'userOps',
      data: { action: 'stats' },
      success: (res) => {
        if (res.result) {
          this.setData({ stats: res.result })
        }
      }
    })
  },

  onMenuTap(e) {
    const action = e.currentTarget.dataset.action
    const content = {
      about: '纹心·AI非遗纹样创作\n\n用自然语言描述意境，AI实时生成非遗扎染风格纹样，让每个人都能成为非遗共创者。\n\n基于白族扎染非遗技艺，结合AI文生图能力，传承与创新并举。',
      guide: '使用指南\n\n1. 选择喜欢的纹样风格\n2. 输入意境描述文字\n3. 点击"开始AI创作"\n4. 预览生成效果\n5. 保存到作品集或分享给好友',
      heritage: '白族扎染\n\n白族扎染是国家级非物质文化遗产，以靛蓝为主色调，通过缝扎、浸染等工艺形成独特纹样。冰裂纹、蝴蝶纹、梅花纹等经典纹样承载着白族人民的审美智慧。',
      agreement: '用户协议与AI说明\n\n1. 本小程序所有纹样均由AI辅助创作\n2. AI生成内容已标注"AI生成"标识\n3. 用户创作作品归用户所有\n4. 请勿使用AI生成违规内容\n5. 使用即代表同意以上条款'
    }

    if (action === 'feedback') {
      this.openFeedback()
      return
    }

    if (action === 'clearCache') {
      this.clearCache()
      return
    }

    wx.showModal({
      title: '',
      content: content[action] || '',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  openFeedback() {
    if (wx.canIUse('createFeedbackButton')) {
      const btn = wx.createFeedbackButton({
        type: 'text',
        text: '意见反馈',
        style: {
          left: 0,
          top: 0,
          width: 0,
          height: 0
        }
      })
      btn.tap()
      btn.destroy()
    } else {
      wx.showToast({ title: '请通过小程序客服反馈', icon: 'none' })
    }
  },

  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除本地缓存吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorage({
            success: () => {
              wx.showToast({ title: '缓存已清除', icon: 'success' })
            }
          })
        }
      }
    })
  }
})