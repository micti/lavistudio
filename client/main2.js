let timer = 0;
setInterval(function () { timer += 50; }, 50);

let isChanging = false
let projectSlider = {
  total: 1,
  current: 1,
  isChange: false,
  scrollDelta1: null,
  scrollDelta2: null,
  foundScroll: false,
  wheelEvent: (delta, type, event) => {
    if (projectSlider.isChange) {
      timer = 0
      return
    }

    if (timer < 500) {
      return
    }

    timer = 0

    if (delta < 0) {
      projectSlider.next()
    } else {
      projectSlider.prev()
    }
  },

  init: () => {
    let projects = document.getElementsByClassName('project')
    projectSlider.total = projects.length
    document.getElementById('project-total').innerHTML = projectSlider.total
    projectSlider.scrollDelta = null

    // Event
    new S.WT(projectSlider.wheelEvent).on()
  },
  
  next: () => {
    projectSlider.isChange = true

    if (projectSlider.current === projectSlider.total) {
      return projectSlider.releaseWheelEvent()
    }

    let Y = (projectSlider.current - 1) * -100
    let moveY = Y - 100
    console.log(projectSlider.current, Y, moveY)

    let tl = new S.Timeline()
    tl.from({ el: '#projects', p: { y: [Y, moveY, '%'] }, d: 500, e: 'Power4Out', cb: projectSlider.releaseWheelEvent})
    tl.play()

    projectSlider.current++
  },

  prev: () => {
    projectSlider.isChange = true
    
    if (projectSlider.current === 1) {
      return projectSlider.releaseWheelEvent()
    }    

    let Y = (projectSlider.current - 1) * -100
    let moveY = Y + 100
    console.log(Y, moveY)

    let tl = new S.Timeline()
    tl.from({ el: '#projects', p: { y: [Y, moveY, '%'] }, d: 500, e: 'Power4Out', cb: projectSlider.releaseWheelEvent})
    tl.play()

    projectSlider.current--
  },

  releaseWheelEvent: () => {
    console.log('release')
    projectSlider.isChange = false
    projectSlider.foundScroll = false
    // isChanging = false
  }
}

let app = {
  init: () => {
    projectSlider.init()
  }
}

app.init()
