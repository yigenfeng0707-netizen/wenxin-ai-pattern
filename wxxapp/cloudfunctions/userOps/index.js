const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { action } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    switch (action) {
      case 'save':
        return await saveWork(event.work, openid)
      case 'list':
        return await listWorks(openid)
      case 'delete':
        return await deleteWork(event.workId, openid)
      case 'stats':
        return await getStats(openid)
      case 'recordShare':
        return await recordShare(event.workId, openid)
      case 'like':
        return await likeWork(event.workId, openid)
      default:
        return { errorMsg: '未知操作' }
    }
  } catch (err) {
    console.error('userOps error:', err)
    return { errorMsg: err.message }
  }
}

async function saveWork(work, openid) {
  const res = await db.collection('works').add({
    data: {
      ...work,
      _openid: openid,
      likeCount: 0,
      createTime: Date.now()
    }
  })
  return { id: res._id, msg: 'success' }
}

async function listWorks(openid) {
  const res = await db.collection('works')
    .where({ _openid: openid })
    .orderBy('createTime', 'desc')
    .limit(50)
    .get()
  return { data: res.data, msg: 'success' }
}

async function deleteWork(workId, openid) {
  await db.collection('works')
    .where({ _id: workId, _openid: openid })
    .remove()
  await db.collection('likes')
    .where({ workId })
    .remove()
  return { msg: 'success' }
}

async function getStats(openid) {
  const workRes = await db.collection('works')
    .where({ _openid: openid })
    .count()

  const shareRes = await db.collection('shares')
    .where({ _openid: openid })
    .count()

  const likeRes = await db.collection('likes')
    .where({ toOpenid: openid })
    .count()

  return {
    workCount: workRes.total,
    shareCount: shareRes.total,
    likeCount: likeRes.total
  }
}

async function recordShare(workId, openid) {
  await db.collection('shares').add({
    data: {
      workId,
      _openid: openid,
      createTime: Date.now()
    }
  })
  return { msg: 'success' }
}

async function likeWork(workId, openid) {
  const exist = await db.collection('likes')
    .where({ workId, fromOpenid: openid })
    .count()

  if (exist.total > 0) {
    await db.collection('likes')
      .where({ workId, fromOpenid: openid })
      .remove()
    await db.collection('works').doc(workId).update({
      data: { likeCount: _.inc(-1) }
    })
    return { liked: false, msg: 'unliked' }
  }

  const work = await db.collection('works').doc(workId).get()
  const toOpenid = work.data._openid

  await db.collection('likes').add({
    data: {
      workId,
      fromOpenid: openid,
      toOpenid,
      createTime: Date.now()
    }
  })
  await db.collection('works').doc(workId).update({
    data: { likeCount: _.inc(1) }
  })
  return { liked: true, msg: 'liked' }
}