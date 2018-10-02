/*

S.BindMaker(this, ['scrollCb'])

this.scroll = new S.Scroll(this.scrollCb)

this.scroll.on()
this.scroll.off()

scrollCb (currentScrollY, delta, event) {

}

*/

S.Scroll1 = function (el, cb) {
  this.cb = cb
  this.el = el
  this.tick = false

  S.BindMaker(this, ['getRaf', 'run'])
}

S.Scroll1.prototype = {

  on: function () {
      this.startScrollY = this.el.scrollTop

      this.l('add')
  },

  off: function () {
      this.l('remove')
  },

  l: function (action) {
      S.L(this.el, action, 'scroll', this.getRaf)
  },

  getRaf: function (e) {
      this.e = e

      if (!this.tick) {
          this.raf = requestAnimationFrame(this.run)
          this.tick = true
      }
  },

  run: function () {
      var currentScrollY = this.el.scrollTop
      var delta = -(currentScrollY - this.startScrollY)

      // Reset start scroll y
      this.startScrollY = currentScrollY

      this.cb(currentScrollY, delta, this.e)
      this.tick = false
  }

}

// Effect
class ImageEffect {
  constructor (element, url) {
    this.width = 946 * 2;
    this.height = 1080 * 2;
    this.playground = element
    this.count = 0;
    this.raf;
    this.renderer = PIXI.autoDetectRenderer(this.width, this.height, {transparent:true});
    this.renderer.autoResize = true;
    this.playground.appendChild(this.renderer.view);
    this.stage = new PIXI.Container();
    this.tp = PIXI.Texture.fromImage(url);
    this.preview = new PIXI.Sprite(this.tp);
    this.preview.anchor.x = 0;
    this.preview.anchor.y = 0;
    this.displacementSprite = PIXI.Sprite.fromImage('/client/photo/clouds.jpg');
    this.displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
    this.displacementFilter = new PIXI.filters.DisplacementFilter(this.displacementSprite);
    this.displacementSprite.scale.y = 0.8;
    this.displacementSprite.scale.x = 0.8;
    this.stage.addChild(this.displacementSprite);
    this.stage.addChild(this.preview);
  }

  removeScene() {
    cancelAnimationFrame(this.raf);
  }

  animate () {
    this.raf = requestAnimationFrame(() => {
      this.animate()
    });

    this.displacementSprite.x = this.count * 12;
	  this.displacementSprite.y = this.count * 12;

	  this.count += 0.5;
    this.stage.filters = [this.displacementFilter];
    this.renderer.render(this.stage);
  }
}

let projectSlider = {
  total: 1,
  current: 0,
  timer: 0,
  isChange: false,
  isStop: false,
  projectEffect: [],
  totalEl: document.getElementById('project-total'),
  currentEl: document.getElementById('project-current'),
  autoplayEl: document.getElementById('autoplay-timer'),
  autoplayAnimation: null,

  wheelAndTouchEvent: (delta, type, event) => {
    if (projectSlider.isStop) {
      return
    }

    if (projectSlider.isChange) {
      projectSlider.timer = 0
      return
    }

    if (projectSlider.timer < 500) {
      return
    }

    projectSlider.timer = 0

    if (delta < 0) {
      projectSlider.next()
    } else {
      projectSlider.prev()
    }
  },

  autoPlayEvent: () => {
    projectSlider.autoplayAnimation = new S.Merom({el: projectSlider.autoplayEl, p: {x: [-100, 0, '%']}, d: 10000, e: 'linear', cb: projectSlider.next})
    projectSlider.autoplayAnimation.play()
  },

  init: () => {
    projectSlider.isStop = false;
    let projects = document.getElementsByClassName('project')
    projectSlider.total = projects.length
    document.getElementById('project-total').innerHTML = projectSlider.total

    projectSlider.autoplayAnimation = new S.Merom({el: '#autoplay-timer', p: {x: [-100, 0, '%']}, d: 10000, e: 'Power4Out', cb: projectSlider.next})

    // Timer
    projectSlider.timer = 0
    setInterval(() => { projectSlider.timer += 50 }, 50)

    // Event
    projectSlider.scrollEvent = new S.WT(projectSlider.wheelAndTouchEvent)
    projectSlider.scrollEvent.on()

    // Display first project after loading
    projectSlider.isChange = true
    projectSlider.change(1, null, 1)
  },
  
  next: () => {
    projectSlider.isChange = true
    projectSlider.cancelAutoPlay()

    if (projectSlider.current === projectSlider.total) {
      projectSlider.change(1, projectSlider.current, 1)
    } else {
      projectSlider.change(projectSlider.current + 1, projectSlider.current, 1)
    }
  },

  prev: () => {
    projectSlider.isChange = true
    projectSlider.cancelAutoPlay()
    
    if (projectSlider.current === 1) {
      projectSlider.change(projectSlider.total, 1, -1)
    } else {
      projectSlider.change(projectSlider.current - 1, projectSlider.current, -1)
    }
  },

  change: (nextProject, prevProject, direction) => {
    let tl = new S.Timeline()
    let timer = 0
    let animateTime = 1200;
    
    // Prepare for next project
    if (nextProject !== null) {
      if (projectSlider.projectEffect[nextProject] === undefined) {
        projectSlider.projectEffect[nextProject] = new ImageEffect(document.querySelector('#project-' + nextProject + ' .canvas'), 'photos/' + (nextProject > 9 ? '' : '0') + nextProject + '-cover.png')
      }

      projectSlider.projectEffect[nextProject].animate()
    }

    if (prevProject !== null) {
      let pname1x = document.querySelectorAll('#project-' + prevProject + ' span.speed-1x')
      let pname2x = document.querySelectorAll('#project-' + prevProject + ' span.speed-2x')
      let pname3x = document.querySelectorAll('#project-' + prevProject + ' span.speed-3x')
      let pcover = document.querySelector('#project-' + prevProject + ' .project-cover .cover')
      tl.from({el: pname1x, p: { y: [0, -300 * direction, '%'] }, d: animateTime, e: 'Power4Out'})
      tl.from({el: pname2x, p: { y: [0, -200 * direction, '%'] }, d: animateTime, e: 'Power4Out'})
      tl.from({el: pname3x, p: { y: [0, -100 * direction, '%'] }, d: animateTime, e: 'Power4Out'})
      tl.from({el: projectSlider.currentEl, p: { y: [0, -100 * direction, '%'] }, d: animateTime / 2, e: 'Power4Out', cb: projectSlider.updateCurrentStatus})
      tl.from({el: pcover, p: { y: [0, -100 * direction, '%'] }, d: animateTime, e: 'Power4Out', cb: () => { projectSlider.clearProject(prevProject) }})
      timer += animateTime
    }

    if (nextProject !== null) {
      document.getElementById('project-' + nextProject).style.display = 'flex'
      let nname1x = document.querySelectorAll('#project-' + nextProject + ' span.speed-1x')
      let nname2x = document.querySelectorAll('#project-' + nextProject + ' span.speed-2x')
      let nname3x = document.querySelectorAll('#project-' + nextProject + ' span.speed-3x')
      let ncover = document.querySelector('#project-' + nextProject + ' .project-cover .cover')
      tl.from({el: nname1x, p: { y: [300 * direction, 0, '%'] }, d: animateTime, delay: timer / 2, e: 'Power4Out'})
      tl.from({el: nname2x, p: { y: [200 * direction, 0, '%'] }, d: animateTime, delay: 0, e: 'Power4Out'})
      tl.from({el: nname3x, p: { y: [100 * direction, 0, '%'] }, d: animateTime, delay: 0, e: 'Power4Out'})
      tl.from({el: projectSlider.currentEl, p: { y: [100 * direction, 0, '%'] }, d: animateTime / 2, e: 'Power4Out'})
      tl.from({el: ncover , p: { y: [100 * direction, 0, '%'] }, d: animateTime, delay: 0, e: 'Power4Out', cb: projectSlider.releaseWheelEvent})

      projectSlider.current = nextProject
    }

    tl.play()
  },

  updateCurrentStatus: () => {
    projectSlider.currentEl.innerText = projectSlider.current
  },
  
  clearProject: (project) => {
    console.log(project)
    document.getElementById("project-" + project).style.display = 'none'
    if (projectSlider.projectEffect[project] !== null) {
      projectSlider.projectEffect[project].removeScene()
    } 
  },

  releaseWheelEvent: () => {
    projectSlider.isChange = false
    projectSlider.runAutoPlay()
  },

  cancelAutoPlay: () => {
    projectSlider.autoPlay = false
    projectSlider.autoplayAnimation.pause()
  },

  runAutoPlay: () => {
    projectSlider.autoPlay = true
    projectSlider.autoPlayEvent()
  },

  stop: () => {
    projectSlider.isStop = true
    projectSlider.cancelAutoPlay()
    projectSlider.scrollEvent.off()
    if (projectSlider.projectEffect[projectSlider.current] !== null) {
      projectSlider.projectEffect[projectSlider.current].removeScene()
    }
  },

  start: () => {
    projectSlider.isStop = false
    projectSlider.runAutoPlay()
    projectSlider.scrollEvent.on()
    if (projectSlider.projectEffect[projectSlider.current] !== null) {
      projectSlider.projectEffect[projectSlider.current].animate()
    }
  
  }
}

let contactPage = {
  contactButton: null,
  contactPage: null,
  backButton: null,
  isOpen: false,
  init: () => {
    contactPage.contactButton = document.getElementById("contact-button")
    contactPage.contactPage = document.getElementById("contact-page")
    contactPage.backButton = document.getElementById("back-button")
    contactPage.newProjectButton = document.getElementById("new-project-button")
    S.L(contactPage.contactButton, 'add', 'click', contactPage.click)
    S.L(contactPage.newProjectButton, 'add', 'click', contactPage.goToNewProject)
    S.L(contactPage.backButton, 'add', 'click', contactPage.backToInfo)
  },

  goToNewProject: () => {
    new S.Merom({el: '#contact-page-wrapper', p: {x: [0, -50, '%']}, d: 750, e: 'Power4Out', cb: () => {
      contactPage.backButton.classList.add('active')
    }}).play()
  },

  backToInfo: () => {
    contactPage.backButton.classList.remove('active')
    new S.Merom({el: '#contact-page-wrapper', p: {x: [-50, 0, '%']}, d: 750, e: 'Power4Out'}).play()
  },

  click: () => {
    // alert(contactPage.isOpen)
    if (contactPage.isOpen === false) {
      contactPage.contactButton.classList.add('hover')
      return contactPage.open()
    }

    contactPage.close()
  },

  close: () => {
    let loadsc = document.getElementById('load-screen')
    let load = document.getElementById('load')
    load.style.transform = 'translateX(-100%)'
    loadsc.style.transform = 'translateX(0)'
    loadsc.style.zIndex = 60;
    contactPage.contactButton.classList.remove('active')
    contactPage.contactButton.classList.remove('hover')
    new S.Merom({el: '#load', p: {x: [-100, 0, '%']}, d: 700, e: 'Power4Out', cb: () => {
      contactPage.contactPage.style.display = 'none'
      contactPage.contactPage.style.zIndex = 40
      projectSlider.start()
      new S.Merom({el: '#load', p: {x: [0, 100, '%']}, d: 700, e: 'Power4Out', cb: () => {
        loadsc.style.zIndex = 0;
        loadsc.style.transform = 'translateX(-100%)'
        contactPage.isOpen = false
      }}).play()
    }}).play()
  },
  open: () => {
    let load = document.getElementById('load')
    let loadsc = document.getElementById('load-screen')

    // let imagedata = project.getAttribute('data-image')
    let images = ['01', '02', '03', '04', '05', '06', '01', '02', '03', '04', '05', '06']

    // Prepare flashing load
    let loadPhotos = load.querySelector('.photos')
    loadPhotos.innerHTML = ''
    let divImages = []
    for (const image of images) {
      let newImage = document.createElement("img");
      newImage.src = '/photos/' + image + '-lo.png'

      let newDivImage = document.createElement("div");
      newDivImage.classList.add('photo')
      newDivImage.appendChild(newImage)
      
      loadPhotos.appendChild(newDivImage)
      divImages.push(newDivImage)
    }

    let effectDone = false

    // loading
    loadsc.style.transform = 'translateX(0)'
    load.style.transform = 'translateX(-100%)'
    loadsc.style.zIndex = 60;
    
    new S.Merom({el: '#load', p: {x: [-100, 0, '%']}, d: 700, e: 'Power4Out', cb: () => {
      projectSlider.stop()
      let tl = new S.Timeline()
      tl.from({el: divImages[0], p: {opacity: [0, 1]}, d: 100, e: 'Power4Out'})
      tl.from({el: divImages[0], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[1], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[1], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[2], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[2], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[3], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[3], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[4], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[4], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[5], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[5], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[6], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[6], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[7], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[7], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[8], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[8], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[9], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[9], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[10], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[10], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[11], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[11], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out', cb: () => {
        effectDone = true
        projectSlider.stop()
        contactPage.contactPage.style.display = 'block'
        contactPage.contactPage.style.zIndex = 41
        // contactPage.contactPage.innerHTML = text
        contactPage.isOpen = true
        new S.Merom({el: load, p: {x: [0, 100, '%']}, d: 700, e: 'Power4Out', cb: () => {
          contactPage.contactButton.classList.add('active')
          loadsc.style.zIndex = 0;
          loadsc.style.transform = 'translateX(-100%)'
        }}).play()
      }})
      tl.play()
    }}).play()
  }
}

let projectDetail = {
  init: () => {
    // close
    S.L('#logo-home', 'add', 'click', projectDetail.close)
    // event
    S.L('.project-detail-link', 'add', 'click', projectDetail.open)
  },

  open: (e) => {
    e.preventDefault()
    let load = document.getElementById('load')
    let loadsc = document.getElementById('load-screen')
    // let pd = document.getElementById('project-page')

    // Get project info
    let project = e.target.closest('.project-detail-link')
    let id = project.getAttribute('data-id')
    // let imagedata = project.getAttribute('data-image')
    let images = ['01', '02', '03', '04', '05', '06', '01', '02', '03', '04', '05', '06']

    // Prepare flashing load
    let loadPhotos = load.querySelector('.photos')
    loadPhotos.innerHTML = ''
    let divImages = []
    for (const image of images) {
      let newImage = document.createElement("img");
      newImage.src = '/photos/' + image + '-lo.png'

      let newDivImage = document.createElement("div");
      newDivImage.classList.add('photo')
      newDivImage.appendChild(newImage)
      
      loadPhotos.appendChild(newDivImage)
      divImages.push(newDivImage)
    }

    let effectDone = false

    // loading
    loadsc.style.transform = 'translateX(0)'
    load.style.transform = 'translateX(-100%)'
    loadsc.style.zIndex = 60;
    
    new S.Merom({el: '#load', p: {x: [-100, 0, '%']}, d: 700, e: 'Power4Out', cb: () => {
      projectSlider.stop()
      let tl = new S.Timeline()
      tl.from({el: divImages[0], p: {opacity: [0, 1]}, d: 100, e: 'Power4Out'})
      tl.from({el: divImages[0], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[1], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[1], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[2], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[2], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[3], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[3], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[4], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[4], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[5], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[5], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[6], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[6], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[7], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[7], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[8], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[8], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[9], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[9], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[10], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[10], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[11], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[11], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out', cb: () => {
        effectDone = true
      }})
      tl.play()
    }}).play()

    fetch('project_' + id + '.txt?f').then((res) => {
      res.text().then((text) => {
        let wait = () => {
          if (!effectDone) {
            setTimeout(() => {
              wait()
            }, 100)
          } else {
            projectDetail.initProject(id, text)
            projectDetail.openCover()
          }
        }
        wait()
      });
    })
  },

  initProject: (project, content) => {
    document.getElementById('project-page').innerHTML = content
    // event
    S.L('.project-detail-link', 'add', 'click', projectDetail.open)
  },

  close: () => {
    let pd = document.getElementById('project-page')
    let logo = document.getElementById('logo-home')
    let loadsc = document.getElementById('load-screen')
    let load = document.getElementById('load')
    load.style.transform = 'translateX(-100%)'
    loadsc.style.transform = 'translateX(0)'
    loadsc.style.zIndex = 60;
    logo.style.opacity = 0
    new S.Merom({el: '#load', p: {x: [-100, 0, '%']}, d: 700, e: 'Power4Out', cb: () => {
      pd.style.display = 'none'
      logo.style.display = 'none'
      projectSlider.start()
      new S.Merom({el: '#load', p: {x: [0, 100, '%']}, d: 700, e: 'Power4Out', cb: () => {
        loadsc.style.zIndex = 0;
        loadsc.style.transform = 'translateX(-100%)'
      }}).play()
    }}).play()
  },

  openCover: () => {
    let load = document.getElementById('load')
    
    let pd = document.getElementById('project-page')
    let cover = document.getElementById('project-page-cover')
    let logo = document.getElementById('logo-home')

    // load.style.zIndex = 0;
    // loadsc.style.zIndex = 0;
    // loadsc.style.transform = 'translateX(-100%)'
    pd.style.display = 'block'
    logo.style.display = 'block'
    pd.scrollTop = 0

    logo.style.opacity = 1
    // new S.Merom({el: cover, p: {x: [100, 0, '%']}, d: 700, e: 'Power4Out', cb: projectDetail.openContent}).play()
    new S.Merom({el: load, p: {x: [0, 100, '%']}, d: 700, e: 'Power4Out', cb: projectDetail.openContent}).play()
  },

  openContent: () => {
    let cover = document.getElementById('project-page-cover')
    let loadsc = document.getElementById('load-screen')
    loadsc.style.zIndex = 0;
    loadsc.style.transform = 'translateX(-100%)'
    new S.Merom({el: cover, p: {opacity: [0, 1]}, d: 1500, e: 'Power4Out'}).play()
    // document.getElementById('project-page-content').style.display = 'block'
  }
}

let app = {
  init: () => {
    projectSlider.init()
    projectDetail.init()
    contactPage.init()
  }
}

class Parallax {
  constructor (el, els) {
    this.el = el
    this.class = els
    this.els = this.el.getElementsByClassName(this.class)
    this.ss = []
    this.el.scrollTo(0, 0)
    for (const sub of this.els) {
      console.log(sub.getBoundingClientRect())
      this.ss.push({
        x1: sub.getBoundingClientRect().top,
        x2: sub.getBoundingClientRect().top + sub.getBoundingClientRect().height
      })
    }
    console.log(this.ss)
    this.w = window.height
    this.elw = this.el.height
    this.css = 0
    this.isOff = false
  }

  cb () {
    //console.log('a')
    let top = this.el.scrollTop
    document.getElementById('debug').innerText = top
    // find sc
    for (let i = 0; i < this.ss.length; i++) {
      const ss = this.ss[i];
      if (ss.x1 <= top && ss.x2 >= top) {
        this.css = i
        break
      }
    }

    document.getElementById('debug').innerText += '-' + this.css
  }

  on () {
    // this.off = false
    setTimeout(() => {
      if (this.isOff === false) {
        console.log('a', this.isOff)
        this.cb()
        this.on()
      }
    }, 10)
    // this.interval = setInterval(() => { this.cb() }, 100)
  }

  off () {
    console.log('b')
    this.isOff = true
  }
}

S.L(document, 'add', 'DOMContentLoaded', app.init)
