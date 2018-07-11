// Effect
class ImageEffect {
  constructor (element, url) {
    this.width = 1000;
    this.height = 1300;
    this.playground = element
    this.count = 0;
    this.raf;
    this.renderer = PIXI.autoDetectRenderer(this.width, this.height, {transparent:true});
    this.renderer.autoResize = true;
    this.playground.appendChild(this.renderer.view);
    this.stage = new PIXI.Container();
    console.log(url)
    this.tp = PIXI.Texture.fromImage(url);
    this.preview = new PIXI.Sprite(this.tp);
    this.preview.anchor.x = 0;
    this.displacementSprite = PIXI.Sprite.fromImage('/client/photo/clouds.jpg');
    this.displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
    this.displacementFilter = new PIXI.filters.DisplacementFilter(this.displacementSprite);
    this.displacementSprite.scale.y = 0.6;
    this.displacementSprite.scale.x = 0.6;
    this.stage.addChild(this.displacementSprite);
    this.stage.addChild(this.preview);
    this.animate();
  }

  removeScene() {
    cancelAnimationFrame(this.raf);
    this.stage.removeChildren();
    this.stage.destroy(true);
    this.playground.removeChild(this.canvas);
  }

  animate () {
    this.raf = requestAnimationFrame(() => {
      this.animate()
    });

    this.displacementSprite.x = this.count * 11;
	  this.displacementSprite.y = this.count * 11;

	  this.count += 0.5;
    this.stage.filters = [this.displacementFilter];
    this.renderer.render(this.stage);
    this.canvas = this.playground.querySelector('canvas');
  }
}

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
  let projectWrapper = document.getElementById("project-wrapper")

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
    tl.from({el: project, p: {y: [0, -25, 'vh']}, d: 500, e: 'Power4Out'})
    tl.play()

    let tl2 = new S.Timeline()
    tl2.from({el: '.category-text-mask', p: {x: [-150, 0, 'px']}, d: 500, e: 'Power4Out'})
    tl2.from({el: '.category-text', p: {x: [-150, 0, 'px']}, d: 0, delay: 500, e: 'Power4Out'})
    tl2.from({el: '.category-text-mask', p: {x: [0, 150, 'px']}, d: 500, e: 'Power4Out', cb: () => {
      new S.Merom({el: loadingCircle, line: {elWithLength: this.el, start: 0, end: 80}, d: 500, e: 'Power4Out', cb: loadContent}).play()
    }})
    tl2.play()
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

      let tl2 = new S.Timeline()
      tl2.from({el: '.category-text-mask', p: {x: [150, 0, 'px']}, d: 500, e: 'Power4Out'})
      tl2.from({el: '.category-text', p: {x: [0, -150, 'px']}, d: 0, delay: 500, e: 'Power4Out'})
      tl2.from({el: '.category-text-mask', p: {x: [0, -150, 'px']}, d: 500, e: 'Power4Out'})
      tl2.play()
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

    new S.Merom({el: closeDetailButton, p: {y: [0, -22, 'px']}, d: 500, e: 'Power4Out'}).play()
    let tl2 = new S.Timeline()
    tl2.from({el: '.category-text-mask', p: {x: [150, 0, 'px']}, d: 500, e: 'Power4Out'})
    tl2.from({el: '.category-text', p: {x: [0, -150, 'px']}, d: 0, delay: 500, e: 'Power4Out'})
    tl2.from({el: '.category-text-mask', p: {x: [0, -150, 'px']}, d: 500, e: 'Power4Out'})
    tl2.play()

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

  let nextProject = () => {
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

  let prevProject = () => {
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

  var ts;
  document.addEventListener('touchstart', function (e) {
    if (isDetailView) return
    if (isChangingProject) return
    ts = e.originalEvent.touches[0].clientY
  });

  document.addEventListener('touchend', function (e) {
    if (isDetailView) return
    if (isChangingProject) return
    var te = e.originalEvent.changedTouches[0].clientY
    if (ts > te + 5) {
      isChangingProject = true
      prevProject()
    } else if (ts < te - 5) {
      isChangingProject = true
      nextProject()
    }
  });
}

let preload = (cb) => {
  let manifest = [
    "01.jpg",
    "02.jpg",
    "03.jpg",
    "clouds.jpg",
    "avatar.png"
  ]
  let preload = new createjs.LoadQueue(true, "/client/photo/")

  preload.on("progress", () => {
    document.getElementById('loading-bar').style['transform'] = 'translateX(' + ((preload.progress * 2 * 100) - 200) + 'px)'
  })
  preload.on('complete', () => {
    document.getElementById('load').classList.add('is-loaded')
    setTimeout(() => {
      document.getElementById('load').classList.add('is-closed')
      cb()
    }, 500)
  })
  preload.setMaxConnections(5);

  while (manifest.length > 0) {
    var item = manifest.shift();
    preload.loadFile(item);
  }
}

let intro = () => {
  // Logo Lavi
  let L = Snap.select('#L')
  let A = Snap.select('#A')
  let V = Snap.select('#V')
  let I = Snap.select('#I')
  let tran1 = function(){
    L.animate({ d: 'M46.1238868,368.606044 L46.1238868,0.0364992047 L0.995847113,0.0364992047 L0.995847113,367.971815 C0.995847113,386.134652 0.995847113,402.603682 0.995847113,417.378906 L0.995847113,453.785703 L46.1238868,453.785703 L46.1238868,411.125 L46.1238868,399.117188 L46.1238868,392.488281 C46.1238868,385.71255 46.1238868,377.751804 46.1238868,368.606044 Z' }, 1000, mina.backout);
    A.animate({ d: 'M352.126833,119.847656 L352.126833,183.535156 C352.126833,207.290045 352.126833,228.006504 352.126833,245.684533 L352.126833,259.556489 L352.126833,431.275963 L352.126833,453.317734 L396.484519,453.317734 L396.484519,242.826492 C396.484519,217.02512 396.484519,208.336862 396.484519,216.761719 L396.484519,119.847656 L352.126833,119.847656 Z' }, 1000, mina.backout);
    V.animate({ d: 'M551.251859 127.292398 551.251859 450.740296 586.650095 450.740296 586.650095 127.292398 Z' }, 1000, mina.backout);
    I.animate({ d: 'M733.496361 450.740296 762.96875 450.740296 762.96875 127.292398 733.496361 127.292398' }, 1000, mina.backout, tran2);
  }
  let tran2 = function() {
    L.animate({ d: 'M56.1461876,400.579438 C49.4461965,392.99627 46.1238868,382.324685 46.1238868,368.606044 L46.1238868,0.0364992047 L0.995847113,0.0364992047 L0.995847113,367.971815 C0.995847113,395.21607 7.69583828,416.352428 21.0542917,431.31195 C34.3989023,446.299048 53.142266,453.785703 77.1459534,453.785703 L114.729581,453.785703 L114.729581,411.967978 L84.662679,411.967978 C72.3147614,411.967978 62.8461788,408.176394 56.1461876,400.579438;' }, 1000, mina.backout);
    A.animate({ d: 'M329.33569,406.61316 C314.123453,412.287417 292.801829,415.131516 265.275571,415.131516 C239.586212,415.131516 219.761319,410.014926 205.651221,399.837511 C191.609156,389.632213 184.588123,375.272299 184.588123,356.75777 C184.588123,339.302806 190.194064,325.765451 201.337912,316.215411 C212.549793,306.637488 228.442363,301.841556 248.961195,301.841556 L352.126833,301.841556 L352.126833,382.619556 C352.126833,392.950329 344.547928,400.938903 329.33569,406.61316 M270.514132,121.032116 C246.307898,121.032116 224.251514,125.186732 204.426622,133.495964 C184.64255,141.791254 168.695553,153.432543 156.558419,168.364065 L188.901432,191.088978 C212.495367,171.737948 240.334577,162.048492 272.364637,162.048492 C297.809077,162.048492 317.511509,169.367865 331.308655,183.978729 C345.22826,198.589593 352.126833,219.167489 352.126833,245.684533 L352.126833,259.556489 L248.648242,259.556489 C214.577185,259.556489 188.098639,268.019079 169.185393,284.958201 C150.272146,301.911264 140.856342,325.821218 140.856342,356.75777 C140.856342,388.93513 151.142972,413.876767 171.648197,431.540855 C192.167028,449.218885 221.108378,458.043958 258.499458,458.043958 C273.289889,458.043958 287.087035,456.789208 299.890895,454.265767 C312.762788,451.728384 324.165162,448.047785 334.138839,443.223969 C341.119051,439.822203 346.901878,435.709412 352.126833,431.275963 L352.126833,453.317734 L396.484519,453.317734 L396.484519,242.826492 C396.484519,204.124433 385.503951,174.135914 363.529208,152.90276 C341.527251,131.655664 310.55851,121.032116 270.514132,121.032116' }, 1000, mina.backout);
    V.animate({ d: 'M568.950977 392.477271 471.125621 127.292398 423.612408 127.292398 551.251859 450.740296 586.650095 450.740296 713.672135 127.292398 666.158922 127.292398 Z' }, 1000, mina.backout);
    I.animate({ d: 'M733.496361 450.740296 781.491855 450.740296 781.491855 127.292398 733.496361 127.292398' }, 1000, mina.backout);
  }

  let tl = new S.Timeline()
  tl.from({el: '.avatar', p: {opacity: [0, 0.5]}, d: 2000, e: 'Power4Out'}) // 0 - .5
  tl.from({el: '.is-animation-introtext', p: {x: [-365, 0, 'px']}, d: 500, delay: 2000, e: 'Power4Out', cb: displayProject}) // 2 - 2.5
  tran1()
  tl.play()
}

let displayProject = () => {
  photoEffect()

  let tl = new S.Timeline()
  tl.from({el: '.photo', p: {width: [0, 100, '%']}, d: 500, delay: 500, e: 'Power4Out'})
  tl.from({el: '.movex100', p: {x: [-100, 0, '%']}, d: 500, e: 'Power4Out'})
  tl.from({el: '.name', p: {x: [-30, -25, 'vw'], opacity: [0, 1]}, d: 500, e: 'Power4Out', cb: main})
  tl.from({el: '#rectange-on-right', p: {x: [30, 0, 'vw']}, d: 500, e: 'Power4Out'})
  tl.play()
}

let photoEffect = () => {
  new ImageEffect(document.getElementById('canvas-01'), '/client/photo/01.jpg')
  new ImageEffect(document.getElementById('canvas-02'), '/client/photo/02.jpg')
  new ImageEffect(document.getElementById('canvas-03'), '/client/photo/03.jpg')
}

S.L(document, 'add', 'DOMContentLoaded', () => {
  preload(intro)
})

// S.L(document, 'add', 'DOMContentLoaded', main)
// S.L(document, 'add', 'DOMContentLoaded', abc)


