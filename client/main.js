let main = () => {

  let stopWheelEvent = false
  let isDetailView = false

  let releaseWheelEvent = () => {
    stopWheelEvent = false
  }

  let project = 1
  let totalProject = 3;
  let current = 0;
  let currentDetailProject = null

  let cursorEl = document.querySelector('.cursor')
  let rectangleOnRight = document.getElementById('rectange-on-right')
  let closeDetailButton = document.getElementById('close-detail')
  let pd = document.getElementById("project-detail")


  let cursorDetailLoading = (project) => {
    currentDetailProject = project
    let tl = new S.Timeline()
    tl.from({el: '#cursor-text', p: {x: [0, -45, 'px']}, d: 500, e: 'Power4Out'})
    tl.from({el: project, p: {height: [50, 100, 'vh']}, d: 500, e: 'Power4Out'})
    tl.from({el: '.movex101', p: {x: [0, -365, 'px']}, d: 500, e: 'Power4Out'})
    tl.from({el: rectangleOnRight, p: {x: [0, 30, 'vw']}, d: 500, e: 'Power4Out'})
    tl.from({el: project, p: {y: [0, -25, 'vh']}, d: 500, e: 'Power4Out', cb: openDetail})
    tl.play()

  }

  let openDetail = () => {
    currentDetailProject.classList.remove('clicked')
    cursorEl.classList.remove('active')
    pd.classList.add('active')
    pd.scrollTop = 0
    new S.Merom({el: closeDetailButton, p: {y: [22, 0, 'px']}, d: 500, e: 'Power4Out'}).play()
  }

  let closeDetail = () => {
    pd.classList.remove('active')
    new S.Merom({el: closeDetailButton, p: {y: [0, -22, 'px']}, d: 500, e: 'Power4Out'}).play({cb: () => {
      let tl = new S.Timeline()
      tl.from({el: '#cursor-text', p: {x: [-45, 0, 'px']}, d: 500, e: 'Power4Out'})
      tl.from({el: currentDetailProject, p: {height: [100, 50, 'vh']}, d: 500, e: 'Power4Out'})
      tl.from({el: '.movex101', p: {x: [-365, 0, 'px']}, d: 500, e: 'Power4Out'})
      tl.from({el: rectangleOnRight, p: {x: [30, 0, 'vw']}, d: 500, e: 'Power4Out'})
      tl.from({el: currentDetailProject, p: {y: [-25, 0, 'vh']}, d: 500, e: 'Power4Out'})
      tl.play()
      currentDetailProject = null
    }})
  }

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
    tl.from({el: '.name', p: {x: [-25, -30, 'vw'], opacity: [1, 0]}, d: 500, e: 'Power4Out'})
    tl.from({el: '.movex100', p: {x: [0, -100, '%']}, d: 500, e: 'Power4Out'})
    tl.from({el: '#project-wrap', p: {y: [now, end, 'vh']}, d: 1000, delay: 500, e: 'Power4Out'})
    tl.from({el: '.movex100', p: {x: [-100, 0, '%']}, d: 500, delay: 1500, e: 'Power4Out'})
    tl.from({el: '.name', p: {x: [-30, -25, 'vw'], opacity: [0, 1]}, d: 500, delay: 0, e: 'Power4Out', cb: releaseWheelEvent})

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
    tl.from({el: '.name', p: {x: [-25, -30, 'vw'], opacity: [1, 0]}, d: 500, e: 'Power4Out'})
    tl.from({el: '.movex100', p: {x: [0, -100, '%']}, d: 500, e: 'Power4Out'})
    tl.from({el: '#project-wrap', p: {y: [now, end, 'vh']}, d: 1000, delay: 500, e: 'Power4Out'})
    tl.from({el: '.movex100', p: {x: [-100, 0, '%']}, d: 500, delay: 1500, e: 'Power4Out'})
    tl.from({el: '.name', p: {x: [-30, -25, 'vw'], opacity: [0, 1]}, d: 500, delay: 0, e: 'Power4Out', cb: releaseWheelEvent})


    tl.play()
  }

  S.L('.project', 'add', 'click', (e) => {
    if (isDetailView) return
    isDetailView = true

    let parent = e.target.closest('.project')

    cursorEl.style['top'] = e.pageY  - 41 + 'px'
    cursorEl.style['left'] = e.pageX  - 41 + 'px'
    cursorEl.classList.add('active')
    parent.classList.add('clicked')

    cursorDetailLoading(parent)
  })

  S.L(closeDetailButton, 'add', 'click', (e) => {
    if (!isDetailView) return
    isDetailView = false

    closeDetail()
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

  // next project
  S.L('#next-project', 'add', 'click', () => {
    // Huy click
    // Transform len 75
  })
}

S.L(document, 'add', 'DOMContentLoaded', main)


