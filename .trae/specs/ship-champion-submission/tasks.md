# Tasks

## 阶段 A：产品完整度（8/7 - 8/20）

- [ ] Task 1: 准备产品效果图模板素材
  - [ ] SubTask 1.1: 设计/获取 4 张产品 PNG 模板（手机壳、帆布袋、丝巾、靠垫），每张带透明纹样区域
  - [ ] SubTask 1.2: 将模板上传到云存储 `templates/products/` 目录
  - [x] SubTask 1.3: 在 styles.js 或新配置文件中记录模板 fileID（canvas.js 已支持 productTemplate 参数，传入即用）

- [x] Task 2: 改造 canvas 合成逻辑支持真实模板
  - [x] SubTask 2.1: 修改 `composeProductPreview`，加载产品 PNG 模板到 canvas
  - [x] SubTask 2.2: 将纹样图合成到模板透明区域（按区域裁剪+变形）
  - [x] SubTask 2.3: 保留原纯色占位作为模板加载失败时的降级（增强绘制：产品形状轮廓+阴影+装饰）
  - [ ] SubTask 2.4: 在开发者工具中验证 4 种产品合成效果（需真机/开发者工具验证）

- [ ] Task 3: 准备风格卡片真实代表图
  - [ ] SubTask 3.1: 用现有 AI 链路为 6 个风格各生成 1 张高质量代表纹样图
  - [ ] SubTask 3.2: 将代表图上传到云存储 `templates/styles/` 目录
  - [x] SubTask 3.3: 在 styles.js 中为每个模板添加 `previewImage` 字段（已添加，值为空待填 fileID）

- [x] Task 4: 改造首页风格卡片展示真实图
  - [x] SubTask 4.1: 修改 index.wxml，卡片背景从 gradient 改为 image 组件加载 `previewImage`
  - [x] SubTask 4.2: gradient 作为图片加载前的占位
  - [ ] SubTask 4.3: 验证 6 个卡片加载与选中态切换（需上传代表图后真机验证）

- [x] Task 5: Prompt 工程调优
  - [x] SubTask 5.1: 为 6 个风格各自调一版完整 prompt（风格+色调+细节+质量修饰词）
  - [x] SubTask 5.2: 在 styles.js 中新增 `optimizedPrompt` 字段
  - [x] SubTask 5.3: 修改 api.js 优先使用 optimizedPrompt（result.js 已贯通传参）
  - [ ] SubTask 5.4: 每风格测 3 次验证生成稳定性（需部署云函数后真机测试）

## 阶段 B：创新性加分（8/21 - 8/31）

- [x] Task 6: AR 纹样预览功能
  - [x] SubTask 6.1: 新建 `pages/ar/ar` 页面（js/wxml/wxss/json）
  - [x] SubTask 6.2: 使用 `<camera>` 组件实现相机取景
  - [x] SubTask 6.3: 将纹样图作为半透明 overlay 叠加到取景画面
  - [x] SubTask 6.4: 支持手势拖动调整纹样位置与大小
  - [x] SubTask 6.5: 实现截图保存功能（`wx.canvasToTempFilePath` + 相册保存）
  - [x] SubTask 6.6: 在 result 页添加"AR 预览"入口按钮，传参跳转
  - [x] SubTask 6.7: app.json 注册新页面路由

## 阶段 C：资质合规闭环（8/7 - 9/10，与开发并行）

- [ ] Task 7: 算法备案材料准备
  - [ ] SubTask 7.1: 在微信服务市场查找腾讯混元的深度合成服务商凭证
  - [ ] SubTask 7.2: 获取腾讯算法备案证明文件
  - [ ] SubTask 7.3: 确认算法备案主体、签约主体、小程序主体三者一致
  - [ ] SubTask 7.4: 整理算法备案材料包（备案证明+合作协议+主体凭证）

- [ ] Task 8: 深度合成类目申请
  - [ ] SubTask 8.1: ICP 备案通过后，在小程序后台申请"深度合成"类目
  - [ ] SubTask 8.2: 提交算法备案材料
  - [ ] SubTask 8.3: 跟踪审核进度，被拒则按反馈修改重提

## 阶段 D：测试与上线（9/11 - 9/30）

- [ ] Task 9: 全流程功能测试
  - [ ] SubTask 9.1: 测试主链路：输入→生成→预览→保存→分享
  - [ ] SubTask 9.2: 测试边界：网络异常、AI 超时、存储失败、内容安全拦截
  - [ ] SubTask 9.3: 测试作品集：列表加载、删除、复看
  - [ ] SubTask 9.4: 测试 AR 预览：相机权限、叠加、截图
  - [ ] SubTask 9.5: 修复测试发现的所有 P0/P1 Bug

- [ ] Task 10: 性能优化
  - [ ] SubTask 10.1: 云函数冷启动优化（精简依赖、预热）
  - [ ] SubTask 10.2: 图片加载优化（缩略图、懒加载）
  - [ ] SubTask 10.3: 分享图生成优化

- [ ] Task 11: 提交审核与上线
  - [ ] SubTask 11.1: 提交小程序审核（含深度合成类目）
  - [ ] SubTask 11.2: 审核问题修复（如被拒）
  - [ ] SubTask 11.3: 正式上线发布
  - [ ] SubTask 11.4: 线上稳定性验证（3 天连续运行）

## 阶段 E：用户增长与参赛材料（10/1 - 10/17）

- [ ] Task 12: 种子用户获取
  - [ ] SubTask 12.1: 联系设计院校社群（东华大学、中国美院等）推广
  - [ ] SubTask 12.2: 非遗文化社群分享
  - [ ] SubTask 12.3: 小红书/视频号发布"AI 设计扎染纹样"教程内容
  - [ ] SubTask 12.4: 金茶花参赛项目互相引流

- [ ] Task 13: 数据监控与收集
  - [ ] SubTask 13.1: 接入微信"We分析"工具
  - [ ] SubTask 13.2: 监控 DAU/MAU、分享转化率、生成完成率、留存率
  - [ ] SubTask 13.3: 收集用户评价截图

- [ ] Task 14: 参赛材料制作
  - [ ] SubTask 14.1: 撰写 PDF 介绍文档（功能简介/应用场景/技术方案/创新点）
  - [ ] SubTask 14.2: 制作技术架构图与产品流程图
  - [ ] SubTask 14.3: 下载并填写参赛授权书
  - [ ] SubTask 14.4: 准备小程序 AppID 与二维码

- [ ] Task 15: 最终提交
  - [ ] SubTask 15.1: 大赛官网 PC 端提交全部材料
  - [ ] SubTask 15.2: 确认提交状态成功
  - [ ] SubTask 15.3: 准备赛区决赛路演 PPT（如晋级）

# Task Dependencies
- Task 2 依赖 Task 1（需要模板素材才能改造合成逻辑）
- Task 4 依赖 Task 3（需要代表图才能改造卡片）
- Task 6（AR）独立，可与 Task 1-5 并行
- Task 8 依赖 Task 7（需要算法备案材料才能申请类目）
- Task 8 依赖 ICP 备案通过（外部阻塞项）
- Task 11 依赖 Task 8（类目通过才能审核上线）
- Task 12-15 依赖 Task 11（上线后才能积累数据、提交材料）
- Task 9-10 可在 Task 1-6 完成后启动
- Task 7 应最早启动，与所有开发任务并行
