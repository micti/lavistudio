let main = () => {

  let isChangingProject = false
  let isDetailView = false

  let project = 1
  let totalProject = 3;
  let current = 0;
  let currentDetailProject = null

  let cursorEl = document.querySelector('.cursor')
  let loadingCircle = document.getElementById('loading-circle')

  let rectangleOnRight = document.getElementById('rectange-on-right')
  let closeDetailButton = document.getElementById('close-detail')
  let pd = document.getElementById("project-detail")
  let projectWrapper = document.getElementById("project-wrap")


  let openDetail = (event, project) => {
    // Tiến trình
    // 1. Animation chuyển cảnh (kéo dài hình lên tràn màn hình, dấu các thông tin khác)
    // 2. Loading (animation hình tròn)
    // 3. Chèn nội dung chi tiết vào (animation 0 -> 1)
    // 4. Hiện thỉ close button

    //
    let loadDone = (data) => {
        currentDetailProject.classList.remove('clicked')
        cursorEl.classList.remove('active')
        loadingCircle.style['opacity'] = 0
        pd.innerHTML = data
        pd.classList.add('active')
        pd.scrollTop = 0
        S.L('#next-project', 'add', 'click', nextProjectDetail)
        new S.Merom({el: pd, p: {opacity: [0, 1]}, d: 500, e: 'Power4Out'}).play()
        new S.Merom({el: closeDetailButton, p: {y: [22, 0, 'px']}, d: 500, e: 'Power4Out'}).play()
    }

    let loadContent = () => {
      let id = currentDetailProject.getAttribute('data-project-id')
      fetch('/project_' + id + '.txt').then(res => {
        return res.text()
      }).then(data => {
        new S.Merom({el: loadingCircle, line: {elWithLength: this.el, start: 80, end: 100}, d: 500, e: 'Power4Out', cb: () => {
          loadDone(data)
        }}).play()
      }).catch(e => {
        console.log(e)
      })
    }

    currentDetailProject = project

    // Hiển thị chuột
    cursorEl.style['top'] = event.pageY  - 41 + 'px'
    cursorEl.style['left'] = event.pageX  - 41 + 'px'
    cursorEl.classList.add('active')

    // Thiết lập trạng thái đã click vào project el
    currentDetailProject.classList.add('clicked')

    // Animation chuyển cảnh
    let tl = new S.Timeline()
    tl.from({el: '#cursor-text', p: {x: [0, -45, 'px']}, d: 500, e: 'Power4Out'})
    tl.from({el: project, p: {height: [50, 100, 'vh']}, d: 500, e: 'Power4Out'})
    tl.from({el: '.movex101', p: {x: [0, -365, 'px']}, d: 500, e: 'Power4Out'})
    tl.from({el: rectangleOnRight, p: {x: [0, 30, 'vw']}, d: 500, e: 'Power4Out'})
    tl.from({el: project, p: {y: [0, -25, 'vh']}, d: 500, e: 'Power4Out', cb: () => {
      new S.Merom({el: loadingCircle, line: {elWithLength: this.el, start: 0, end: 80}, d: 500, e: 'Power4Out', cb: loadContent}).play()
    }})
    tl.play()
  }

  let closeDetail = () => {
    new S.Merom({el: closeDetailButton, p: {y: [0, -22, 'px']}, d: 500, e: 'Power4Out'}).play()
    new S.Merom({el: pd, p: {opacity: [1, 0]}, d: 1000, e: 'Power4Out'}).play({cb: () => {
      pd.classList.remove('active')
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

  let nextProjectDetail = () => {
    let nextProjectEl = currentDetailProject.nextElementSibling

    if (!nextProjectEl) {
      return
    }

    let id = nextProjectEl.getAttribute('data-project-id')
    // let v = id * 75 - 75

    currentDetailProject.style['height'] = '50vh'
    currentDetailProject.style['transform'] = 'translate3d(0px, 0px, 0px)'
    // document.getElementById('project-wrap').style['transform'] = 'translate3d(0px, -' + v + 'vh, 0px)'

    new S.Merom({el: closeDetailButton, p: {y: [0, -22, 'px']}, d: 500, e: 'Power4Out'}).play()
    new S.Merom({el: pd, p: {opacity: [1, 0]}, d: 1000, e: 'Power4Out'}).play({cb: () => {
      pd.classList.remove('active')
      isDetailView = false
      // project++
      // isChangingProject = true
      nextProject()
      setTimeout(() => {
        // isChangingProject = false

        let e = document.createEvent('HTMLEvents')
        e.initEvent('click', false, true)
        nextProjectEl.dispatchEvent(e)
      }, 2500)
    }})
  }

  /* PROJECT SLIDE */
  let releaseWheelEvent = () => {
    isChangingProject = false
  }

  nextProject = () => {
    if (project === totalProject) {
      return releaseWheelEvent()
    }

    let now = current
    let end = now - 75
    current = end
    project++

    let tl = new S.Timeline()
    tl.from({el: '.name', p: {x: [-25, -30, 'vw'], opacity: [1, 0]}, d: 500, e: 'Power4Out'})
    tl.from({el: '.movex100', p: {x: [0, -100, '%']}, d: 500, e: 'Power4Out'})
    tl.from({el: projectWrapper, p: {y: [now, end, 'vh']}, d: 1000, delay: 500, e: 'Power4Out'})
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
    project--
    let tl = new S.Timeline()
    tl.from({el: '.name', p: {x: [-25, -30, 'vw'], opacity: [1, 0]}, d: 500, e: 'Power4Out'})
    tl.from({el: '.movex100', p: {x: [0, -100, '%']}, d: 500, e: 'Power4Out'})
    tl.from({el: projectWrapper, p: {y: [now, end, 'vh']}, d: 1000, delay: 500, e: 'Power4Out'})
    tl.from({el: '.movex100', p: {x: [-100, 0, '%']}, d: 500, delay: 1500, e: 'Power4Out'})
    tl.from({el: '.name', p: {x: [-30, -25, 'vw'], opacity: [0, 1]}, d: 500, delay: 0, e: 'Power4Out', cb: releaseWheelEvent})

    tl.play()
  }

  /* EVENT */
  S.L('.project', 'add', 'click', (e) => {
    if (isDetailView) return
    isDetailView = true
    let selectedProject = e.target.closest('.project')

    openDetail(e, selectedProject)
  })

  S.L(closeDetailButton, 'add', 'click', (e) => {
    if (!isDetailView) return
    isDetailView = false

    closeDetail()
  })

  S.L(document, 'add', 'mouseWheel', (e) => {
    if (isDetailView) return
    if (isChangingProject) return
    isChangingProject = true
    if (e.deltaY > 0) {
      nextProject()
    } else {
      prevProject()
    }
  })
}

S.L(document, 'add', 'DOMContentLoaded', main)


