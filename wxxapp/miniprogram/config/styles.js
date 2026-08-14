const styleTemplates = [
  {
    id: 1,
    name: '冰裂纹',
    label: '经典冰裂',
    gradient: 'linear-gradient(135deg, #1B3A5C 0%, #2C5F7C 50%, #4A7FA8 100%)',
    prompt: 'tie-dye ice crackle pattern, indigo blue, traditional Bai ethnic minority style, cracked ice texture, high detail',
    optimizedPrompt: 'Traditional Bai ethnic minority tie-dye ice crackle pattern, deep indigo blue palette, authentic cracked ice texture with organic branching fractures, hand-dyed cotton fabric, high detail, intricate crackle network, cultural heritage craft, 4k quality',
    previewImage: '/images/style_1_ice.png',
    colors: ['#1B3A5C', '#2C5F7C', '#4A7FA8']
  },
  {
    id: 2,
    name: '几何重构',
    label: '现代几何',
    gradient: 'linear-gradient(135deg, #A0522D 0%, #C4783E 50%, #D4A017 100%)',
    prompt: 'tie-dye geometric reconstructed pattern, ochre and amber tones, modern minimalist ethnic style, geometric shapes',
    optimizedPrompt: 'Modern reconstructed tie-dye geometric pattern, ochre and amber tones, contemporary minimalist ethnic style, precise geometric shapes interlocking, clean lines with organic dye bleeding, modern interpretation of traditional craft, high detail',
    previewImage: '/images/style_2_geo.png',
    colors: ['#A0522D', '#C4783E', '#D4A017']
  },
  {
    id: 3,
    name: '花卉纹',
    label: '繁花扎染',
    gradient: 'linear-gradient(135deg, #2C5F7C 0%, #5B8BAF 50%, #A0522D 100%)',
    prompt: 'tie-dye floral pattern, indigo and ochre, traditional Bai ethnic flower motifs, organic flowing petals',
    optimizedPrompt: 'Traditional Bai tie-dye floral pattern, indigo and ochre palette, organic flowing petal motifs, blooming flowers with natural dye diffusion, handcrafted ethnic minority textile, intricate botanical details, cultural heritage',
    previewImage: '/images/style_3_floral.png',
    colors: ['#2C5F7C', '#5B8BAF', '#A0522D']
  },
  {
    id: 4,
    name: '抽象纹',
    label: '抽象意境',
    gradient: 'linear-gradient(135deg, #A0522D 0%, #1B3A5C 50%, #D4A017 100%)',
    prompt: 'abstract tie-dye pattern, mixed indigo ochre amber, artistic flowing abstract shapes, ethereal atmosphere',
    optimizedPrompt: 'Abstract tie-dye art pattern, mixed indigo ochre amber palette, ethereal flowing abstract shapes, atmospheric ink-wash effect, artistic organic dye diffusion, contemporary abstract expression, dreamlike mood',
    previewImage: '/images/style_4_abstract.png',
    colors: ['#A0522D', '#1B3A5C', '#D4A017']
  },
  {
    id: 5,
    name: '传统蓝染',
    label: '靛蓝古韵',
    gradient: 'linear-gradient(135deg, #0D2137 0%, #1B3A5C 50%, #2C5F7C 100%)',
    prompt: 'traditional indigo dye pattern, deep blue tie-dye, classic Bai ethnic minority heritage style, authentic shibori',
    optimizedPrompt: 'Authentic traditional indigo dye tie-dye pattern, deep blue palette, classic Bai ethnic minority heritage shibori style, genuine hand-dyed cotton, deep saturated indigo, traditional resist-dye technique, antique textile texture',
    previewImage: '/images/style_5_indigo.png',
    colors: ['#0D2137', '#1B3A5C', '#2C5F7C']
  },
  {
    id: 6,
    name: '现代渐变',
    label: '渐变融合',
    gradient: 'linear-gradient(135deg, #D4A017 0%, #A0522D 50%, #1B3A5C 100%)',
    prompt: 'modern gradient tie-dye pattern, amber ochre indigo fusion, contemporary style with traditional roots',
    optimizedPrompt: 'Modern gradient tie-dye pattern, amber ochre indigo fusion, contemporary style with traditional roots, smooth color gradients blending, modern dye diffusion technique, elegant transitional tones, high quality',
    previewImage: '/images/style_6_gradient.png',
    colors: ['#D4A017', '#A0522D', '#1B3A5C']
  }
]

module.exports = {
  styleTemplates
}