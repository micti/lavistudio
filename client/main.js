(function() {  
  window.CanvasSlideshow = function( options ) {
    //  SCOPE
    /// ---------------------------      
    var that  =   this;
    
    //  OPTIONS
    /// ---------------------------      
    options                     = options || {};
    options.stageWidth          = 960;
    options.stageHeight         = 1080;
    options.pixiSprites         = options.hasOwnProperty('sprites') ? options.sprites : [];
    options.centerSprites       = options.hasOwnProperty('centerSprites') ? options.centerSprites : false;
    options.texts               = options.hasOwnProperty('texts') ? options.texts : [];
    options.autoPlay            = options.hasOwnProperty('autoPlay') ? options.autoPlay : true;
    options.autoPlaySpeed       = options.hasOwnProperty('autoPlaySpeed') ? options.autoPlaySpeed : [10, 3];
    options.displaceScale       = options.hasOwnProperty('displaceScale') ? options.displaceScale : [200, 70];
    options.displacementImage   = options.hasOwnProperty('displacementImage') ? options.displacementImage : '';
    options.navElement          = options.hasOwnProperty('navElement')  ?  options.navElement : document.querySelectorAll( '.scene-nav' ); 
    options.displaceAutoFit     = options.hasOwnProperty('displaceAutoFit')  ?  options.displaceAutoFit : false; 
    options.displaceScaleTo     = ( options.autoPlay === false ) ? [ 0, 0 ] : [ 20, 20 ];
    options.displacementCenter  = options.hasOwnProperty('displacementCenter') ? options.displacementCenter : false;
    options.dispatchPointerOver = options.hasOwnProperty('dispatchPointerOver') ? options.dispatchPointerOver : false;

    //  PIXI VARIABLES
    /// ---------------------------    
    var renderer            = new PIXI.autoDetectRenderer( options.stageWidth, options.stageHeight, { transparent: true });
    var stage               = new PIXI.Container();
    var slidesContainer     = new PIXI.Container();
    var displacementSprite  = new PIXI.Sprite.fromImage( options.displacementImage );
    var displacementFilter  = new PIXI.filters.DisplacementFilter( displacementSprite );

    //  SLIDES ARRAY INDEX
    /// ---------------------------    
    this.currentIndex = 0;

    /// ---------------------------
    //  INITIALISE PIXI
    /// ---------------------------      
    this.initPixi = function() {
      // Add canvas to the HTML
      document.getElementById('projects-canvas').appendChild( renderer.view );

      // Add child container to the main container 
      stage.addChild( slidesContainer );
      // Enable Interactions
      stage.interactive = true;
      renderer.view.style.objectFit = 'cover';
      renderer.view.style.width     = '100%';
      renderer.view.style.height    = '100%';
      renderer.view.style.top       = '0%';
      renderer.view.style.left      = '0%';
      renderer.view.style.webkitTransform = 'translate( -0%, -0% ) scale(1.2)';           
      renderer.view.style.transform = 'translate( -0%, -0% ) scale(1.2)';
      displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;

      // Set the filter to stage and set some default values for the animation
      stage.filters = [displacementFilter];

      displacementSprite.scale.x = 2;
      displacementSprite.scale.y = 2;

      // PIXI tries to fit the filter bounding box to the renderer so we optionally bypass
      displacementFilter.autoFit = options.displaceAutoFit;
      
      stage.addChild( displacementSprite );
    };

    /// ---------------------------
    //  LOAD SLIDES TO CANVAS
    /// ---------------------------          
    this.loadPixiSprites = function( sprites ) {
      var rSprites = options.sprites;

      for ( var i = 0; i < rSprites.length; i++ ) {
        
        var texture   = new PIXI.Texture.fromImage( sprites[i] );
        var image     = new PIXI.Sprite( texture );
        
        if ( options.centerSprites === true ) {
          image.anchor.set(0.5);
          image.x = renderer.width / 2;
          image.y = renderer.height / 2;            
        }
        // image.transform.scale.x = 1.3;
        // image.transform.scale.y = 1.3;
        if ( i !== 0  ) {
          TweenMax.set( image, { alpha: 0 } );
        }

        slidesContainer.addChild( image );
      }
    };
    


    /// ---------------------------
    //  DEFAULT RENDER/ANIMATION
    /// ---------------------------        
    var ticker = new PIXI.ticker.Ticker()
    ticker.autoStart = true
    ticker.add(function(delta) {
      displacementSprite.x += options.autoPlaySpeed[0] * delta
      displacementSprite.y += options.autoPlaySpeed[1]
      renderer.render(stage)
    })

    /// ---------------------------
    //  TRANSITION BETWEEN SLIDES
    /// ---------------------------    
    var slideImages = slidesContainer.children  
    this.moveSlider = function(newIndex, oldIndex) {

      var baseTimeline = new TimelineMax()
      // baseTimeline.clear()
      // if (baseTimeline.isActive() ) {
      //   return;
      // }        
      baseTimeline
        .to(displacementFilter.scale, 0.7, { x: options.displaceScale[0], y: options.displaceScale[1]  })
        .to(slideImages[oldIndex], 0.5, { alpha: 0 })
        .to(slideImages[newIndex], 0.5, { alpha: 1 })          
        .to(displacementFilter.scale, 0.7, { x: options.displaceScaleTo[0], y: options.displaceScaleTo[1] } );
    }

    /// ---------------------------
    //  INIT FUNCTIONS
    /// ---------------------------    

    this.init = function() {      
      that.initPixi();
      that.loadPixiSprites( options.pixiSprites );
    }
 
    /// ---------------------------
    //  CENTER DISPLACEMENT
    /// ---------------------------
    if ( options.displacementCenter === true ) {
      displacementSprite.anchor.set(0.5);
      displacementSprite.x = renderer.view.width / 2;
      displacementSprite.y = renderer.view.height / 2;        
    }
    
    
    /// ---------------------------
    //  START 
    /// ---------------------------           
    this.init();
  }
})(); 

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
  scrollHelperEl: document.getElementById('scroll-helper'),
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
    projectSlider.autoplayAnimation = new S.Merom({el: projectSlider.autoplayEl, p: {x: [-100, 0, '%']}, d: 5000, e: 'linear', cb: projectSlider.next})
    projectSlider.autoplayAnimation.play()
  },

  init: () => {
    projectSlider.isStop = false;
    let projects = document.getElementsByClassName('project')
    projectSlider.total = projects.length
    document.getElementById('project-total').innerHTML = projectSlider.total

    projectSlider.autoplayAnimation = new S.Merom({el: '#autoplay-timer', p: {x: [-100, 0, '%']}, d: 5000, e: 'Power4Out', cb: projectSlider.next})

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
      app.slideShow.moveSlider(0, projectSlider.current - 1)
      projectSlider.change(1, projectSlider.current, 1)
    } else {
      app.slideShow.moveSlider(projectSlider.current, projectSlider.current - 1)
      projectSlider.change(projectSlider.current + 1, projectSlider.current, 1)
      
    }
  },

  prev: () => {
    projectSlider.isChange = true
    projectSlider.cancelAutoPlay()
    
    if (projectSlider.current === 1) {
      app.slideShow.moveSlider(projectSlider.total - 1, 0)
      projectSlider.change(projectSlider.total, 1, -1)
    } else {
      app.slideShow.moveSlider(projectSlider.current - 2, projectSlider.current - 1)
      projectSlider.change(projectSlider.current - 1, projectSlider.current, -1)
    }
  },

  change: (nextProject, prevProject, direction) => {
    let tl = new S.Timeline()
    let timer = 0
    let animateTime = 1200;

    if (prevProject !== null) {
      let pname1x = document.querySelectorAll('#project-' + prevProject + ' span.speed-1x')
      let pname2x = document.querySelectorAll('#project-' + prevProject + ' span.speed-2x')
      let pname3x = document.querySelectorAll('#project-' + prevProject + ' span.speed-3x')
      tl.from({el: pname1x, p: { y: [0, -300 * direction, '%'] }, d: animateTime, e: 'Power4Out'})
      tl.from({el: pname2x, p: { y: [0, -200 * direction, '%'] }, d: animateTime, e: 'Power4Out'})
      tl.from({el: pname3x, p: { y: [0, -100 * direction, '%'] }, d: animateTime, e: 'Power4Out', cb: () => { projectSlider.clearProject(prevProject) }})
      tl.from({el: projectSlider.currentEl, p: { y: [0, -100 * direction, '%'] }, d: animateTime / 2, e: 'Power4Out', cb: projectSlider.updateCurrentStatus})
      timer += animateTime
    }

    if (nextProject !== null) {
      document.getElementById('project-' + nextProject).style.display = 'flex'
      let nname1x = document.querySelectorAll('#project-' + nextProject + ' span.speed-1x')
      let nname2x = document.querySelectorAll('#project-' + nextProject + ' span.speed-2x')
      let nname3x = document.querySelectorAll('#project-' + nextProject + ' span.speed-3x')
      tl.from({el: nname1x, p: { y: [300 * direction, 0, '%'] }, d: animateTime, delay: timer / 2, e: 'Power4Out'})
      tl.from({el: nname2x, p: { y: [200 * direction, 0, '%'] }, d: animateTime, delay: 0, e: 'Power4Out'})
      tl.from({el: nname3x, p: { y: [100 * direction, 0, '%'] }, d: animateTime, delay: 0, e: 'Power4Out', cb: projectSlider.releaseWheelEvent})
      tl.from({el: projectSlider.currentEl, p: { y: [100 * direction, 0, '%'] }, d: animateTime / 2, e: 'Power4Out'})
      projectSlider.current = nextProject
    }

    tl.play()
  },

  updateCurrentStatus: () => {
    projectSlider.currentEl.innerText = projectSlider.current
  },
  
  clearProject: (project) => {
    document.getElementById("project-" + project).style.display = 'none'
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
  },

  start: () => {
    projectSlider.isStop = false
    projectSlider.runAutoPlay()
    projectSlider.scrollEvent.on()
  }
}

let contactPage = {
  wrapper: null,
  contactButton: null,
  contactPage: null,
  backButton: null,
  isOpen: false,
  formPage: null,

  init: () => {
    contactPage.contactButton = document.getElementById("contact-button")
    contactPage.contactButton = document.getElementById("contact-button")
    contactPage.newProjectFormButton = document.getElementById("form-submit")
    contactPage.contactPage = document.getElementById("contact-page")
    contactPage.formPage = document.getElementById("new-project-form-page")
    contactPage.backButton = document.getElementById("back-button")
    contactPage.newProjectButton = document.getElementById("new-project-button")
    contactPage.wrapper = document.getElementById("contact-page-wrapper")
    S.L(contactPage.contactButton, 'add', 'click', contactPage.click)
    S.L(contactPage.newProjectButton, 'add', 'click', contactPage.goToNewProject)
    S.L(contactPage.backButton, 'add', 'click', contactPage.backToInfo)
    S.L(contactPage.backButton, 'add', 'click', contactPage.backToInfo)

    // form submit
    S.L(contactPage.newProjectFormButton, 'add', 'click', (e) => {
      e.preventDefault()
      let a = new FormData(document.getElementById("new-project-form"))
      console.log(a);
    })
  },

  goToNewProject: () => {
    contactPage.backButton.style.display = 'block'
    new S.Merom({el: contactPage.contactPage, p: {x: [0, -100, '%']}, d: 750, e: 'Power4Out', cb: () => {
      contactPage.backButton.classList.add('active')
    }}).play()
  },

  backToInfo: () => {
    contactPage.backButton.classList.remove('active')
    new S.Merom({el: contactPage.contactPage, p: {x: [-100, 0, '%']}, d: 750, e: 'Power4Out', cb: () => {
      contactPage.backButton.style.display = 'none'
    }}).play()
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
      contactPage.formPage.style.display = 'none'
      contactPage.formPage.style.zIndex = 40
      contactPage.backButton.classList.remove('active')
      contactPage.contactPage.style.transform = 'translateX(0)'
      projectSlider.start()
      new S.Merom({el: '#load', p: {x: [0, 100, '%']}, d: 700, e: 'Power4Out', cb: () => {
        loadsc.style.zIndex = 0;
        contactPage.backButton.style.display = 'none'
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
        contactPage.formPage.style.display = 'block'
        contactPage.formPage.style.zIndex = 41
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
  elProjectPage: null,
  prevProject: null,
  currentProject: null,
  parallax: null,

  init: () => {
    projectDetail.elProjectPage = document.getElementById('project-page')
    // close
    S.L('#logo-home', 'add', 'click', projectDetail.close)
    // event
    S.L('.project-detail-link', 'add', 'click', projectDetail.open)
  },

  open: (e) => {
    e.preventDefault()

    // Get project info
    let project = e.target.closest('.project-detail-link')
    let id = project.getAttribute('data-id')
    if (projectDetail.currentProject !== null) {
      projectDetail.prevProject = projectDetail.currentProject
    }
    projectDetail.currentProject = id

    let load = document.getElementById('load')
    let loadsc = document.getElementById('load-screen')
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

    fetch('project_' + id + '.txt?v12345679').then((res) => {
      res.text().then((text) => {
        let wait = () => {
          if (!effectDone) {
            setTimeout(() => {
              wait()
            }, 100)
          } else {
            projectDetail.initProject(text)
          }
        }
        wait()
      });
    })
  },

  initProject: (content) => {
    if (projectDetail.prevProject !== null) {
      // this.elProjectPage.innerHTML = '' 
      projectDetail.elProjectPage.classList.remove('project-' + projectDetail.prevProject + '-detail')
    }

    projectDetail.elProjectPage.classList.add('project-' + projectDetail.currentProject + '-detail')
    projectDetail.elProjectPage.innerHTML = content

    projectDetail.openCover()
    // event
    S.L('.project-detail-link', 'add', 'click', projectDetail.open)
  },

  close: () => {
    if (projectDetail.currentProject === null) {
      return
    }

    // let pd = document.getElementById('project-page')
    let loadsc = document.getElementById('load-screen')
    let load = document.getElementById('load')
    load.style.transform = 'translateX(-100%)'
    loadsc.style.transform = 'translateX(0)'
    loadsc.style.zIndex = 60;

    new S.Merom({el: '#load', p: {x: [-100, 0, '%']}, d: 700, e: 'Power4Out', cb: () => {
      // clear parallax
      if (projectDetail.parallax !== null) projectDetail.parallax.destroy()

      projectDetail.elProjectPage.style.display = 'none'
      projectDetail.elProjectPage.classList.remove('project-' + projectDetail.currentProject + '-detail')
      projectDetail.currentProject = null
      projectDetail.prevProject = null
      projectSlider.start()
      new S.Merom({el: '#load', p: {x: [0, 100, '%']}, d: 700, e: 'Power4Out', cb: () => {
        loadsc.style.zIndex = 0;
        loadsc.style.transform = 'translateX(-100%)'
      }}).play()
    }}).play()
  },

  openCover: () => {
    let load = document.getElementById('load')
    projectDetail.elProjectPage.style.display = 'block'
    projectDetail.elProjectPage.scrollTop = 0
    new S.Merom({el: load, p: {x: [0, 100, '%']}, d: 700, e: 'Power4Out', cb: projectDetail.openContent}).play()
  },

  openContent: () => {
    let cover = document.getElementById('project-page-cover')
    let loadsc = document.getElementById('load-screen')
    loadsc.style.zIndex = 0
    loadsc.style.transform = 'translateX(-100%)'
    new S.Merom({el: cover, p: {opacity: [0, 1]}, d: 1500, e: 'Power4Out', cb: () => {
      document.getElementById('project-page-content').style.display = 'block'
      // Call prallax
      projectDetail.parallax = new ScrollMagic.Controller()
      let sections = document.querySelectorAll('.section-image')
      for (const section of sections) {
        let id = section.id
        new ScrollMagic.Scene({
          triggerElement: '#' + id
        }).setClassToggle('#' + id + ' .image', 'active').addTo(projectDetail.parallax)
      }
    }}).play()
  }
}

let app = {
  page: 'project',
  projectid: null,
  config: {
    'z': {
      'project': 0,
      'project-detail': 40,
      'contact': 50,
      'load': 80
    }
  },

  loading2: () => {
    let manifest = [
      '/photos/01-dcover.png',
      '/photos/02-dcover.png',
      '/photos/03-dcover.png',
      '/photos/04-dcover.png',
      '/photos/05-dcover.png',
      '/photos/06-dcover.png',
      '/photos/avatar.png',
      '/photos/new-project-1.png',
      '/photos/new-project-2.png'
    ]
    let preload = new createjs.LoadQueue(true)
    preload.setMaxConnections(5)
    while (manifest.length > 0) {
      var item = manifest.shift()
      preload.loadFile(item)
    }
  },

  loading: () => {
    let manifest = [
      '/client/photo/clouds.jpg',
      '/photos/01-cover.png',
      '/photos/02-cover.png',
      '/photos/03-cover.png',
      '/photos/04-cover.png',
      '/photos/05-cover.png',
      '/photos/06-cover.png',
      '/photos/01-lo.png',
      '/photos/02-lo.png',
      '/photos/03-lo.png',
      '/photos/04-lo.png',
      '/photos/05-lo.png',
      '/photos/06-lo.png'
    ]

    let preload = new createjs.LoadQueue(true)
    
    preload.on("progress", () => {
      let percent = preload.progress * 100

      if (percent >= 25 && percent < 50) {
        document.getElementById('loading-letter-l').classList.add('active')
      }

      if (percent >= 50 && percent < 75) {
        document.getElementById('loading-letter-l').classList.add('active')
        document.getElementById('loading-letter-a').classList.add('active')
      }

      if (percent >= 75) {
        document.getElementById('loading-letter-l').classList.add('active')
        document.getElementById('loading-letter-a').classList.add('active')
        document.getElementById('loading-letter-v').classList.add('active')
      }
    })

    preload.on('complete', () => {
      document.getElementById('loading-letter-i').classList.add('active')
      setTimeout(() => {
        let loadsc = document.getElementById('load-screen')
        let load = document.getElementById('load')
        loadsc.querySelector('.logo-svg').style.transform = 'scale(5, 5)'
        loadsc.querySelector('.logo-svg').style.opacity = 0
        new S.Merom({el: load, p: {opacity: [1, 0]}, d: 1000, e: 'Power4Out', cb: () => {
          loadsc.style.zIndex = 0;
          loadsc.style.transform = 'translateX(-100%)'
          load.style.opacity = 1
          document.getElementById('load-logo').style.display = 'none'
          document.getElementById('load-photos').style.display = 'block'
          document.body.classList.add('loaded')
          app.init()
        }}).play()
        
      }, 2000)

      app.loading2()
    })
    
    preload.setMaxConnections(5);
  
    while (manifest.length > 0) {
      var item = manifest.shift();
      preload.loadFile(item);
    }
  },

  init: () => {
    let spriteImagesSrc = [
      '/photos/01-cover.png',
      '/photos/02-cover.png',
      '/photos/03-cover.png',
      '/photos/04-cover.png',
      '/photos/05-cover.png',
      '/photos/06-cover.png'
    ]
    app.slideShow = new CanvasSlideshow({
      sprites: spriteImagesSrc,
      displacementImage: '/client/photo/clouds.jpg',
      autoPlaySpeed: [10, 3],
      displaceScale: [200, 70]
    });

    projectSlider.init()
    projectDetail.init()
    contactPage.init()
  },

  setPage: (page, options) => {
    this.page = page
    if (page === 'project-detail') {
      this.projectid = options.projectid
    }
  }
}

S.L(document, 'add', 'DOMContentLoaded', app.loading)
