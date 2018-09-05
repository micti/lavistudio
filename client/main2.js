let timer = 0;
setInterval(function () { timer += 50; }, 50);

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
  projectEffect: [],
  totalEl: document.getElementById('project-total'),
  currentEl: document.getElementById('project-current'),
  autoplayEl: document.getElementById('autoplay-timer'),

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

  autoPlayEvent: () => {
    let a = new S.Merom({el: projectSlider.autoplayEl, p: {x: [-100, 0, '%']}, d: 5000, e: 'Power4Out', cb: projectSlider.next})
    a.play()
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
    let animateTime = 1000;
    
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
      tl.from({el: projectSlider.currentEl, p: { y: [0, -100 * direction, '%'] }, d: animateTime, e: 'Power4Out', cb: projectSlider.updateCurrentStatus})
      tl.from({el: pcover, p: { y: [0, -100 * direction, '%'] }, d: animateTime, e: 'Power4Out', cb: () => { projectSlider.clearProject(prevProject) }})
      timer += animateTime
    }

    if (nextProject !== null) {
      let nname1x = document.querySelectorAll('#project-' + nextProject + ' span.speed-1x')
      let nname2x = document.querySelectorAll('#project-' + nextProject + ' span.speed-2x')
      let nname3x = document.querySelectorAll('#project-' + nextProject + ' span.speed-3x')
      let ncover = document.querySelector('#project-' + nextProject + ' .project-cover .cover')
      tl.from({el: nname1x, p: { y: [300 * direction, 0, '%'] }, d: animateTime, delay: timer - 100, e: 'Power4Out'})
      tl.from({el: nname2x, p: { y: [200 * direction, 0, '%'] }, d: animateTime, delay: 0, e: 'Power4Out'})
      tl.from({el: nname3x, p: { y: [100 * direction, 0, '%'] }, d: animateTime, delay: 0, e: 'Power4Out'})
      tl.from({el: projectSlider.currentEl, p: { y: [100 * direction, 0, '%'] }, d: animateTime, e: 'Power4Out'})
      tl.from({el: ncover , p: { y: [100 * direction, 0, '%'] }, d: animateTime, delay: 0, e: 'Power4Out', cb: projectSlider.releaseWheelEvent})

      projectSlider.current = nextProject
    }

    tl.play()
  },

  updateCurrentStatus: () => {
    projectSlider.currentEl.innerText = projectSlider.current
  },
  
  clearProject: (project) => {
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
    // clearInterval(projectSlider.autoPlayEvent);
  },

  runAutoPlay: () => {
    projectSlider.autoPlay = true
    projectSlider.autoPlayEvent()
  }
}

let app = {
  init: () => {
    projectSlider.init()
  }
}

S.L(document, 'add', 'DOMContentLoaded', app.init)
