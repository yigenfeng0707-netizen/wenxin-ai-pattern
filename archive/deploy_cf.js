const ci = require('miniprogram-ci')

const project = new ci.Project({
  appid: 'wxbe594cd743cc6fec',
  type: 'miniProgram',
  projectPath: 'D:/Apps/fyg/微信小程序开发大赛/wxxapp',
  privateKeyPath: 'C:/Users/18969/Downloads/private.wxbe594cd743cc6fec.key',
  ignores: ['node_modules/**/*'],
})

const ENV = 'cloud1-d4gw4p33b2977198c'
const functions = ['callAIImage', 'callAIText', 'contentCheck', 'userOps']

async function deployAll() {
  for (const name of functions) {
    try {
      console.log(`部署 ${name} ...`)
      const result = await ci.cloud.deployFunction({
        project,
        env: ENV,
        name,
        force: true,
        remoteNpmInstall: true,
      })
      console.log(`✅ ${name} 部署成功`, result)
    } catch (err) {
      console.error(`❌ ${name} 部署失败:`, err.message || err)
    }
  }
  console.log('全部云函数部署完成')
}

deployAll().catch(console.error)