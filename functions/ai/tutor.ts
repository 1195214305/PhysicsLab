/**
 * PhysicsLab Edge Function - AI 物理辅导
 * 基于阿里云 ESA Pages 边缘计算
 */

export default async function handler(request: Request): Promise<Response> {
  // CORS 头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  }

  // 处理 OPTIONS 请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const url = new URL(request.url)
  const path = url.pathname

  try {
    // AI 物理辅导接口
    if (path === '/api/ai/tutor' && request.method === 'POST') {
      const body = await request.json()
      const { question, experimentId, context } = body

      // 调用通义千问 API
      const response = await callQwenAPI(question, experimentId, context)

      return new Response(JSON.stringify(response), { headers: corsHeaders })
    }

    // 实验数据分析接口
    if (path === '/api/analyze' && request.method === 'POST') {
      const body = await request.json()
      const { experimentId, data } = body

      const analysis = analyzeExperimentData(experimentId, data)

      return new Response(JSON.stringify(analysis), { headers: corsHeaders })
    }

    // 获取实验提示
    if (path === '/api/hints' && request.method === 'GET') {
      const experimentId = url.searchParams.get('experimentId')

      if (!experimentId) {
        return new Response(
          JSON.stringify({ error: 'experimentId is required' }),
          { status: 400, headers: corsHeaders }
        )
      }

      const hints = getExperimentHints(experimentId)

      return new Response(JSON.stringify(hints), { headers: corsHeaders })
    }

    // 健康检查
    if (path === '/api/health') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          service: 'PhysicsLab Edge Function',
          timestamp: new Date().toISOString(),
          region: 'edge'
        }),
        { headers: corsHeaders }
      )
    }

    // 404
    return new Response(
      JSON.stringify({ error: 'Not Found' }),
      { status: 404, headers: corsHeaders }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: corsHeaders }
    )
  }
}

// 调用通义千问 API
async function callQwenAPI(question: string, experimentId: string, context: any) {
  const systemPrompt = `你是一位专业的高中物理老师，正在辅导学生进行物理实验。
当前实验：${getExperimentName(experimentId)}

请根据学生的问题，提供清晰、准确的物理知识解答。
- 使用简洁易懂的语言
- 结合实验现象解释原理
- 适当使用公式，但要解释公式的含义
- 鼓励学生思考和探索

实验上下文：${JSON.stringify(context)}`

  try {
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.QWEN_API_KEY || ''}`
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error('API request failed')
    }

    const data = await response.json()
    return {
      success: true,
      answer: data.choices[0]?.message?.content || '抱歉，我暂时无法回答这个问题。',
      experimentId
    }
  } catch (error) {
    // 返回预设回答
    return {
      success: true,
      answer: getPresetAnswer(experimentId, question),
      experimentId,
      isPreset: true
    }
  }
}

// 获取实验名称
function getExperimentName(experimentId: string): string {
  const names: Record<string, string> = {
    'free-fall': '自由落体运动',
    'spring-oscillator': '弹簧振子',
    'ohms-law': '欧姆定律',
    'light-refraction': '光的折射',
    'projectile-motion': '平抛运动',
    'simple-pendulum': '单摆测重力加速度'
  }
  return names[experimentId] || '物理实验'
}

// 预设回答
function getPresetAnswer(experimentId: string, question: string): string {
  const answers: Record<string, Record<string, string>> = {
    'free-fall': {
      default: '自由落体运动是物体仅在重力作用下从静止开始下落的运动。根据运动学公式：h = ½gt²，v = gt。通过测量下落高度和时间，可以验证这些公式并测量重力加速度。',
      '重力加速度': '重力加速度g约为9.8 m/s²，它表示物体在重力作用下每秒速度增加的量。在自由落体实验中，可以通过 g = 2h/t² 来计算。',
      '误差': '实验误差主要来源于：1) 空气阻力的影响；2) 计时的精度；3) 高度测量的准确性。可以通过多次测量取平均值来减小随机误差。'
    },
    'spring-oscillator': {
      default: '弹簧振子是简谐运动的典型例子。周期公式 T = 2π√(m/k) 表明周期只与质量m和劲度系数k有关，与振幅无关。',
      '周期': '弹簧振子的周期 T = 2π√(m/k)，其中m是振子质量，k是弹簧劲度系数。增大质量会使周期变长，增大劲度系数会使周期变短。',
      '能量': '在简谐运动中，动能和势能相互转化，但总机械能守恒。在平衡位置动能最大，在最大位移处势能最大。'
    },
    'ohms-law': {
      default: '欧姆定律表述为 I = U/R，即通过导体的电流与导体两端的电压成正比，与导体的电阻成反比。这是电路分析的基础定律。',
      '电阻': '电阻是导体对电流的阻碍作用，单位是欧姆(Ω)。电阻与导体的材料、长度、横截面积和温度有关。',
      'U-I图': 'U-I特性曲线是一条过原点的直线，斜率等于电阻R。通过测量多组电压和电流数据，可以验证欧姆定律并计算电阻值。'
    },
    'light-refraction': {
      default: '光的折射遵循斯涅尔定律：n₁sinθ₁ = n₂sinθ₂。当光从光密介质进入光疏介质时，折射角大于入射角；当入射角大于临界角时，会发生全反射。',
      '全反射': '全反射发生的条件：1) 光从光密介质射向光疏介质；2) 入射角大于临界角。临界角 θc = arcsin(n₂/n₁)。',
      '折射率': '折射率n = c/v，表示光在真空中的速度与在介质中速度的比值。折射率越大，光在该介质中传播越慢。'
    }
  }

  const experimentAnswers = answers[experimentId] || {}

  // 简单关键词匹配
  for (const [keyword, answer] of Object.entries(experimentAnswers)) {
    if (keyword !== 'default' && question.includes(keyword)) {
      return answer
    }
  }

  return experimentAnswers.default || '这是一个很好的问题！建议你仔细观察实验现象，结合课本上的公式进行分析。如果还有疑问，可以尝试改变实验参数，观察结果的变化。'
}

// 分析实验数据
function analyzeExperimentData(experimentId: string, data: any) {
  switch (experimentId) {
    case 'free-fall':
      return analyzeFreeFall(data)
    case 'spring-oscillator':
      return analyzeSpringOscillator(data)
    case 'ohms-law':
      return analyzeOhmsLaw(data)
    default:
      return { success: false, message: '暂不支持该实验的数据分析' }
  }
}

function analyzeFreeFall(data: { height: number; time: number }[]) {
  if (data.length < 2) {
    return { success: false, message: '数据点不足，请至少记录2组数据' }
  }

  // 计算重力加速度
  const gValues = data.map(d => 2 * d.height / (d.time * d.time))
  const avgG = gValues.reduce((a, b) => a + b, 0) / gValues.length
  const stdG = Math.sqrt(gValues.reduce((a, b) => a + (b - avgG) ** 2, 0) / gValues.length)

  return {
    success: true,
    results: {
      averageG: avgG.toFixed(2),
      standardDeviation: stdG.toFixed(3),
      relativeError: ((Math.abs(avgG - 9.8) / 9.8) * 100).toFixed(1) + '%',
      dataPoints: data.length
    },
    conclusion: avgG > 9.5 && avgG < 10.1
      ? '实验结果良好，测得的重力加速度接近理论值9.8 m/s²。'
      : '实验结果存在较大偏差，建议检查测量方法或增加测量次数。'
  }
}

function analyzeSpringOscillator(data: { mass: number; period: number; k: number }[]) {
  if (data.length < 2) {
    return { success: false, message: '数据点不足' }
  }

  // 验证周期公式
  const theoreticalPeriods = data.map(d => 2 * Math.PI * Math.sqrt(d.mass / d.k))
  const errors = data.map((d, i) => Math.abs(d.period - theoreticalPeriods[i]) / theoreticalPeriods[i] * 100)
  const avgError = errors.reduce((a, b) => a + b, 0) / errors.length

  return {
    success: true,
    results: {
      averageError: avgError.toFixed(1) + '%',
      dataPoints: data.length
    },
    conclusion: avgError < 5
      ? '实验验证了弹簧振子周期公式 T = 2π√(m/k)。'
      : '实验结果与理论值有一定偏差，可能是由于阻尼或测量误差造成的。'
  }
}

function analyzeOhmsLaw(data: { voltage: number; current: number }[]) {
  if (data.length < 3) {
    return { success: false, message: '数据点不足，请至少记录3组数据' }
  }

  // 线性拟合计算电阻
  const n = data.length
  const sumU = data.reduce((a, d) => a + d.voltage, 0)
  const sumI = data.reduce((a, d) => a + d.current, 0)
  const sumUI = data.reduce((a, d) => a + d.voltage * d.current, 0)
  const sumU2 = data.reduce((a, d) => a + d.voltage * d.voltage, 0)

  const slope = (n * sumUI - sumU * sumI) / (n * sumU2 - sumU * sumU)
  const resistance = 1000 / slope // 转换为欧姆

  // 计算R²
  const meanI = sumI / n
  const ssTotal = data.reduce((a, d) => a + (d.current - meanI) ** 2, 0)
  const ssResidual = data.reduce((a, d) => a + (d.current - slope * d.voltage) ** 2, 0)
  const rSquared = 1 - ssResidual / ssTotal

  return {
    success: true,
    results: {
      calculatedResistance: resistance.toFixed(1) + ' Ω',
      rSquared: rSquared.toFixed(4),
      dataPoints: data.length
    },
    conclusion: rSquared > 0.99
      ? `实验很好地验证了欧姆定律，U-I关系呈线性，计算得电阻为 ${resistance.toFixed(1)} Ω。`
      : '数据线性度不够理想，建议检查电路连接或增加测量点。'
  }
}

// 获取实验提示
function getExperimentHints(experimentId: string) {
  const hints: Record<string, string[]> = {
    'free-fall': [
      '确保重锤从静止状态释放',
      '多次测量取平均值可以减小误差',
      '注意观察纸带上的点迹间距变化',
      '可以用逐差法处理数据提高精度'
    ],
    'spring-oscillator': [
      '保持振幅较小，确保是简谐运动',
      '测量多个周期的时间再求平均',
      '注意弹簧不要超过弹性限度',
      '改变质量时观察周期的变化规律'
    ],
    'ohms-law': [
      '先检查电路连接是否正确',
      '从小电压开始逐渐增大',
      '记录多组数据绘制U-I图',
      '注意电流表和电压表的量程'
    ],
    'light-refraction': [
      '确保光线垂直于玻璃砖的平面入射',
      '准确测量入射角和折射角',
      '观察临界角附近的现象',
      '比较不同介质的折射率'
    ]
  }

  return {
    experimentId,
    hints: hints[experimentId] || ['仔细阅读实验说明', '注意安全操作', '认真记录数据']
  }
}
