---
name: "wechat-miniprogram-submit-review"
description: "Automates WeChat mini-program code upload and review submission via DevTools HTTP API and Public Platform browser automation. Invoke when user wants to upload code, submit for review, deploy mini-program, or navigate the WeChat Public Platform version management."
---

# WeChat Mini-Program Submit Review

Automates the full workflow from code upload to review submission for WeChat mini-programs, using the Developer Tools HTTP API and browser automation on the WeChat Public Platform.

## When to Invoke

- User asks to upload / submit / deploy a WeChat mini-program
- User wants to submit a mini-program for review (提交审核)
- User needs to navigate the WeChat Public Platform version management page
- User mentions "上传代码", "提交审核", "发布小程序", "version management"

## Workflow Overview

```
Step 1: Upload code via DevTools HTTP API
Step 2: Navigate to Public Platform version management
Step 3: Click "提交审核" and handle confirmation dialogs
Step 4: Fill review form (version description, privacy, etc.)
Step 5: Submit and verify "审核中" status
```

---

## Step 1: Upload Code via DevTools HTTP API

### Prerequisites
- WeChat Developer Tools must be running with **Settings > Security > Service Port** enabled
- The project must be open in DevTools

### Find the HTTP Port

The DevTools HTTP port is stored in the user's config file. Check these locations:

**Windows:**
```
%APPDATA%\微信web开发者工具\Default\.ide
```
The file contains a JSON object; look for the port number. Alternatively, scan common ports `9xxx` or `1xxxx` range by sending a GET request to `http://127.0.0.1:<port>/open`.

### Upload via HTTP API

```http
GET http://127.0.0.1:<port>/open?action=upload&projectpath=<URL_ENCODED_PROJECT_PATH>
```

- `projectpath` must be URL-encoded absolute path to the mini-program project root (the folder containing `project.config.json`)
- A successful response returns JSON with `encodingAESKey` or similar confirmation
- The uploaded version appears under **开发版本** in the version management page

### Alternative: CLI Upload

If the HTTP API is unavailable, use the DevTools CLI:

```bash
# Windows (adjust path as needed)
"C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat" upload --project <PROJECT_PATH> --v <VERSION> -d "<DESCRIPTION>"
```

---

## Step 2: Navigate to Public Platform Version Management

### Direct URL (Recommended)

Instead of clicking through the SPA navigation, use the direct URL:

```
https://mp.weixin.qq.com/wxamp/wacodepage/getcodepage?token=<TOKEN>&lang=zh_CN
```

- The `token` is session-specific; extract it from the current platform URL
- This bypasses the SPA routing issues and loads the version management page directly

### Verify the Uploaded Version

On the version management page, look for the **开发版本** section. The freshly uploaded version should show:
- Version number (e.g., `1.0.1`)
- Developer name
- Upload timestamp
- A **提交审核** button next to it

---

## Step 3: Click "提交审核" and Handle Dialogs

### Click the Submit Button

Use browser automation to click the **提交审核** button. This is typically a `<button>` or `<a>` element.

### Dialog Flow (3-stage)

The submission process involves up to 3 sequential confirmation dialogs:

**Dialog 1: Review Rules Confirmation**
- Text: "已阅读并了解平台审核规则"
- Action: Check the confirmation checkbox, then click **下一步** (Next)

**Dialog 2: Security Test Confirmation**
- Text: Mentions security testing / 安全测试
- Action: Click **继续提交** (Continue Submission)

**Dialog 3: Review Information Form** (see Step 4)
- This is the main form page, not a simple dialog

### Handling SPA Dialogs

The WeChat Public Platform is a Vue/React SPA. When automating:

1. Use `browser_snapshot` to get element refs after each dialog appears
2. Wait 1-2 seconds between actions for the SPA to render
3. If a button click doesn't trigger navigation, try `browser_evaluate` with `element.click()` as fallback
4. Some dialogs require scrolling to find the confirmation checkbox

---

## Step 4: Fill Review Information Form

### Form Fields

| Field | Required | Notes |
|-------|----------|-------|
| 版本描述 (Version Description) | Yes | **Max 200 characters**. Use concise bullet points. |
| 图片预览 (Image Preview) | No | Upload screenshots of the mini-program |
| 视频预览 (Video Preview) | No | Upload a demo video |
| 功能页面 (Function Pages) | Conditional | Required if the mini-program has multiple pages. Add page path + label for each key page |
| 测试账号 (Test Account) | No | Provide if login is required |
| 订单中心 path | No | Only for e-commerce mini-programs |
| 登录方式 (Login Method) | Auto-detected | Radio: "无需登录" or "需登录" |
| 隐私采集 (Privacy Collection) | Auto-detected | Radio: "采集用户隐私" or "未采集" |
| 特殊资质 (Special Qualifications) | Conditional | Required for AI/medical/finance categories |

### Version Description Best Practices

**CRITICAL: The version description field has a 200-character limit.** Exceeding this causes a red error border that persists even after content is truncated.

Template (within 200 chars):
```
1、<feature1>：<brief description>；2、<feature2>：<brief description>；3、<feature3>：<brief description>；4、<feature4>：<brief description>；5、<feature5>：<brief description>。<compliance note>
```

Example:
```
1、AI纹样生成：输入描述+选择风格，AI生成纹样图；2、产品效果预览：Canvas合成纹样到产品效果图；3、AR纹样预览：相机取景叠加纹样，支持拖动缩放、截图保存；4、作品集管理：云端保存作品，支持浏览删除；5、分享功能：一键分享微信好友。已接入AI生成水印及内容安全检测。
```

### Filling the Textarea (SPA Compatibility)

The version description textarea is a **controlled component**. Simply setting `.value` via JavaScript does NOT trigger the framework's validation. Use this approach:

```javascript
// Method 1: browser_type (preferred - triggers real input events)
await tools.browser_type({ ref: '<textarea_ref>', text: '<description>', clear: true });
await tools.browser_press_key({ key: 'Tab' }); // Trigger blur/validation

// Method 2: Native setter + event dispatch (fallback)
var setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
setter.call(textarea, value);
textarea.dispatchEvent(new Event('input', { bubbles: true }));
textarea.dispatchEvent(new Event('change', { bubbles: true }));
textarea.blur();
```

### Function Pages

If the form has a **功能页面** section, add entries for each key page:

| Page Path | Label | Description |
|-----------|-------|-------------|
| `pages/index/index` | 首页 / 主要功能 | Entry page with core features |
| `pages/result/result` | 结果展示 / 详情 | Results or detail page |
| `pages/ar/ar` | AR预览 / 相机 | Camera or AR feature page |
| `pages/my/my` | 我的 / 个人中心 | User profile or settings |
| `pages/works/works` | 作品详情 | Content detail page |

### Privacy Settings

If the mini-program uses any of the following, select **"采集用户隐私"** and click **"点击更新"** to configure:
- User avatar / nickname (`chooseAvatar`, `getNickname`)
- Camera access (`scope.camera`)
- Photo album save (`saveImageToPhotosAlbum`)
- Location, contacts, or other personal info

---

## Step 5: Submit and Verify

### Click Final Submit

After all required fields are filled and red error borders are gone, click the **提交审核** button at the bottom of the form.

### Verify Success

A success dialog appears with text "已提交审核". After clicking **确定**, the page redirects to version management.

Verify the **审核版本** section shows:
- Version number (e.g., `1.0.1`)
- Status: **审核中** (Under Review)
- Submit timestamp
- "预计在1-7天内完成审核"

### Post-Approval

After review is approved (typically 1-2 business days), return to version management and click **发布** (Publish) to make the mini-program live.

---

## Troubleshooting

### HTTP API 404
- The correct endpoint is `/open` with query parameters, NOT `/upload`
- Ensure DevTools is running and the service port is enabled
- The port may change between sessions; re-read the config file

### Version Description Red Border Persists
- This means the controlled component didn't register the input
- Use `browser_type` with `clear: true` instead of JavaScript value setting
- After typing, press `Tab` to trigger blur validation
- Ensure the text is within 200 characters

### SPA Navigation Issues
- Use direct URLs instead of clicking through navigation
- Extract the session token from the current URL
- Wait 1-2 seconds between actions for rendering
- Use `browser_snapshot` after each step to verify state

### Submit Button Not Working
- Ensure all required fields are filled without errors
- Scroll the form to verify no hidden required fields are missed
- Try `browser_evaluate` with `element.click()` as fallback

---

## Key Lessons

1. **Direct URLs > SPA Navigation**: The WeChat Public Platform SPA is difficult to navigate by clicking. Always use direct URLs with the session token.
2. **Controlled Components Need Real Events**: For Vue/React textareas, use `browser_type` not JavaScript value assignment, and trigger blur with `Tab`.
3. **200-Char Limit is Hard**: The version description has a strict 200-character limit. Prepare concise text in advance.
4. **Multi-Dialog Flow**: The submit process has 3+ sequential dialogs. Handle each one individually with snapshots between steps.
5. **HTTP API Port is Dynamic**: The DevTools service port changes between sessions. Always re-read the config file.
