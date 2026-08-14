function callAIImage({ desc, stylePrompt, optimizedPrompt }) {
  return new Promise((resolve, reject) => {
    const finalPrompt = optimizedPrompt
      ? `${optimizedPrompt}, ${desc}`
      : `${stylePrompt}, ${desc}, tie-dye pattern, high quality, detailed`
    wx.cloud.callFunction({
      name: 'callAIImage',
      data: {
        desc,
        stylePrompt,
        optimizedPrompt,
        prompt: finalPrompt
      },
      success: (res) => {
        if (res.result && res.result.imageUrl) {
          resolve(res.result)
        } else {
          reject(new Error(res.result?.errorMsg || 'AI生成失败'))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '网络错误'))
      }
    })
  })
}

function callAIText({ message }) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'callAIText',
      data: { message },
      success: (res) => {
        if (res.result && res.result.reply) {
          resolve(res.result)
        } else {
          reject(new Error('AI文本处理失败'))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '网络错误'))
      }
    })
  })
}

function userOps(action, data) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'userOps',
      data: { action, ...data },
      success: (res) => resolve(res.result),
      fail: (err) => reject(err)
    })
  })
}

module.exports = {
  callAIImage,
  callAIText,
  userOps
}