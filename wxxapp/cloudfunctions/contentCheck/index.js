const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { text, mediaType, mediaUrl } = event

  try {
    if (text) {
      const res = await cloud.openapi.security.msgSecCheck({
        content: text
      })
      return { safe: res.errCode === 0, msg: 'success' }
    }

    if (mediaUrl && mediaType === 'image') {
      const res = await cloud.openapi.security.imgSecCheck({
        media: { contentType: 'image/png', value: mediaUrl }
      })
      return { safe: res.errCode === 0, msg: 'success' }
    }

    return { safe: true, msg: 'no content to check' }
  } catch (err) {
    console.error('contentCheck error:', err)
    return { safe: false, errorMsg: err.message }
  }
}