from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

pdfmetrics.registerFont(TTFont('MSYH', 'C:/Windows/Fonts/msyh.ttc'))
pdfmetrics.registerFont(TTFont('MSYHBD', 'C:/Windows/Fonts/msyhbd.ttc'))

OUTPUT = r'D:\Apps\fyg\微信小程序开发大赛\纹心AI非遗纹样-参赛介绍文档.pdf'

INDIGO = HexColor('#1B3A5C')
OCHRE = HexColor('#A0522D')
AMBER = HexColor('#D4A017')
LIGHT_BG = HexColor('#F5F2ED')
GRAY = HexColor('#666666')

styles = getSampleStyleSheet()

s_title = ParagraphStyle('CTitle', fontName='MSYHBD', fontSize=28, leading=36, alignment=TA_CENTER, textColor=INDIGO)
s_subtitle = ParagraphStyle('CSub', fontName='MSYH', fontSize=14, leading=20, alignment=TA_CENTER, textColor=OCHRE)
s_h1 = ParagraphStyle('CH1', fontName='MSYHBD', fontSize=16, leading=24, textColor=INDIGO, spaceBefore=16, spaceAfter=8)
s_h2 = ParagraphStyle('CH2', fontName='MSYHBD', fontSize=12, leading=18, textColor=OCHRE, spaceBefore=10, spaceAfter=4)
s_body = ParagraphStyle('CBody', fontName='MSYH', fontSize=10, leading=16, textColor=HexColor('#333333'), spaceAfter=4)
s_bullet = ParagraphStyle('CBullet', fontName='MSYH', fontSize=10, leading=16, textColor=HexColor('#333333'), leftIndent=16, spaceAfter=2)
s_small = ParagraphStyle('CSmall', fontName='MSYH', fontSize=8, leading=12, textColor=GRAY, alignment=TA_CENTER)
s_table_h = ParagraphStyle('CTH', fontName='MSYHBD', fontSize=9, leading=13, textColor=HexColor('#FFFFFF'), alignment=TA_CENTER)
s_table_b = ParagraphStyle('CTB', fontName='MSYH', fontSize=9, leading=13, textColor=HexColor('#333333'))

doc = SimpleDocTemplate(OUTPUT, pagesize=A4, topMargin=20*mm, bottomMargin=20*mm, leftMargin=22*mm, rightMargin=22*mm)

story = []

# ========== 封面 ==========
story.append(Spacer(1, 60*mm))
story.append(Paragraph('纹心 · AI非遗纹样创作', s_title))
story.append(Spacer(1, 8*mm))
story.append(Paragraph('2026微信小程序开发大赛参赛作品介绍文档', s_subtitle))
story.append(Spacer(1, 4*mm))
story.append(Paragraph('东部赛区 | 单人参赛 | 主题"与AI共生"', s_subtitle))
story.append(Spacer(1, 30*mm))

cover_info = [
    [Paragraph('作品名称', s_table_b), Paragraph('纹心 · AI非遗纹样创作', s_table_b)],
    [Paragraph('作品定位', s_table_b), Paragraph('用自然语言描述意境，AI实时生成非遗扎染风格纹样', s_table_b)],
    [Paragraph('技术框架', s_table_b), Paragraph('微信原生开发 + 微信云开发CloudBase + 腾讯混元AI', s_table_b)],
    [Paragraph('参赛赛区', s_table_b), Paragraph('中国东部赛区', s_table_b)],
]
t = Table(cover_info, colWidths=[35*mm, 120*mm])
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (0, -1), LIGHT_BG),
    ('TEXTCOLOR', (0, 0), (0, -1), INDIGO),
    ('FONTNAME', (0, 0), (0, -1), 'MSYHBD'),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#CCCCCC')),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(t)
story.append(PageBreak())

# ========== 一、产品简介 ==========
story.append(Paragraph('一、产品简介', s_h1))
story.append(Paragraph(
    '纹心是一款基于微信小程序的AI非遗纹样创作平台。用户通过自然语言描述意境（如"山间晨雾"、"古道夕阳"），'
    '选择扎染风格模板，AI即可实时生成具有白族扎染非遗特色的纹样图案。生成的纹样可应用到手机壳、帆布袋、'
    '丝巾、靠垫等产品效果图中预览，并支持AR实时叠加预览、一键分享传播和个人作品集管理。', s_body))
story.append(Spacer(1, 4*mm))
story.append(Paragraph('核心功能闭环：', s_h2))
features = [
    '<b>AI纹样生成</b>：接入腾讯混元文生图模型，用户输入文字描述+选择风格，AI生成扎染风格纹样',
    '<b>风格模板库</b>：预设6种非遗风格（冰裂纹/几何重构/花卉纹/抽象纹/传统蓝染/现代渐变），降低输入门槛',
    '<b>效果预览</b>：Canvas合成纹样到4种产品效果图（手机壳/帆布袋/丝巾/靠垫），所见即所得',
    '<b>AR纹样预览</b>：通过相机将纹样实时叠加到现实物体上，支持拖动、缩放、透明度调节',
    '<b>分享传播</b>：自动生成分享配图，一键分享到微信好友/朋友圈，附带小程序码引流',
    '<b>个人作品集</b>：云数据库存储创作历史，支持查看、删除、点赞统计',
    '<b>AI生成标识</b>：所有AI生成内容标注"AI生成"水印，符合2025年9月起强制合规要求',
    '<b>内容安全检测</b>：接入微信msgSecCheck/imgSecCheck，过滤违规内容',
]
for f in features:
    story.append(Paragraph(f'• {f}', s_bullet))

story.append(PageBreak())

# ========== 二、应用场景 ==========
story.append(Paragraph('二、应用场景', s_h1))
story.append(Paragraph('纹心面向文创设计、非遗教育、个人定制和社交传播四大场景：', s_body))
story.append(Spacer(1, 3*mm))

scenarios = [
    [Paragraph('场景', s_table_h), Paragraph('目标用户', s_table_h), Paragraph('使用方式', s_table_h)],
    [Paragraph('文创设计', s_table_b), Paragraph('设计师、文创从业者', s_table_b), Paragraph('快速生成扎染纹样素材，应用于产品设计、印花图案', s_table_b)],
    [Paragraph('非遗教育', s_table_b), Paragraph('学生、非遗爱好者', s_table_b), Paragraph('体验AI辅助非遗创作，了解白族扎染纹样文化', s_table_b)],
    [Paragraph('个人定制', s_table_b), Paragraph('普通用户', s_table_b), Paragraph('生成个性化纹样，预览产品效果，定制专属物品', s_table_b)],
    [Paragraph('社交传播', s_table_b), Paragraph('社交媒体用户', s_table_b), Paragraph('创作独特AI纹样，分享到朋友圈/好友，社交裂变', s_table_b)],
]
t = Table(scenarios, colWidths=[25*mm, 40*mm, 90*mm])
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), INDIGO),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#CCCCCC')),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#FFFFFF'), LIGHT_BG]),
]))
story.append(t)

story.append(Spacer(1, 8*mm))
# ========== 三、解决的实际问题 ==========
story.append(Paragraph('三、解决的实际问题', s_h1))
problems = [
    '<b>传统扎染设计门槛高、周期长</b>：手工扎染设计需要专业技艺和数周时间，纹心将周期缩短至秒级，零基础用户也能创作',
    '<b>非遗传承缺乏数字化工具</b>：白族扎染虽为国家级非遗，但缺乏面向大众的数字化创作工具，纹心填补了这一空白',
    '<b>AI生成内容缺乏文化深度</b>：通用AI生图工具缺乏非遗文化定向能力，纹心通过预设风格模板和Prompt工程，确保生成纹样具有 authentic 非遗美学特征',
    '<b>文创产品定制链路断裂</b>：从纹样设计到产品预览缺乏一体化工具，纹心实现生成→预览→AR→分享全链路闭环',
    '<b>AI生成内容合规难</b>：2025年9月起AI生成内容强制标注，纹心开发时就内置水印和声明系统，完全合规',
]
for p in problems:
    story.append(Paragraph(f'• {p}', s_bullet))

story.append(PageBreak())

# ========== 四、技术开发方案 ==========
story.append(Paragraph('四、技术开发方案', s_h1))

story.append(Paragraph('4.1 技术架构', s_h2))
story.append(Paragraph(
    '项目采用微信原生开发框架 + 微信云开发CloudBase + 腾讯混元AI的技术组合，零运维、免域名配置、微信原生免鉴权登录。', s_body))

story.append(Spacer(1, 2*mm))
story.append(Paragraph('4.2 技术选型', s_h2))
tech = [
    [Paragraph('选项', s_table_h), Paragraph('选择', s_table_h), Paragraph('理由', s_table_h)],
    [Paragraph('开发框架', s_table_b), Paragraph('微信原生开发', s_table_b), Paragraph('WXML/WXSS接近HTML/CSS，性能最优，调试最直接', s_table_b)],
    [Paragraph('后端方案', s_table_b), Paragraph('微信云开发', s_table_b), Paragraph('零运维、免域名、原生免鉴权登录、AI成长计划免费额度', s_table_b)],
    [Paragraph('AI模型', s_table_b), Paragraph('腾讯混元Image 3.0', s_table_b), Paragraph('云开发内置、审核最顺、文生图能力已集成', s_table_b)],
    [Paragraph('图片合成', s_table_b), Paragraph('Canvas 2D API', s_table_b), Paragraph('原生支持、性能好，用于产品预览和AR叠加', s_table_b)],
    [Paragraph('AR预览', s_table_b), Paragraph('camera组件+Canvas', s_table_b), Paragraph('无需引入第三方AR SDK，轻量实现纹样叠加', s_table_b)],
]
t = Table(tech, colWidths=[25*mm, 35*mm, 95*mm])
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), INDIGO),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#CCCCCC')),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#FFFFFF'), LIGHT_BG]),
]))
story.append(t)

story.append(Spacer(1, 4*mm))
story.append(Paragraph('4.3 核心技术实现', s_h2))
tech_impl = [
    '<b>AI图片生成链路</b>：用户输入→云函数callAIImage→内容安全检测→混元文生图→图片下载压缩→云存储→返回展示',
    '<b>产品效果预览</b>：Canvas 2D API图层叠加，4种产品形状路径构建（圆角矩形/梯形/平行四边形）+装饰绘制',
    '<b>AR纹样叠加</b>：camera组件+Canvas合成，单指拖动+双指缩放手势，屏幕坐标按宽度等比映射到照片坐标',
    '<b>AI生成合规</b>：图片右下角自动添加"AI生成"水印 + 页面底部固定声明 + 用户协议说明',
    '<b>内容安全双检</b>：生成前msgSecCheck检测输入文本 + 生成后imgSecCheck检测输出图片',
    '<b>云函数架构</b>：4个云函数（callAIImage/callAIText/contentCheck/userOps），按职责拆分，支持异步调用',
    '<b>数据隔离</b>：云数据库按_openid隔离用户数据，works/shares/likes三集合关联设计',
]
for ti in tech_impl:
    story.append(Paragraph(f'• {ti}', s_bullet))

story.append(Spacer(1, 4*mm))
story.append(Paragraph('4.4 项目结构', s_h2))
story.append(Paragraph(
    'miniprogram/（前端）：5页面（index创作页/result结果页/gallery作品集/mine我的/ar预览页）+ '
    '3工具（api云函数封装/canvas绘制/share分享图）+ 6风格模板配置<br/>'
    'cloudfunctions/（云函数）：callAIImage（AI文生图+安全检测）/callAIText（文本优化）/contentCheck（内容检测）/userOps（作品CRUD+点赞+统计）', s_body))

story.append(PageBreak())

# ========== 五、创新点 ==========
story.append(Paragraph('五、创新点', s_h1))

story.append(Paragraph('5.1 AI应用创新', s_h2))
story.append(Paragraph(
    '原生接入微信云开发AI模块（wx.cloud.extend.AI），使用腾讯混元Image 3.0文生图模型。'
    'AI不是噱头而是核心能力——用户与AI协作创造非遗纹样，完美契合大赛"与AI共生"主题。'
    '通过Prompt工程将用户简短描述扩展为包含非遗技法、色彩体系、文化特征的专业Prompt，确保生成纹样具有 authentic 非遗美学。', s_body))

story.append(Paragraph('5.2 主题创新', s_h2))
story.append(Paragraph(
    '非遗×AI×小程序组合目前无竞品。往届虽有非遗方向获奖先例（Timeless China匠心中国获特等奖），'
    '但本作品首次将AI文生图能力与白族扎染非遗技艺深度结合，通过6种风格模板将传统纹样体系数字化，'
    '让每个人都能成为非遗共创者，填补了非遗数字化创作工具的市场空白。', s_body))

story.append(Paragraph('5.3 模式创新', s_h2))
story.append(Paragraph(
    '构建"AI生成→效果预览→AR体验→分享传播→作品集管理"的全链路闭环模式。'
    '区别于单一AI生图工具，纹心提供从创意到产品到传播的完整创作链路：'
    '用户不仅能生成纹样，还能通过AR将纹样叠加到现实物体预览效果，'
    '通过Canvas合成查看产品效果图，通过一键分享实现社交裂变传播。', s_body))

story.append(Paragraph('5.4 社会价值创新', s_h2))
story.append(Paragraph(
    '以国家级非物质文化遗产白族扎染为核心主题，通过AI技术降低非遗创作门槛，'
    '让传统文化以数字化方式焕发新生。每个风格模板附带扎染文化背景介绍，'
    '在创作过程中传播非遗知识，实现"科技赋能文化传承"的社会价值。', s_body))

story.append(Spacer(1, 8*mm))

# ========== 六、团队情况 ==========
story.append(Paragraph('六、团队情况', s_h1))
story.append(Paragraph(
    '单人参赛，东部赛区。开发者具备微信小程序开发、AI能力调用、Canvas图形绘制、'
    '云开发全栈能力，并有白族扎染非遗IP方向和AIGC纹样素材库的先前积累，'
    '确保作品在文化深度和技术实现上双重达标。', s_body))

story.append(Spacer(1, 20*mm))
story.append(Paragraph('—— 本文档为2026微信小程序开发大赛参赛作品介绍文档 ——', s_small))
story.append(Paragraph('作品知识产权归参赛者所有', s_small))

doc.build(story)
print(f'PDF已生成: {OUTPUT}')