---
name: "wechat-miniprogram-ai-compliance"
description: "Prepares AI-powered WeChat mini-programs for review compliance: AI content watermarking, content security checks, privacy permissions, and pre-review checklist. Invoke when building AI mini-programs, preparing for review, or needing content moderation integration."
---

# WeChat Mini-Program AI Compliance

Ensures AI-powered WeChat mini-programs meet platform review requirements for AI-generated content labeling, content security moderation, and privacy permissions.

## When to Invoke

- User is building a mini-program that uses AI (text-to-image, text generation, deep synthesis, etc.)
- User is preparing an AI mini-program for WeChat review submission
- User needs to implement content security checks (msgSecCheck / imgSecCheck)
- User needs to configure privacy permissions for camera, album, or user info
- User mentions "AI合规", "内容安全", "深度合成", "审核被拒", "AI生成标识"

---

## 1. AI-Generated Content Labeling (Required)

WeChat requires all AI-generated content to be clearly labeled. Failure to label results in review rejection.

### Image Watermark (for AI-generated images)

Add a semi-transparent "AI生成" watermark to the bottom-right corner of every AI-generated image using Canvas:

```javascript
// utils/canvas.js
function addAIWatermark(ctx, canvasWidth, canvasHeight) {
  const text = 'AI生成'
  ctx.save()
  ctx.globalAlpha = 0.4
  ctx.fillStyle = '#ffffff'
  ctx.font = '12px sans-serif'
  const textWidth = ctx.measureText(text).width
  const padding = 6
  const x = canvasWidth - textWidth - padding * 2 - 4
  const y = canvasHeight - 24
  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.fillRect(x, y, textWidth + padding * 2, 20)
  // Text
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
  ctx.fillText(text, x + padding, y + 14)
  ctx.restore()
}
```

### Page-Level AI Labels

Add visible "AI辅助创作" labels on all pages that display or interact with AI-generated content:

```xml
<!-- Result page header -->
<view class="ai-label">
  <text class="ai-label-icon">🤖</text>
  <text class="ai-label-text">AI辅助创作</text>
</view>
```

```css
.ai-label {
  display: inline-flex;
  align-items: center;
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}
```

### Declaration on Key Pages

Place an AI content declaration on the **home page**, **result page**, and **profile/my page**:

```xml
<view class="ai-declaration">
  <text>本小程序使用AI技术辅助创作，生成内容仅供参考。所有AI生成图片均已标注"AI生成"标识。</text>
</view>
```

---

## 2. Content Security Checks (Required)

WeChat requires `msgSecCheck` and `imgSecCheck` for any mini-program with user-generated content or AI-generated content.

### Text Content Security (msgSecCheck)

Check user text input **before** sending to AI model:

```javascript
// cloudfunctions/callAIImage/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

async function checkTextSecurity(text, openid) {
  try {
    const result = await cloud.openapi.security.msgSecCheck({
      content: text,
      openid: openid,
      scene: 1, // 1=资料 2=评论 3=论坛 4=社交日志
      version: 2 // Use version 2 for better detection
    })
    if (result.result && result.result.suggest === 'risky') {
      throw new Error('输入内容包含违规信息，请修改后重试')
    }
    return true
  } catch (err) {
    if (err.errCode === 87014) {
      throw new Error('内容含违规信息，已被拦截')
    }
    throw err
  }
}
```

### Image Content Security (imgSecCheck)

Check AI-generated images **after** generation, **before** returning to user:

```javascript
async function checkImageSecurity(imageBuffer, openid) {
  try {
    const result = await cloud.openapi.security.imgSecCheck({
      media: {
        contentType: 'image/png',
        value: imageBuffer
      },
      openid: openid,
      scene: 0, // 0=图库 1=头像 2=智能穿戴
      version: 2
    })
    if (result.result && result.result.suggest === 'risky') {
      throw new Error('生成的图片未通过安全检测，请重新生成')
    }
    return true
  } catch (err) {
    if (err.errCode === 87014) {
      throw new Error('图片含违规内容，已被拦截')
    }
    throw err
  }
}
```

### Integration Flow

```
User Input Text
    ↓
msgSecCheck (text moderation)
    ↓ Pass
AI Model generates image
    ↓
imgSecCheck (image moderation)
    ↓ Pass
Add "AI生成" watermark
    ↓
Upload to cloud storage
    ↓
Return to user with AI label
```

---

## 3. Privacy Permissions Configuration

### app.json Permission Declarations

Declare all permissions with user-facing descriptions:

```json
{
  "permission": {
    "scope.camera": {
      "desc": "用于AR纹样预览功能，将AI生成的纹样叠加到真实物体表面进行预览"
    },
    "scope.writePhotosAlbum": {
      "desc": "用于保存AI生成的纹样作品和AR预览截图到您的手机相册"
    }
  },
  "requiredPrivateInfos": [
    "chooseAvatar",
    "getNickname",
    "saveImageToPhotosAlbum"
  ]
}
```

### Permission Description Best Practices

- **Be specific**: Explain exactly what the permission is used for, not just "used for app features"
- **Mention AI if relevant**: If the permission supports an AI feature, mention it (e.g., "用于AR纹样预览")
- **Use user-friendly language**: Avoid technical jargon

### Privacy Interface Checklist

| Permission | requiredPrivateInfos entry | When Required |
|------------|---------------------------|---------------|
| Camera | `scope.camera` in permission | AR preview, photo capture |
| Photo Album Save | `saveImageToPhotosAlbum` | Saving generated images |
| User Avatar | `chooseAvatar` | Profile customization |
| User Nickname | `getNickname` | Profile customization |
| Location | `getLocation` | Location-based features |
| Album Selection | `chooseImage` / `chooseMedia` | Image upload |

### Privacy Protection Guidelines

On the WeChat Public Platform, navigate to:
**Settings > Privacy Protection Guidelines (用户隐私保护指引)**

Ensure all collected data types are declared:
- User avatar / nickname (if using `chooseAvatar` / `getNickname`)
- Device photos (if saving to album)
- Camera data (if using AR or photo features)

If the review form shows **"采集用户隐私"**, select it and click **"点击更新"** to sync the privacy guidelines.

---

## 4. Deep Synthesis (深度合成) Compliance

If the mini-program uses AI for image/video/audio generation (deep synthesis), additional requirements apply:

### Requirements

1. **AI Service Provider Registration**: The underlying AI model provider (e.g., Tencent Hunyuan) must be registered as a deep synthesis service provider
2. **Algorithm Filing**: The AI algorithm should have a filing number (算法备案号)
3. **Special Qualification Upload**: During review submission, upload the deep synthesis service provider's filing certificate in the **特殊资质** section
4. **User Notification**: Clearly inform users that AI/deep synthesis technology is being used

### Review Form Configuration

In the review submission form:
- **特殊资质** section: Upload the AI service provider's filing documentation
- **版本描述**: Mention AI content labeling and security checks are implemented
- **功能描述**: Clearly state which features use AI

### If No Filing Certificate Available

The filing certificate is optional for initial submission. You can:
1. Submit without it and provide it when requested by reviewers
2. Add a note in the version description: "AI生成内容已接入内容安全检测，所有AI生成图片均标注AI生成水印"

---

## 5. Pre-Review Compliance Checklist

Run through this checklist before submitting for review:

### AI Labeling
- [ ] All AI-generated images have "AI生成" watermark in bottom-right corner
- [ ] Result page displays "AI辅助创作" label
- [ ] Home page has AI content declaration
- [ ] Profile/My page has AI content declaration

### Content Security
- [ ] `msgSecCheck` is called before AI text processing
- [ ] `imgSecCheck` is called after AI image generation, before returning to user
- [ ] Error handling provides user-friendly messages for blocked content
- [ ] Both checks use `version: 2` API

### Privacy
- [ ] `app.json` has `permission` declarations for all used scopes
- [ ] `app.json` has `requiredPrivateInfos` for all privacy interfaces
- [ ] Permission descriptions are specific and user-friendly
- [ ] Privacy Protection Guidelines on platform are updated

### Deep Synthesis (if applicable)
- [ ] AI service provider is registered
- [ ] Special qualification documents ready for upload
- [ ] Version description mentions AI compliance measures

### General
- [ ] No test console logs in production code
- [ ] All pages are accessible (no dead links)
- [ ] Mini-program name and description match actual functionality
- [ ] Category selection is appropriate (e.g., "工具" for AI tools)

---

## 6. Common Review Rejection Reasons for AI Mini-Programs

| Reason | Fix |
|--------|-----|
| AI content not labeled | Add watermark + page labels |
| No content security check | Implement msgSecCheck + imgSecCheck |
| Missing privacy permission declaration | Add permission + requiredPrivateInfos in app.json |
| AI feature not described in version description | Add AI feature description in review form |
| Missing deep synthesis qualification | Upload filing certificate or explain in description |
| Inappropriate AI-generated content | Strengthen content security with stricter filtering |
| No user notification of AI usage | Add AI declaration on key pages |

---

## Key Lessons

1. **Label Everything**: Every piece of AI-generated content must have a visible label. Watermarks on images, labels on pages, declarations on home screen.
2. **Double-Check Security**: Both text (before) and image (after) security checks are required. Missing either one leads to rejection.
3. **Privacy Descriptions Matter**: Vague permission descriptions like "用于小程序功能" will be rejected. Be specific about what each permission does.
4. **Version Description Must Mention AI**: When submitting for review, the version description should explicitly mention AI features and compliance measures.
5. **Deep Synthesis Filing is Optional Initially**: You can submit without the filing certificate and provide it later, but mention the compliance measures in the description.
6. **Use version: 2 APIs**: The v2 content security APIs have better detection rates and are recommended by WeChat.
