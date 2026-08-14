const { styleTemplates } = require('../../config/styles.js')

Page({
  data: {
    styleTemplates: [],
    currentStyleId: 1,
    descValue: '',
    quickTags: ['山间晨雾', '溪水潺潺', '古道夕阳', '繁花似锦', '月落星河', '风过竹林'],
    canGenerate: false,
    generating: false
  },

  onLoad() {
    this.setData({ styleTemplates })
  },

  onSelectStyle(e) {
    const id = e.currentTarget.dataset.id
    this.setData({ currentStyleId: id })
    this.updateCanGenerate()
  },

  onDescInput(e) {
    this.setData({ descValue: e.detail.value })
    this.updateCanGenerate()
  },

  onQuickTag(e) {
    const tag = e.currentTarget.dataset.tag
    const current = this.data.descValue
    const newVal = current ? `${current}，${tag}` : tag
    this.setData({ descValue: newVal })
    this.updateCanGenerate()
  },

  updateCanGenerate() {
    const canGenerate = this.data.descValue.trim().length > 0
    this.setData({ canGenerate })
  },

  onGenerate() {
    if (!this.data.canGenerate || this.data.generating) return

    const style = this.data.styleTemplates.find(s => s.id === this.data.currentStyleId)
    const params = {
      desc: this.data.descValue,
      styleId: this.data.currentStyleId,
      styleName: style.name,
      stylePrompt: style.prompt,
      optimizedPrompt: style.optimizedPrompt
    }

    this.setData({ generating: true })
    wx.navigateTo({
      url: `/pages/result/result?data=${encodeURIComponent(JSON.stringify(params))}`,
      complete: () => {
        this.setData({ generating: false })
      }
    })
  }
})