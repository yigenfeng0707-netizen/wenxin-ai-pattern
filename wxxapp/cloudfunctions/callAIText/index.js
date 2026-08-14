const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { message } = event

  try {
    const model = cloud.extend.AI.createModel("cloudbase")
    const res = await model.generateText({
      messages: [{ role: 'user', content: message }],
      temperature: 0.7,
      maxTokens: 200
    })

    return {
      reply: res.data || res.text || '',
      msg: 'success'
    }
  } catch (err) {
    console.error('callAIText error:', err)
    return { errorMsg: err.message || 'AI文本处理失败' }
  }
}