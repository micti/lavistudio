let cursorDetailLoading = (project) => {
  let tl = new S.Timeline()
  let id = project.id //'#' + id
  console.log(id)
  tl.from({el: '#cursor-text', p: {x: [0, -45, 'px']}, d: 500, e: 'Power4Out'})
  tl.from({el: project, p: {height: [50, 100, 'vh']}, d: 500, e: 'Power4Out'})
  tl.from({el: '.movex101', p: {x: [0, -365, 'px']}, d: 500, e: 'Power4Out'})
  tl.from({el: project, p: {y: [0, -25, 'vh']}, d: 500, e: 'Power4Out'})

  tl.play()
}

let main = () => {
  console.log('ok')
  let stopWheelEvent = false
  let isDetailView = false
  let releaseWheelEvent = () => {
    stopWheelEvent = false
  }
  let project = 1
  let totalProject = 3;
  let current = 0;

  nextProject = () => {
    if (project === totalProject) {
      return releaseWheelEvent()
    }

    let now = current
    let end = now - 75
    current = end
    console.log(now, end)
    project++

    let tl = new S.Timeline()
    tl.from({el: '.name', p: {x: [-140, -180, 'px'], opacity: [1, 0]}, d: 500, e: 'Power4Out'})
    tl.from({el: '.movex100', p: {x: [0, -100, '%']}, d: 500, e: 'Power4Out'})
    tl.from({el: '#project-wrap', p: {y: [now, end, 'vh']}, d: 1000, delay: 500, e: 'Power4Out'})
    tl.from({el: '.movex100', p: {x: [-100, 0, '%']}, d: 500, delay: 1500, e: 'Power4Out'})
    tl.from({el: '.name', p: {x: [-180, -140, 'px'], opacity: [0, 1]}, d: 500, delay: 0, e: 'Power4Out', cb: releaseWheelEvent})

    tl.play()

  }

  prevProject = () => {
    if (project === 1) {
      return releaseWheelEvent()
    }

    let now = current
    let end = now + 75
    current = end
    console.log(now, end)
    project--
    let tl = new S.Timeline()
    tl.from({el: '.name', p: {x: [-140, -180, 'px'], opacity: [1, 0]}, d: 500, e: 'Power4Out'})
    tl.from({el: '.movex100', p: {x: [0, -100, '%']}, d: 500, e: 'Power4Out'})
    tl.from({el: '#project-wrap', p: {y: [now, end, 'vh']}, d: 1000, delay: 500, e: 'Power4Out'})
    tl.from({el: '.movex100', p: {x: [-100, 0, '%']}, d: 500, delay: 1500, e: 'Power4Out'})
    tl.from({el: '.name', p: {x: [-180, -140, 'px'], opacity: [0, 1]}, d: 500, delay: 0, e: 'Power4Out', cb: releaseWheelEvent})


    tl.play()
  }

  S.L('.project', 'add', 'click', (e) => {
      if (isDetailView) return
      isDetailView = true

      let el = document.querySelector('.cursor')
      let parent = e.target.closest('.project')

      el.style['top'] = e.pageY  - 41 + 'px'
      el.style['left'] = e.pageX  - 41 + 'px'
      el.classList.add('active')
      parent.classList.add('clicked')

      cursorDetailLoading(parent)
  })

  S.L('.project', 'add', 'mouseleave', (e) => {
    // let parent = e.target.closest('.project')
    // parent.classList.remove('clicked')
})

  S.L(document, 'add', 'mouseWheel', (e) => {
    if (isDetailView) return
    if (stopWheelEvent) return
    stopWheelEvent = true
    if (e.deltaY > 0) {
      // hideProjectName.play({cb: nextProject})
      nextProject()
    } else {
      // hideProjectName.play({cb: prevProject})
      prevProject()
    }
  })
}

S.L(document, 'add', 'DOMContentLoaded', main)


