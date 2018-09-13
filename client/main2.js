let timer = 0;
setInterval(function () { timer += 50; }, 50);
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
    //this.animate();
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

let isChanging = false
let projectSlider = {
  total: 1,
  current: 0,
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

  autoPlayEvent: () => {
    projectSlider.autoplayAnimation = new S.Merom({el: projectSlider.autoplayEl, p: {x: [-100, 0, '%']}, d: 15000, e: 'linear', cb: projectSlider.next})
    projectSlider.autoplayAnimation.play()
  },

  init: () => {
    projectSlider.isStop = false;
    let projects = document.getElementsByClassName('project')
    projectSlider.total = projects.length
    document.getElementById('project-total').innerHTML = projectSlider.total

    projectSlider.autoplayAnimation = new S.Merom({el: '#autoplay-timer', p: {x: [-100, 0, '%']}, d: 10000, e: 'Power4Out', cb: projectSlider.next})

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
      if (projectSlider.projectEffect[nextProject] !== null) {
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
  }
}

let projectDetail = {
  init: () => {
    // event
    S.L('.project-detail-link', 'add', 'click', projectDetail.open)
  },

  open: (e) => {
    e.preventDefault()
    let project = e.target.closest('.project-detail-link')
    let loadPhotos = document.getElementById('load').querySelector('.photos')
    let id = project.getAttribute('data-id')
    let imagedata = project.getAttribute('data-image')
    let images = imagedata.split('|')
    let divImages = []
    for (const image of images) {
      let newImage = document.createElement("img");
      newImage.src = 'photos/' + image

      let newDivImage = document.createElement("div");
      newDivImage.classList.add('photo')
      newDivImage.appendChild(newImage)
      
      loadPhotos.appendChild(newDivImage)
      divImages.push(newDivImage)
    }

    let effectDone = false
    
    new S.Merom({el: '#load', p: {x: [-100, 0, '%']}, d: 1000, e: 'Power4Out', cb: () => {
      projectSlider.stop()
      let tl = new S.Timeline()
      tl.from({el: divImages[0], p: {opacity: [0, 1]}, d: 100, e: 'Power4Out'})
      tl.from({el: divImages[0], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[1], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[1], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[2], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[2], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[0], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[0], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[1], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[1], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[2], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[2], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[0], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[0], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[1], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[1], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[2], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[2], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[0], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[0], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[1], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[1], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[2], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
      tl.from({el: divImages[2], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out', cb: () => {
        effectDone = true
      }})
      tl.play()
    }}).play()

    fetch('project_' + id + '.txt?b').then((res) => {
      res.text().then((text) => {
        document.getElementById('project-page').innerHTML = text
        let wait = () => {
          if (!effectDone) {
            setTimeout(() => {
              wait()
            }, 100)
          } else {
            projectDetail.openCover()
          }
        }
        wait()
      });
    })
  },

  openCover: () => {
    let pd = document.getElementById('project-page')
    let cover = document.getElementById('project-page-cover')
    pd.style.display = 'block'
    pd.scrollTop = 0

    new S.Merom({el: cover, p: {x: [100, 0, '%']}, d: 700, e: 'Power4Out', cb: projectDetail.openContent}).play()
  },

  openContent: () => {
    document.getElementById('project-page-content').style.display = 'block'
  }
}

let app = {
  init: () => {
    projectSlider.init()
    projectDetail.init()
    // projectDetail.open()
    // document.getElementById('project-page').style.display = 'block'
    // let el = document.getElementById('project-page')
    //document.getElementById('debug').innerText = ''
    //document.getElementById('debug').innerText += el.scrollTop + '|'

    //let ss = el.getElementsByClassName('section')

    // for (const s of ss) {
      // let a = s.getClientRects()
      // console.log(a)
      //document.getElementById('debug').innerText += a + '|'
    // }

    //let scroll = new S.Scroll((scrollY, delta, e) => {
      //document.getElementById('debug').innerText = scrollY + '-' + delta
    //})
    // setInterval(() => {
    //   document.getElementById('debug').innerText = el.scrollTop
    // }, 10)

    // scroll.on()
    // let a = new Parallax(el, 'pppp')
    // a.on()
    // setTimeout(() => {a.off()}, 10000)
    // let a = new S.Scroll1(el, (y, d) => {
    //   console.log(y, d)
    // }).on()
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
