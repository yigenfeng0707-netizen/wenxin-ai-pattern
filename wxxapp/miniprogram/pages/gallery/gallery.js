Page({
  data: {
    works: [],
    loading: true
  },

  onLoad() {
    this.loadWorks()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
  },

  onPullDownRefresh() {
    this.loadWorks()
  },

  loadWorks() {
    this.setData({ loading: true })
    wx.cloud.callFunction({
      name: 'userOps',
      data: { action: 'list' },
      success: (res) => {
        const works = (res.result.data || []).map(work => ({
          ...work,
          timeText: this.formatTime(work.createTime)
        }))
        this.setData({ works, loading: false })
      },
      fail: () => {
        this.setData({ works: [], loading: false })
        wx.showToast({ title: '加载失败', icon: 'none' })
      },
      complete: () => {
        wx.stopPullDownRefresh()
      }
    })
  },

  formatTime(timestamp) {
    const now = Date.now()
    const diff = now - timestamp
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
    const date = new Date(timestamp)
    return `${date.getMonth() + 1}/${date.getDate()}`
  },

  onWorkTap(e) {
    const id = e.currentTarget.dataset.id
    const work = this.data.works.find(w => w._id === id)
    if (work) {
      const params = {
        desc: work.desc,
        styleId: work.styleId,
        styleName: work.styleName,
        stylePrompt: ''
      }
      wx.navigateTo({
        url: `/pages/result/result?data=${encodeURIComponent(JSON.stringify(params))}`
      })
    }
  },

  onWorkLongPress(e) {
    const id = e.currentTarget.dataset.id
    const index = e.currentTarget.dataset.index
    wx.showActionSheet({
      itemList: ['删除作品'],
      itemColor: '#A0522D',
      success: (res) => {
        if (res.tapIndex === 0) {
          this.deleteWork(id, index)
        }
      }
    })
  },

  deleteWork(id, index) {
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定删除这件作品吗？',
      confirmColor: '#A0522D',
      success: (res) => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'userOps',
            data: { action: 'delete', workId: id },
            success: () => {
              const works = this.data.works
              works.splice(index, 1)
              this.setData({ works })
              wx.showToast({ title: '已删除', icon: 'success' })
            },
            fail: () => {
              wx.showToast({ title: '删除失败', icon: 'none' })
            }
          })
        }
      }
    })
  },

  goCreate() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})