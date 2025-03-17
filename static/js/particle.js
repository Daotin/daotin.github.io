/**
 * 现代化的粒子连线动画
 * 符合杂志风格设计，更加优雅和具有艺术性
 */

document.addEventListener('DOMContentLoaded', function () {
	const canvas = document.getElementById('particle-canvas')
	if (!canvas) return

	const ctx = canvas.getContext('2d')

	// 设置canvas尺寸为窗口大小
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight

	// 粒子配置 - 更加符合杂志风格
	const particlesConfig = {
		number: 70, // 增加粒子数量
		primaryColor: '#d53f8c', // 主色
		accentColor: '#0BC5EA', // 强调色
		radius: 1.2, // 默认粒子半径更小
		maxRadius: 2.5, // 最大粒子半径
		speed: 0.3, // 减慢速度，更加优雅
		connectionRadius: 130, // 连接半径
		primaryLineColor: 'rgba(213, 63, 140, 0.06)', // 主色连线
		accentLineColor: 'rgba(11, 197, 234, 0.06)', // 强调色连线
		mouseRadius: 150, // 鼠标交互半径
		mouseStrength: 50, // 鼠标排斥力度
		particleBlending: true, // 是否开启颜色混合
	}

	// 创建粒子数组
	let particles = []

	// 初始化暗色主题检测
	const isDarkMode = document.documentElement.className.includes('dark')
	if (isDarkMode) {
		particlesConfig.primaryColor = '#F687B3'
		particlesConfig.accentColor = '#76E4F7'
		particlesConfig.primaryLineColor = 'rgba(246, 135, 179, 0.08)'
		particlesConfig.accentLineColor = 'rgba(118, 228, 247, 0.08)'
	}

	// 监听暗色主题变化
	const observer = new MutationObserver(function (mutations) {
		mutations.forEach(function (mutation) {
			if (mutation.attributeName === 'class') {
				const isDark = document.documentElement.className.includes('dark')
				particlesConfig.primaryColor = isDark ? '#F687B3' : '#d53f8c'
				particlesConfig.accentColor = isDark ? '#76E4F7' : '#0BC5EA'
				particlesConfig.primaryLineColor = isDark ? 'rgba(246, 135, 179, 0.08)' : 'rgba(213, 63, 140, 0.06)'
				particlesConfig.accentLineColor = isDark ? 'rgba(118, 228, 247, 0.08)' : 'rgba(11, 197, 234, 0.06)'
			}
		})
	})

	observer.observe(document.documentElement, { attributes: true })

	// 粒子类
	class Particle {
		constructor(x, y) {
			this.x = x
			this.y = y
			this.size = Math.random() * (particlesConfig.maxRadius - particlesConfig.radius) + particlesConfig.radius
			this.speedX = Math.random() * particlesConfig.speed * 2 - particlesConfig.speed
			this.speedY = Math.random() * particlesConfig.speed * 2 - particlesConfig.speed
			this.opacity = Math.random() * 0.5 + 0.3

			// 随机选择粒子颜色，部分粒子使用强调色
			this.color = Math.random() > 0.85 ? particlesConfig.accentColor : particlesConfig.primaryColor
		}

		// 更新粒子位置
		update() {
			// 添加轻微的波动效果
			this.x += this.speedX + Math.sin(Date.now() * 0.001) * 0.05
			this.y += this.speedY + Math.cos(Date.now() * 0.001) * 0.05

			// 边界检测
			if (this.x < 0 || this.x > canvas.width) {
				this.speedX = -this.speedX
			}

			if (this.y < 0 || this.y > canvas.height) {
				this.speedY = -this.speedY
			}

			// 添加鼠标交互
			if (mouse.x && mouse.y) {
				const dx = this.x - mouse.x
				const dy = this.y - mouse.y
				const distance = Math.sqrt(dx * dx + dy * dy)

				if (distance < particlesConfig.mouseRadius) {
					const force = (particlesConfig.mouseRadius / distance) * particlesConfig.mouseStrength
					this.speedX += (dx / distance) * force * 0.03
					this.speedY += (dy / distance) * force * 0.03

					// 限制最大速度
					const maxSpeed = 3
					const currentSpeed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY)
					if (currentSpeed > maxSpeed) {
						this.speedX = (this.speedX / currentSpeed) * maxSpeed
						this.speedY = (this.speedY / currentSpeed) * maxSpeed
					}
				}
			}

			// 摩擦力，使粒子自然减速
			this.speedX *= 0.98
			this.speedY *= 0.98
		}

		// 绘制粒子
		draw() {
			ctx.fillStyle = this.color
			ctx.globalAlpha = this.opacity
			ctx.beginPath()
			ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
			ctx.closePath()
			ctx.fill()
			ctx.globalAlpha = 1
		}
	}

	// 初始化粒子
	function init() {
		particles = []
		for (let i = 0; i < particlesConfig.number; i++) {
			const x = Math.random() * canvas.width
			const y = Math.random() * canvas.height
			particles.push(new Particle(x, y))
		}
	}

	// 绘制粒子间的连线
	function drawConnections() {
		for (let i = 0; i < particles.length; i++) {
			for (let j = i + 1; j < particles.length; j++) {
				const dx = particles[i].x - particles[j].x
				const dy = particles[i].y - particles[j].y
				const distance = Math.sqrt(dx * dx + dy * dy)

				if (distance < particlesConfig.connectionRadius) {
					// 根据粒子颜色选择连线颜色
					let lineColor
					if (particlesConfig.particleBlending && particles[i].color === particles[j].color) {
						lineColor =
							particles[i].color === particlesConfig.primaryColor
								? particlesConfig.primaryLineColor
								: particlesConfig.accentLineColor
					} else if (particlesConfig.particleBlending) {
						// 混合两个粒子的颜色
						lineColor = 'rgba(160, 82, 188, 0.06)' // 主色和强调色的混合
					} else {
						lineColor = particlesConfig.primaryLineColor
					}

					// 设置线条样式
					ctx.strokeStyle = lineColor
					ctx.lineWidth = (1 - distance / particlesConfig.connectionRadius) * 0.8

					// 绘制连线
					ctx.beginPath()
					ctx.moveTo(particles[i].x, particles[i].y)
					ctx.lineTo(particles[j].x, particles[j].y)
					ctx.stroke()
				}
			}
		}
	}

	// 动画循环
	function animate() {
		ctx.clearRect(0, 0, canvas.width, canvas.height)

		// 先绘制连线，再绘制粒子
		drawConnections()

		particles.forEach(particle => {
			particle.update()
			particle.draw()
		})

		requestAnimationFrame(animate)
	}

	// 处理窗口大小变化
	window.addEventListener('resize', function () {
		canvas.width = window.innerWidth
		canvas.height = window.innerHeight
		init()
	})

	// 鼠标交互效果
	const mouse = {
		x: null,
		y: null,
	}

	window.addEventListener('mousemove', function (event) {
		mouse.x = event.x
		mouse.y = event.y
	})

	// 鼠标离开时，重置鼠标位置
	window.addEventListener('mouseout', function () {
		mouse.x = undefined
		mouse.y = undefined
	})

	// 添加装饰性背景元素
	function addDecorativeElements() {
		const container = document.querySelector('body')

		// 添加圆形装饰元素
		const circle1 = document.createElement('div')
		circle1.className = 'decorative-bg circle-1'
		container.appendChild(circle1)

		const circle2 = document.createElement('div')
		circle2.className = 'decorative-bg circle-2'
		container.appendChild(circle2)
	}

	// 初始化并启动动画
	init()
	animate()
	addDecorativeElements()
})
