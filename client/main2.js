let timer = 0;
setInterval(function () { timer += 50; }, 50);

let isChanging = false
let projectSlider = {
  total: 1,
  current: 0,
  isChange: false,

  wheelAndTouchEvent: (delta, type, event) => {
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

    // Event
    new S.WT(projectSlider.wheelAndTouchEvent).on()

    // Display first project after loading
    projectSlider.isChange = true
    projectSlider.change(1, null, 1)
  },
  
  next: () => {
    projectSlider.isChange = true

    if (projectSlider.current === projectSlider.total) {
      projectSlider.change(1, projectSlider.current, 1)
    } else {
      projectSlider.change(projectSlider.current + 1, projectSlider.current, 1)
    }
  },

  prev: () => {
    projectSlider.isChange = true
    
    if (projectSlider.current === 1) {
      projectSlider.change(projectSlider.total, 1, -1)
    } else {
      projectSlider.change(projectSlider.current - 1, projectSlider.current, -1)
    }
  },

  change: (nextProject, prevProject, direction) => {
    let tl = new S.Timeline()
    let timer = 0
    if (prevProject !== null) {
      let pname1x = document.querySelectorAll('#project-' + prevProject + ' .project-name span.speed-1x')
      let pname2x = document.querySelectorAll('#project-' + prevProject + ' .project-name span.speed-2x')
      let pname3x = document.querySelectorAll('#project-' + prevProject + ' .project-name span.speed-3x')
      let pcover = document.querySelector('#project-' + prevProject + ' .project-cover .cover')
      tl.from({el: pname1x, p: { y: [0, -300 * direction, '%'] }, d: 1000, e: 'Power4Out'})
      tl.from({el: pname2x, p: { y: [0, -200 * direction, '%'] }, d: 1000, e: 'Power4Out'})
      tl.from({el: pname3x, p: { y: [0, -100 * direction, '%'] }, d: 1000, e: 'Power4Out'})
      tl.from({el: pcover , p: { y: [0, -100 * direction, '%'] }, d: 1000, e: 'Power4Out'})
      timer += 1000
    }

    console.log('A')

    let nname1x = document.querySelectorAll('#project-' + nextProject + ' .project-name span.speed-1x')
    let nname2x = document.querySelectorAll('#project-' + nextProject + ' .project-name span.speed-2x')
    let nname3x = document.querySelectorAll('#project-' + nextProject + ' .project-name span.speed-3x')
    let ncover = document.querySelector('#project-' + nextProject + ' .project-cover .cover')
    tl.from({el: nname1x, p: { y: [300 * direction, 0, '%'] }, d: 1000, delay: timer / 2, e: 'Power4Out'})
    tl.from({el: nname2x, p: { y: [200 * direction, 0, '%'] }, d: 1000, delay: 0, e: 'Power4Out'})
    tl.from({el: nname3x, p: { y: [100 * direction, 0, '%'] }, d: 1000, delay: 0, e: 'Power4Out'})
    tl.from({el: ncover , p: { y: [100 * direction, 0, '%'] }, d: 1000, delay: 0, e: 'Power4Out', cb: projectSlider.releaseWheelEvent})

    projectSlider.current = nextProject
    tl.play()
  },

  releaseWheelEvent: () => {
    projectSlider.isChange = false
  }
}

let app = {
  init: () => {
    projectSlider.init()
  }
}

app.init()
