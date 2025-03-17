/**
 * 现代化的粒子连线动画
 * 替代原来的蜘蛛网效果，更加简洁美观
 */

document.addEventListener('DOMContentLoaded', function () {
	const canvas = document.getElementById('particle-canvas')
	if (!canvas) return

	const ctx = canvas.getContext('2d')

	// 设置canvas尺寸为窗口大小
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight

	// 粒子配置
	const particlesConfig = {
		number: 40,
		color: '#3182CE',
		radius: 2,
		maxRadius: 3,
		speed: 0.5,
		connectionRadius: 150,
		lineColor: 'rgba(49, 130, 206, 0.15)',
	}

	// 创建粒子数组
	let particles = []

	// 初始化暗色主题检测
	const isDarkMode = document.documentElement.className.includes('dark')
	if (isDarkMode) {
		particlesConfig.color = '#60A5FA'
		particlesConfig.lineColor = 'rgba(96, 165, 250, 0.1)'
	}

	// 监听暗色主题变化
	const observer = new MutationObserver(function (mutations) {
		mutations.forEach(function (mutation) {
			if (mutation.attributeName === 'class') {
				const isDark = document.documentElement.className.includes('dark')
				particlesConfig.color = isDark ? '#60A5FA' : '#3182CE'
				particlesConfig.lineColor = isDark ? 'rgba(96, 165, 250, 0.1)' : 'rgba(49, 130, 206, 0.15)'
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
			this.opacity = Math.random() * 0.5 + 0.5
		}

		// 更新粒子位置
		update() {
			this.x += this.speedX
			this.y += this.speedY

			// 边界检测
			if (this.x < 0 || this.x > canvas.width) {
				this.speedX = -this.speedX
			}

			if (this.y < 0 || this.y > canvas.height) {
				this.speedY = -this.speedY
			}
		}

		// 绘制粒子
		draw() {
			ctx.fillStyle = particlesConfig.color
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
					ctx.strokeStyle = particlesConfig.lineColor
					ctx.lineWidth = 1 - distance / particlesConfig.connectionRadius
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
		radius: 100,
	}

	window.addEventListener('mousemove', function (event) {
		mouse.x = event.x
		mouse.y = event.y
	})

	// 初始化并启动动画
	init()
	animate()
})
