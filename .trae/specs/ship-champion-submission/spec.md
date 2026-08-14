# 冠军品质参赛交付 Spec

## Why
当前项目 AI 核心链路已打通（混元文生图 + 内容安全 + 水印 + 压缩），但距离"冠军品质"仍有明显差距：产品预览仍是纯色矩形占位、风格卡片用 CSS gradient 而非真实纹样、Prompt 工程未调优、AR 加分功能未做、资质合规未闭环、参赛材料与用户数据未启动。距提报截止（2026-10-17）约 10 周，需系统性收口所有评审维度，确保四维（实用性/创新性/体验感/完整度）全覆盖。

## What Changes
- **UI 真实化**：产品效果图模板（手机壳/帆布袋/丝巾/靠垫 4 张 PNG 带透明区域）替换 canvas 纯色占位；风格卡片用真实纹样代表图替换 CSS gradient
- **Prompt 工程调优**：6 个风格模板各自调一版高质量 prompt，固定参数确保生成质量稳定
- **AR 纹样预览**（创新性加分）：相机实时叠加纹样到现实物体
- **资质合规闭环**：深度合成类目申请 + 算法备案材料准备（与 ICP 备案并行）
- **测试与上线**：全流程测试、性能优化、审核提交、正式发布
- **参赛材料**：PDF 介绍文档（功能/场景/技术方案/创新点）+ 授权书 + 用户数据收集
- **用户增长**：种子用户获取、社群推广、内容传播、分享裂变优化

## Impact
- Affected code: `miniprogram/utils/canvas.js`（合成逻辑）、`miniprogram/config/styles.js`（prompt 与卡片图）、`miniprogram/pages/result/`（AR 入口）、新增 AR 页面、新增素材目录
- Affected assets: 新增 `miniprogram/images/products/`（4 张产品模板）、`miniprogram/images/styles/`（6 张风格代表图）
- 业务流程: 新增 AR 预览链路、合规材料准备流程、用户增长运营流程

## ADDED Requirements

### Requirement: 真实产品效果图模板
系统 SHALL 在效果预览环节使用真实产品 PNG 模板（带透明纹样区域），通过 Canvas 图层叠加将生成纹样合成到模板上，呈现真实实物效果。

#### Scenario: 用户切换产品类型
- **WHEN** 用户在 result 页点击"帆布袋"
- **THEN** canvas 加载帆布袋 PNG 模板，将当前纹样合成到模板的纹样区域，显示真实帆布袋效果图

### Requirement: 风格卡片真实预览
系统 SHALL 在首页风格选择区展示每个风格的真实纹样代表图（而非 CSS gradient），让用户直观判断风格特征。

#### Scenario: 用户浏览风格选择
- **WHEN** 用户进入首页
- **THEN** 6 个风格卡片各显示一张真实扎染纹样代表图，点击可选中

### Requirement: Prompt 工程调优
系统 SHALL 为每个风格模板配置经过调优的高质量 prompt，包含风格关键词、色调、细节描述、质量修饰词，确保生成结果稳定且高质量。

#### Scenario: 相同输入多次生成
- **WHEN** 用户用相同描述和风格生成 3 次
- **THEN** 3 次结果风格一致、色调统一、质量稳定（无崩坏图）

### Requirement: AR 纹样预览
系统 SHALL 提供相机实时预览功能，将用户生成的纹样通过 AR 叠加到现实物体表面，用户可截图保存。

#### Scenario: 用户使用 AR 预览
- **WHEN** 用户在 result 页点击"AR 预览"
- **THEN** 调起相机，纹样以半透明叠加层显示在取景画面上，用户可调整位置后截图保存

### Requirement: 参赛材料完整性
系统 SHALL 在提报期结束前完成所有参赛材料：PDF 介绍文档、参赛授权书、小程序信息、用户数据。

#### Scenario: 最终提交
- **WHEN** 10/17 提报截止前
- **THEN** 大赛官网已提交：小程序 AppID + 二维码 + PDF 介绍文档 + 授权书 + 用户数据截图

### Requirement: 用户增长达标
系统 SHALL 在上线后 2 周内达成 DAU 100+、MAU 500+，并通过分享裂变持续增长。

#### Scenario: 上线后数据积累
- **WHEN** 小程序正式上线运行 2 周
- **THEN** We分析后台显示 DAU ≥ 100、MAU ≥ 500、分享转化率可追踪

## MODIFIED Requirements

### Requirement: 效果预览合成
原 canvas.js 的 `composeProductPreview` 使用纯色矩形+文字标签占位。修改为：加载真实产品 PNG 模板 → 识别模板透明区域 → 将纹样合成到透明区域 → 输出真实实物效果图。保留原 mock 降级路径。

### Requirement: 风格模板配置
原 styles.js 每个模板只有 `gradient`（CSS）和 `prompt`（基础）。修改为：新增 `previewImage`（云存储真实代表图 fileID）和 `optimizedPrompt`（调优后的完整 prompt），`gradient` 作为加载占位保留。

## REMOVED Requirements
无（所有现有功能保留，不删除）
