let projectSlider = {
  total: 1,
  current: 1,
  isChange: false,

  init: () => {
    let projects = document.getElementsByClassName('project')
    this.total = projects.length
    document.getElementById('project-total').innerHTML = this.total

    // Event
    S.L(document, 'add', 'mouseWheel', (e) => {
      if (projectSlider.isChange) return
      projectSlider.isChange = true

      if (e.deltaY > 0) {
        projectSlider.next()
      } else {
        projectSlider.prev()
      }
    })
  },
  
  next: () => {
    if (this.current === this.total) {
      return this.releaseWheelEvent
    }

    let Y = (this.current - 1) * -100
    let moveY = Y - 100
    console.log(Y, moveY)

    let tl = new S.Timeline()
    tl.from({ el: '#projects', p: { y: [Y, moveY, '%'] }, d: 500, e: 'Power4Out', cb: projectSlider.releaseWheelEvent})
    tl.play()

    this.current++
  },

  prev: () => {
    if (this.current === 1) {
      return this.releaseWheelEvent
    }

    let Y = (this.current - 1) * -100
    let moveY = Y + 100
    console.log(Y, moveY)

    let tl = new S.Timeline()
    tl.from({ el: '#projects', p: { y: [Y, moveY, '%'] }, d: 500, e: 'Power4Out', cb: projectSlider.releaseWheelEvent})
    tl.play()

    this.current--
  },

  releaseWheelEvent: () => {
    console.log('release')
    this.isChange = false
  }
}

let app = {
  init: () => {
    projectSlider.init()
  }
}

app.init()
