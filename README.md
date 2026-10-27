# 纹心 · AI 非遗纹样

2026 微信小程序开发大赛参赛作品。

用户输入主题与风格偏好，AI 生成非遗纹样，支持作品集管理与 AR 预览叠加到真实物体表面。

## 目录

| 路径 | 内容 |
|---|---|
| `wxxapp/miniprogram/` | 小程序主体：`pages/index`（创作）、`pages/result`（结果）、`pages/gallery`（作品集）、`pages/mine`（我的）、`pages/ar`（AR 预览） |
| `wxxapp/cloudfunctions/` | 微信云开发云函数：`callAIImage`、`callAIText`、`contentCheck`（内容安全）、`userOps` |
| 根目录文档 | `赛事规程.md`、`参赛方案.md`、`2026微信小程序开发技术选型调研报告.md`、`华为码道Agent全链路开发实践方法论.md` |
| `.trae/` | 开发过程规范：小程序 AI 合规、提审流程、夺冠交付清单 |

## 运行

用微信开发者工具导入 `wxxapp/`，开通云开发后部署四个云函数，并在云函数环境变量中配置模型密钥。
