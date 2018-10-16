(function() {  
  window.CanvasSlideshow = function( options ) {
    //  SCOPE
    /// ---------------------------      
    var that  =   this;
    
    //  OPTIONS
    /// ---------------------------      
    options                     = options || {};
    options.stageWidth          = options.hasOwnProperty('stageWidth') ? options.stageWidth : 960;
    options.stageHeight         = options.hasOwnProperty('stageHeight') ? options.stageHeight : 1080;
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
    options.textColor           = options.hasOwnProperty('textColor') ? options.textColor : '#fff';
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

      /*
      if ( options.fullScreen === true ) {
        window.addEventListener("resize", function( event ){ 
          scaleToWindow( renderer.view );
        });
        scaleToWindow( renderer.view );  
      }
      */
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

    
    /// ---------------------------
    //  HELPER FUNCTIONS
    /// ---------------------------
    function scaleToWindow( canvas, backgroundColor ) {
      var scaleX, scaleY, scale, center;
    
      //1. Scale the canvas to the correct size
      //Figure out the scale amount on each axis
      scaleX = window.innerWidth / canvas.offsetWidth;
      scaleY = window.innerHeight / canvas.offsetHeight;
    
      //Scale the canvas based on whichever value is less: `scaleX` or `scaleY`
      scale = Math.min(scaleX, scaleY);
      canvas.style.transformOrigin = "0 0";
      canvas.style.transform = "scale(" + scale + ")";
    
      //2. Center the canvas.
      //Decide whether to center the canvas vertically or horizontally.
      //Wide canvases should be centered vertically, and 
      //square or tall canvases should be centered horizontally
      if (canvas.offsetWidth > canvas.offsetHeight) {
        if (canvas.offsetWidth * scale < window.innerWidth) {
          center = "horizontally";
        } else {
          center = "vertically";
        }
      } else {
        if (canvas.offsetHeight * scale < window.innerHeight) {
          center = "vertically";
        } else {
          center = "horizontally";
        }
      }
    
      //Center horizontally (for square or tall canvases)
      var margin;
      if (center === "horizontally") {
        margin = (window.innerWidth - canvas.offsetWidth * scale) / 2;
        canvas.style.marginTop = 0 + "px";
        canvas.style.marginBottom = 0 + "px";
        canvas.style.marginLeft = margin + "px";
        canvas.style.marginRight = margin + "px";
      }
    
      //Center vertically (for wide canvases) 
      if (center === "vertically") {
        margin = (window.innerHeight - canvas.offsetHeight * scale) / 2;
        canvas.style.marginTop = margin + "px";
        canvas.style.marginBottom = margin + "px";
        canvas.style.marginLeft = 0 + "px";
        canvas.style.marginRight = 0 + "px";
      }
    
      //3. Remove any padding from the canvas  and body and set the canvas
      //display style to "block"
      canvas.style.paddingLeft = 0 + "px";
      canvas.style.paddingRight = 0 + "px";
      canvas.style.paddingTop = 0 + "px";
      canvas.style.paddingBottom = 0 + "px";
      canvas.style.display = "block";
    
      //4. Set the color of the HTML body background
      document.body.style.backgroundColor = backgroundColor;
    
      //Fix some quirkiness in scaling for Safari
      var ua = navigator.userAgent.toLowerCase();
      if (ua.indexOf("safari") != -1) {
        if (ua.indexOf("chrome") > -1) {
          // Chrome
        } else {
          // Safari
          //canvas.style.maxHeight = "100%";
          //canvas.style.minHeight = "100%";
        }
      }
    
      //5. Return the `scale` value. This is important, because you'll nee this value 
      //for correct hit testing between the pointer and sprites
      return scale;
    } // http://bit.ly/2y1Yk2k 
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
  init: () => {
    contactPage.contactButton = document.getElementById("contact-button")
    contactPage.contactPage = document.getElementById("contact-page")
    contactPage.backButton = document.getElementById("back-button")
    contactPage.newProjectButton = document.getElementById("new-project-button")
    contactPage.wrapper = document.getElementById("contact-page-wrapper")
    S.L(contactPage.contactButton, 'add', 'click', contactPage.click)
    S.L(contactPage.newProjectButton, 'add', 'click', contactPage.goToNewProject)
    S.L(contactPage.backButton, 'add', 'click', contactPage.backToInfo)
  },

  goToNewProject: () => {
    contactPage.backButton.style.display = 'block'
    new S.Merom({el: contactPage.wrapper, p: {x: [0, -50, '%']}, d: 750, e: 'Power4Out', cb: () => {
      contactPage.backButton.classList.add('active')
    }}).play()
  },

  backToInfo: () => {
    contactPage.backButton.classList.remove('active')
    new S.Merom({el: contactPage.wrapper, p: {x: [-50, 0, '%']}, d: 750, e: 'Power4Out', cb: () => {
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
      contactPage.backButton.classList.remove('active')
      contactPage.wrapper.style.transform = 'translateX(0)'
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

let loading = {
  effectDone: false,
  cb: null,
  prevPageCallback: null,
  nextPageCallback: null,

  loadPage: (page, options) => {
    loading.isFinish = false
    this.openLoad()
  },

  openLoad: () => {
    let load = document.getElementById('load')
    let loadsc = document.getElementById('load-screen')
    let images = ['01', '02', '03', '04', '05', '06', '01', '02', '03', '04', '05', '06']

    // Prepare flashing load
    let loadPhotos = load.querySelector('.photos').querySelectorAll('.photo')
    loadPhotos.innerHTML = ''
    this.divImages = []
    for (const image of images) {
      let newImage = document.createElement("img");
      newImage.src = '/photos/' + image + '-lo.png'

      let newDivImage = document.createElement("div");
      newDivImage.classList.add('photo')
      newDivImage.appendChild(newImage)
      
      loadPhotos.appendChild(newDivImage)
      this.divImages.push(newDivImage)
    }

    this.effectDone = false

    // loading
    loadsc.style.transform = 'translateX(0)'
    load.style.transform = 'translateX(-100%)'
    loadsc.style.zIndex = 60;
    
    new S.Merom({el: '#load', p: {x: [-100, 0, '%']}, d: 700, e: 'Power4Out', cb: () => {
      this.playLoadingEffect()
      this.callback()
    }}).play()
  },

  callback: () => {
    // Set for previous page
    if (this.prevPageCallback !== null) {
      this.prevPageCallback()
    }
    // Set for next page
    
      this.nextPageCallback()
  },

  playLoadingEffect: () => {
    // projectSlider.stop()
    let tl = new S.Timeline()
    tl.from({el: this.divImages[0], p: {opacity: [0, 1]}, d: 100, e: 'Power4Out'})
    tl.from({el: this.divImages[0], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
    tl.from({el: this.divImages[1], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
    tl.from({el: this.divImages[1], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
    tl.from({el: this.divImages[2], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
    tl.from({el: this.divImages[2], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
    tl.from({el: this.divImages[3], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
    tl.from({el: this.divImages[3], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
    tl.from({el: this.divImages[4], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
    tl.from({el: this.divImages[4], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
    tl.from({el: this.divImages[5], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
    tl.from({el: this.divImages[5], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
    tl.from({el: this.divImages[6], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
    tl.from({el: this.divImages[6], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
    tl.from({el: this.divImages[7], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
    tl.from({el: this.divImages[7], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
    tl.from({el: this.divImages[8], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
    tl.from({el: this.divImages[8], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
    tl.from({el: this.divImages[9], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
    tl.from({el: this.divImages[9], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
    tl.from({el: this.divImages[10], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
    tl.from({el: this.divImages[10], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out'})
    tl.from({el: this.divImages[11], p: {opacity: [0, 1]}, d: 100, delay: 100, e: 'Power4Out'})
    tl.from({el: this.divImages[11], p: {opacity: [1, 0]}, d: 100, delay: 100, e: 'Power4Out', cb: () => {
      this.effectDone = true
    }})
    tl.play()
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

  init: () => {
    let spriteImagesSrc = [
      'photos/01-cover.png',
      'photos/02-cover.png',
      'photos/03-cover.png',
      'photos/04-cover.png',
      'photos/05-cover.png',
      'photos/06-cover.png',
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

S.L(document, 'add', 'DOMContentLoaded', app.init)
