// 实验数据定义
export interface Experiment {
  id: string
  name: string
  category: string
  categoryId: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  duration: string
  objectives: string[]
  principles: string[]
  equipment: string[]
  icon: string // SVG icon name
  tags: string[]
}

export interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string
  experimentCount: number
}

// 实验分类
export const categories: Category[] = [
  {
    id: 'mechanics',
    name: '力学实验',
    description: '研究物体运动规律和力的作用',
    icon: 'atom',
    color: '#39d353',
    experimentCount: 6
  },
  {
    id: 'electromagnetism',
    name: '电磁学实验',
    description: '探索电流、电压和磁场的奥秘',
    icon: 'zap',
    color: '#58a6ff',
    experimentCount: 5
  },
  {
    id: 'optics',
    name: '光学实验',
    description: '研究光的传播、反射和折射',
    icon: 'sun',
    color: '#d29922',
    experimentCount: 4
  },
  {
    id: 'thermodynamics',
    name: '热学实验',
    description: '探究热量传递和气体性质',
    icon: 'thermometer',
    color: '#f85149',
    experimentCount: 3
  },
  {
    id: 'modern',
    name: '近代物理',
    description: '了解原子结构和量子现象',
    icon: 'sparkles',
    color: '#a371f7',
    experimentCount: 3
  }
]

// 实验列表
export const experiments: Experiment[] = [
  // 力学实验
  {
    id: 'free-fall',
    name: '自由落体运动',
    category: '力学实验',
    categoryId: 'mechanics',
    description: '研究物体在重力作用下的自由落体运动规律，验证自由落体运动是匀加速直线运动。',
    difficulty: 'easy',
    duration: '15分钟',
    objectives: [
      '理解自由落体运动的概念',
      '验证自由落体运动是匀加速直线运动',
      '测量重力加速度g的值'
    ],
    principles: [
      'h = ½gt²',
      'v = gt',
      'v² = 2gh'
    ],
    equipment: ['打点计时器', '重锤', '纸带', '刻度尺', '铁架台'],
    icon: 'arrow-down',
    tags: ['必修一', '运动学', '重力加速度']
  },
  {
    id: 'spring-oscillator',
    name: '弹簧振子',
    category: '力学实验',
    categoryId: 'mechanics',
    description: '研究弹簧振子的简谐运动规律，探究周期与质量、劲度系数的关系。',
    difficulty: 'medium',
    duration: '20分钟',
    objectives: [
      '理解简谐运动的特点',
      '探究弹簧振子周期的影响因素',
      '验证周期公式 T = 2π√(m/k)'
    ],
    principles: [
      'F = -kx',
      'T = 2π√(m/k)',
      'x = Acos(ωt + φ)'
    ],
    equipment: ['弹簧', '砝码', '秒表', '刻度尺', '支架'],
    icon: 'activity',
    tags: ['必修二', '振动', '简谐运动']
  },
  {
    id: 'projectile-motion',
    name: '平抛运动',
    category: '力学实验',
    categoryId: 'mechanics',
    description: '研究物体做平抛运动的规律，验证平抛运动可分解为水平方向的匀速直线运动和竖直方向的自由落体运动。',
    difficulty: 'medium',
    duration: '20分钟',
    objectives: [
      '理解平抛运动的特点',
      '验证运动的独立性原理',
      '测量初速度和落地时间'
    ],
    principles: [
      'x = v₀t',
      'y = ½gt²',
      'v = √(v₀² + (gt)²)'
    ],
    equipment: ['斜槽', '小球', '白纸', '复写纸', '刻度尺'],
    icon: 'trending-up',
    tags: ['必修一', '运动学', '抛体运动']
  },
  {
    id: 'momentum-conservation',
    name: '动量守恒定律',
    category: '力学实验',
    categoryId: 'mechanics',
    description: '通过碰撞实验验证动量守恒定律，研究弹性碰撞和非弹性碰撞。',
    difficulty: 'hard',
    duration: '25分钟',
    objectives: [
      '理解动量守恒定律',
      '区分弹性碰撞和非弹性碰撞',
      '验证碰撞前后动量守恒'
    ],
    principles: [
      'm₁v₁ + m₂v₂ = m₁v₁\' + m₂v₂\'',
      '弹性碰撞：动能守恒',
      '完全非弹性碰撞：v₁\' = v₂\''
    ],
    equipment: ['气垫导轨', '滑块', '光电门', '计时器', '弹簧片'],
    icon: 'git-merge',
    tags: ['必修二', '动量', '碰撞']
  },
  {
    id: 'simple-pendulum',
    name: '单摆测重力加速度',
    category: '力学实验',
    categoryId: 'mechanics',
    description: '利用单摆测量当地重力加速度，研究单摆周期与摆长的关系。',
    difficulty: 'easy',
    duration: '15分钟',
    objectives: [
      '理解单摆的运动规律',
      '掌握测量重力加速度的方法',
      '学会控制变量法'
    ],
    principles: [
      'T = 2π√(L/g)',
      'g = 4π²L/T²',
      '小角度近似：sinθ ≈ θ'
    ],
    equipment: ['细线', '小球', '铁架台', '刻度尺', '秒表'],
    icon: 'clock',
    tags: ['必修二', '振动', '重力加速度']
  },
  {
    id: 'friction-coefficient',
    name: '测量摩擦系数',
    category: '力学实验',
    categoryId: 'mechanics',
    description: '测量物体与接触面之间的滑动摩擦系数，研究摩擦力的影响因素。',
    difficulty: 'easy',
    duration: '15分钟',
    objectives: [
      '理解滑动摩擦力的概念',
      '掌握测量摩擦系数的方法',
      '探究摩擦力与正压力的关系'
    ],
    principles: [
      'f = μN',
      'μ = f/N = tanθ',
      '临界角法测量'
    ],
    equipment: ['木块', '斜面', '弹簧测力计', '砝码', '量角器'],
    icon: 'layers',
    tags: ['必修一', '力学', '摩擦力']
  },

  // 电磁学实验
  {
    id: 'ohms-law',
    name: '欧姆定律',
    category: '电磁学实验',
    categoryId: 'electromagnetism',
    description: '验证欧姆定律，研究电流、电压、电阻之间的关系。',
    difficulty: 'easy',
    duration: '15分钟',
    objectives: [
      '理解欧姆定律的内容',
      '学会使用电流表和电压表',
      '绘制U-I特性曲线'
    ],
    principles: [
      'I = U/R',
      'U = IR',
      'R = U/I'
    ],
    equipment: ['电源', '电阻', '电流表', '电压表', '开关', '导线'],
    icon: 'zap',
    tags: ['必修三', '电路', '欧姆定律']
  },
  {
    id: 'capacitor-charging',
    name: '电容器充放电',
    category: '电磁学实验',
    categoryId: 'electromagnetism',
    description: '研究电容器的充放电过程，理解RC电路的时间常数。',
    difficulty: 'medium',
    duration: '20分钟',
    objectives: [
      '理解电容器的充放电过程',
      '掌握时间常数τ的概念',
      '绘制充放电曲线'
    ],
    principles: [
      'Q = CU',
      'τ = RC',
      'U(t) = U₀(1 - e^(-t/τ))'
    ],
    equipment: ['电容器', '电阻', '电源', '电压表', '开关', '秒表'],
    icon: 'battery-charging',
    tags: ['选修三', '电路', '电容']
  },
  {
    id: 'magnetic-field',
    name: '通电导线的磁场',
    category: '电磁学实验',
    categoryId: 'electromagnetism',
    description: '研究通电直导线和通电螺线管周围的磁场分布。',
    difficulty: 'medium',
    duration: '20分钟',
    objectives: [
      '理解电流的磁效应',
      '掌握安培定则',
      '观察磁场的分布规律'
    ],
    principles: [
      'B = μ₀I/(2πr)',
      'B = μ₀nI',
      '安培定则（右手螺旋定则）'
    ],
    equipment: ['直导线', '螺线管', '电源', '小磁针', '铁屑', '玻璃板'],
    icon: 'compass',
    tags: ['选修三', '磁场', '电磁感应']
  },
  {
    id: 'electromagnetic-induction',
    name: '电磁感应现象',
    category: '电磁学实验',
    categoryId: 'electromagnetism',
    description: '研究电磁感应现象，验证法拉第电磁感应定律。',
    difficulty: 'hard',
    duration: '25分钟',
    objectives: [
      '理解电磁感应现象',
      '掌握楞次定律',
      '验证法拉第电磁感应定律'
    ],
    principles: [
      'ε = -dΦ/dt',
      'ε = BLv',
      '楞次定律：感应电流的磁场阻碍原磁通量的变化'
    ],
    equipment: ['线圈', '磁铁', '灵敏电流计', '导轨', '滑块'],
    icon: 'rotate-cw',
    tags: ['选修三', '电磁感应', '法拉第定律']
  },
  {
    id: 'series-parallel-circuit',
    name: '串并联电路',
    category: '电磁学实验',
    categoryId: 'electromagnetism',
    description: '研究串联和并联电路的特点，验证电阻的串并联规律。',
    difficulty: 'easy',
    duration: '15分钟',
    objectives: [
      '理解串并联电路的特点',
      '验证串联电路电流相等',
      '验证并联电路电压相等'
    ],
    principles: [
      '串联：R = R₁ + R₂',
      '并联：1/R = 1/R₁ + 1/R₂',
      '功率分配规律'
    ],
    equipment: ['电阻', '电源', '电流表', '电压表', '开关', '导线'],
    icon: 'git-branch',
    tags: ['必修三', '电路', '串并联']
  },

  // 光学实验
  {
    id: 'light-refraction',
    name: '光的折射',
    category: '光学实验',
    categoryId: 'optics',
    description: '研究光从一种介质进入另一种介质时的折射规律，验证斯涅尔定律。',
    difficulty: 'easy',
    duration: '15分钟',
    objectives: [
      '理解光的折射现象',
      '验证斯涅尔定律',
      '测量介质的折射率'
    ],
    principles: [
      'n₁sinθ₁ = n₂sinθ₂',
      'n = c/v',
      '全反射条件：sinθc = n₂/n₁'
    ],
    equipment: ['激光笔', '半圆形玻璃砖', '量角器', '白纸', '光屏'],
    icon: 'corner-down-right',
    tags: ['选修三', '光学', '折射']
  },
  {
    id: 'double-slit-interference',
    name: '双缝干涉',
    category: '光学实验',
    categoryId: 'optics',
    description: '观察光的双缝干涉现象，测量光的波长。',
    difficulty: 'hard',
    duration: '25分钟',
    objectives: [
      '理解光的波动性',
      '观察干涉条纹',
      '测量光的波长'
    ],
    principles: [
      'Δx = λL/d',
      '明纹条件：δ = kλ',
      '暗纹条件：δ = (k+½)λ'
    ],
    equipment: ['激光器', '双缝', '光屏', '刻度尺', '测微目镜'],
    icon: 'waves',
    tags: ['选修三', '光学', '干涉']
  },
  {
    id: 'lens-imaging',
    name: '凸透镜成像',
    category: '光学实验',
    categoryId: 'optics',
    description: '研究凸透镜成像规律，验证透镜成像公式。',
    difficulty: 'medium',
    duration: '20分钟',
    objectives: [
      '理解凸透镜成像规律',
      '验证透镜成像公式',
      '测量凸透镜焦距'
    ],
    principles: [
      '1/u + 1/v = 1/f',
      'm = v/u = h\'/h',
      '成像规律：物近像远像变大'
    ],
    equipment: ['凸透镜', '光具座', '蜡烛', '光屏', '刻度尺'],
    icon: 'maximize-2',
    tags: ['选修三', '光学', '透镜']
  },
  {
    id: 'total-reflection',
    name: '光的全反射',
    category: '光学实验',
    categoryId: 'optics',
    description: '研究光的全反射现象，测量临界角和折射率。',
    difficulty: 'medium',
    duration: '20分钟',
    objectives: [
      '理解全反射的条件',
      '测量临界角',
      '了解光纤通信原理'
    ],
    principles: [
      'sinθc = n₂/n₁',
      '全反射条件：n₁ > n₂ 且 θ > θc',
      '光纤原理'
    ],
    equipment: ['半圆形玻璃砖', '激光笔', '量角器', '光屏'],
    icon: 'corner-up-left',
    tags: ['选修三', '光学', '全反射']
  },

  // 热学实验
  {
    id: 'gas-laws',
    name: '气体实验定律',
    category: '热学实验',
    categoryId: 'thermodynamics',
    description: '验证玻意耳定律、查理定律和盖-吕萨克定律。',
    difficulty: 'medium',
    duration: '25分钟',
    objectives: [
      '理解理想气体状态方程',
      '验证等温、等压、等容过程',
      '绘制p-V、p-T、V-T图像'
    ],
    principles: [
      'pV = nRT',
      '玻意耳定律：pV = 常数',
      '查理定律：p/T = 常数'
    ],
    equipment: ['注射器', '压强计', '温度计', '水浴', '气体'],
    icon: 'thermometer',
    tags: ['选修三', '热学', '气体定律']
  },
  {
    id: 'heat-conduction',
    name: '热传导实验',
    category: '热学实验',
    categoryId: 'thermodynamics',
    description: '研究不同材料的热传导性能，理解傅里叶热传导定律。',
    difficulty: 'easy',
    duration: '20分钟',
    objectives: [
      '理解热传导的概念',
      '比较不同材料的导热性能',
      '了解傅里叶热传导定律'
    ],
    principles: [
      'Q = -kA(dT/dx)',
      '热导率k的概念',
      '稳态热传导'
    ],
    equipment: ['金属棒', '酒精灯', '温度计', '蜡', '支架'],
    icon: 'flame',
    tags: ['选修三', '热学', '热传导']
  },
  {
    id: 'specific-heat',
    name: '比热容测量',
    category: '热学实验',
    categoryId: 'thermodynamics',
    description: '测量物质的比热容，理解热量与温度变化的关系。',
    difficulty: 'medium',
    duration: '25分钟',
    objectives: [
      '理解比热容的概念',
      '掌握混合法测比热容',
      '分析实验误差来源'
    ],
    principles: [
      'Q = cmΔT',
      '热平衡：Q放 = Q吸',
      '混合法原理'
    ],
    equipment: ['量热器', '温度计', '天平', '热水', '待测物质'],
    icon: 'droplet',
    tags: ['选修三', '热学', '比热容']
  },

  // 近代物理实验
  {
    id: 'photoelectric-effect',
    name: '光电效应',
    category: '近代物理',
    categoryId: 'modern',
    description: '研究光电效应现象，验证爱因斯坦光电效应方程。',
    difficulty: 'hard',
    duration: '30分钟',
    objectives: [
      '理解光电效应现象',
      '验证爱因斯坦光电效应方程',
      '测量普朗克常数'
    ],
    principles: [
      'hν = W + ½mv²max',
      'eU₀ = hν - W',
      '截止频率：ν₀ = W/h'
    ],
    equipment: ['光电管', '单色光源', '电压表', '电流表', '滤光片'],
    icon: 'sun',
    tags: ['选修三', '近代物理', '光电效应']
  },
  {
    id: 'atomic-spectrum',
    name: '原子光谱',
    category: '近代物理',
    categoryId: 'modern',
    description: '观察氢原子光谱，验证玻尔原子模型。',
    difficulty: 'hard',
    duration: '25分钟',
    objectives: [
      '观察氢原子光谱',
      '理解玻尔原子模型',
      '验证里德伯公式'
    ],
    principles: [
      '1/λ = R(1/n₁² - 1/n₂²)',
      'En = -13.6/n² eV',
      '能级跃迁'
    ],
    equipment: ['氢光谱管', '分光计', '光栅', '电源'],
    icon: 'radio',
    tags: ['选修三', '近代物理', '原子结构']
  },
  {
    id: 'radioactive-decay',
    name: '放射性衰变模拟',
    category: '近代物理',
    categoryId: 'modern',
    description: '模拟放射性衰变过程，理解半衰期的概念。',
    difficulty: 'medium',
    duration: '20分钟',
    objectives: [
      '理解放射性衰变规律',
      '掌握半衰期的概念',
      '绘制衰变曲线'
    ],
    principles: [
      'N = N₀e^(-λt)',
      'T½ = ln2/λ',
      '衰变常数λ'
    ],
    equipment: ['骰子模拟', '计数器', '计时器', '图表纸'],
    icon: 'activity',
    tags: ['选修三', '近代物理', '核物理']
  }
]

// 根据分类获取实验
export const getExperimentsByCategory = (categoryId: string): Experiment[] => {
  return experiments.filter(exp => exp.categoryId === categoryId)
}

// 根据ID获取实验
export const getExperimentById = (id: string): Experiment | undefined => {
  return experiments.find(exp => exp.id === id)
}

// 根据ID获取分类
export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(cat => cat.id === id)
}

// 获取推荐实验
export const getFeaturedExperiments = (): Experiment[] => {
  return [
    experiments.find(e => e.id === 'free-fall')!,
    experiments.find(e => e.id === 'ohms-law')!,
    experiments.find(e => e.id === 'light-refraction')!,
    experiments.find(e => e.id === 'spring-oscillator')!,
    experiments.find(e => e.id === 'photoelectric-effect')!,
    experiments.find(e => e.id === 'double-slit-interference')!
  ]
}
