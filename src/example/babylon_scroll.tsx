// Global Variables //
var canvas;
var engine;
var scene;

var shadowGenerator;
var dirLight;
var ground;
var hdrTexture;
var hdrRotation = 0;

var currentTime = 0;
var scrollSections;
var isScrolling = false;
var scrollTimeout;

var infoText;
var currentStep = 0;
const animationMultiplier = 20;
var disableStepNavigation = false;
var disableStepNavigation_Delay = 600;

// VARIABLES TO DEFINE //
// Animation Frame Rate should be 60 FPS (Exported from 3Ds Max, Blender...) //
// Initial Step must be 0 to set the init animation frame // 
const scrollSteps = [0, 700, 2170, 3400, 5700, 7000, 7600];
const animationDuration = 300;
const endOffset = 1000;
const scrollSpeed = 900; // Lower values Slow movement
const glb_file = "scene.glb";
const stepNavigation_TouchDevice = true;
const stepNavigation_NonTouchDevice = true;
const use_buttons = true;
const showStats = true;
const showScrollIcon = true;
var offset_in = 50; // <-----< [DIV]
var offset_out = 300; // [DIV] >------>

// GLB AnimationGroups //
// Must Check GLB Animations from file //
var cameraAnim, ballAnim, objectsAnim, textsAnim;


// On Document Loaded - Start Game //
document.addEventListener("DOMContentLoaded", startGame);

// Start Game //
function startGame() {

    if (showStats)
    document.getElementById("stats-div").style.display = "inline";

    if (showScrollIcon)
    document.getElementById("donwload-gif").style.display = "inline";

    // Set Canvas & Engine //
    canvas = document.getElementById("renderCanvas");
    engine = new BABYLON.Engine(canvas, true, { stencil: true });
    engine.clear(new BABYLON.Color3(0, 0, 0), true, true);
    scene = createScene();
    var toRender = function () {
        scene.render();
    }
    engine.runRenderLoop(toRender);
}

// Create Scene //
var createScene = function () {
    // Scene //
    scene = new BABYLON.Scene(engine);

    scene.createDefaultCamera();

    // Directional Light //
    dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(0,0,0), scene);
    dirLight.intensity = 1;
    dirLight.position = new BABYLON.Vector3(0,2,2);
    dirLight.direction = new BABYLON.Vector3(-2, -5, -3);

    // Shadows //
    shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight, true);

    setLighting(scene);    
    importModelAsync(scene, glb_file);

    // scene.debugLayer.show();
    return scene;
};


// Import Model Async //
function importModelAsync(scene, model) {
    Promise.all([
        BABYLON.SceneLoader.ImportMeshAsync(null, "./resources/models/" , model, scene).then(function (result) {

            console.log("Meshes: " + scene.meshes);
            scene.activeCamera.dispose();
            
            var camera = scene.getCameraByName("Camera");
            scene.activeCamera = camera;

            ballAnim = scene.getAnimationGroupByName("BallAnim");
            objectsAnim = scene.getAnimationGroupByName("ObjectsAnim");
            cameraAnim = scene.getAnimationGroupByName("CameraAnim");
            textsAnim = scene.getAnimationGroupByName("TextsAnim");

            ballAnim.stop();
            cameraAnim.stop();

            textsAnim.speedRatio = 0.1;
            textsAnim.play(0.1, true);

            ground = scene.getMeshByName("Ground");
            ground.receiveShadows = true;
        }),

    ]).then(() => {
        setReflections(scene);
        setShadows(scene);

        // Hide Screen Loader after 1sec.
        setTimeout(() => {
            hideLoadingView(scene);    
            initFunctions(scene);
            checkButtons();
            setMouseCameraMove(scene);
            checkPositionForDIVS();
            sphereAnimation();
        }, 1000);
    });
}

function sphereAnimation() {
    // Register Before Render //
    var sphere = scene.getNodeByName("Sphere");
    var axis = new BABYLON.Vector3(0, 1, 0);
    var angle = 0.005;
    var alpha = 0;

    scene.registerAfterRender(function () { 
        //castRay(scene);
        sphere.rotate(axis, angle, BABYLON.Space.WORLD);
        alpha += 0.1;
    });
   

}

// Environment Lighting //
function setLighting(scene) {
    hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("./resources/env/environment_4.env", scene);
    hdrTexture.rotationY = BABYLON.Tools.ToRadians(hdrRotation);
    hdrSkybox = BABYLON.MeshBuilder.CreateBox("skybox", {size: 1024}, scene);
    var hdrSkyboxMaterial = new BABYLON.PBRMaterial("skybox", scene);
    hdrSkyboxMaterial.backFaceCulling = false;
    hdrSkyboxMaterial.reflectionTexture = hdrTexture.clone();
    hdrSkyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    hdrSkyboxMaterial.microSurface = 0.6;
    hdrSkyboxMaterial.disableLighting = true;
    hdrSkybox.material = hdrSkyboxMaterial;
    hdrSkybox.infiniteDistance = true;
}

// Set Shadows //
function setShadows(scene) {
    scene.meshes.forEach(function(mesh) {
        if (mesh.name.includes("Sphere"))
        {
            shadowGenerator.darkness = 0.1;
            shadowGenerator.bias = 0.00001;
            shadowGenerator.useBlurExponentialShadowMap = true;
            shadowGenerator.addShadowCaster(mesh);
        }
    });
}

// Set Reflections //
function setReflections(scene) {
    scene.materials.forEach(function (material) {
        if (material.name != "skybox") {
            material.reflectionTexture = hdrTexture;
            material.reflectionTexture.level = 0.6;
            material.disableLighting = false;
        }
    });
}

// Hide Loading View //
function hideLoadingView(scene) {
    setTimeout(() => {
    }, 500);
    document.getElementById("loadingDiv").style.display = "none";
}

// Resize Window //
window.addEventListener("resize", function () {
    engine.resize();
});


var touchEnabled = true;
function initFunctions() {  

    // Scroll Init Position
    setTimeout(() => {
        $("#scroll-sections").animate({ scrollTop: 0 }, 60);
    }, 300);

    canvas.addEventListener('scroll', function(event) {
        event.preventDefault();
    });

    infoText = document.getElementById("info-text-div");
    infoText.style.display = "none";

    document.getElementById("main-section").style.height = animationDuration*animationMultiplier+endOffset + "px";
    scrollSections = document.getElementById('scroll-sections');

    scrollSections.addEventListener("click", function(event) {
        var x = event.clientX - canvas.offsetLeft;
        var y = event.clientY - canvas.offsetTop;

        // Calculate the direction of the ray based on the position of the click or tap
        var pickInfo = scene.pick(x, y);
        if (pickInfo.hit) {
            // Picked Mesh
            infoText.style.display = "inline";
            document.getElementById("info-text").innerHTML = "Clicked: " + pickInfo.pickedMesh.name;
            setTimeout(() => {
                infoText.style.display = "none";   
            }, 2000);
        }
    });

    // Touch Device or Not
    if (isTouch)
    {
        console.log("isTouch");
        scrollSections_Scroll();
        // Swipe Scroll - Animation Steps
        if (stepNavigation_TouchDevice)
            swipeScroll();
    } else {
        console.log("Desktop");
        scrollSections_Scroll();
        // Wheel Scroll - Animation Steps
        if (stepNavigation_NonTouchDevice)
            wheelScroll();
    }
}

// Main Section 
function scrollSections_Scroll() {
    scrollSections.addEventListener('scroll', function(event) {
        var scrollPosition = scrollSections.scrollTop;
        // var sectionHeight = scrollSections.offsetHeight;
        isScrolling = true;
        cameraAnim.enableBlending = true;
        cameraAnim.blendingSpeed = 0.01;

        currentTime = scrollPosition / animationMultiplier;
        if (currentTime > 0.1 && currentTime < animationDuration-1)
        {
            cameraAnim.start(false, 1, currentTime, currentTime, false);
            ballAnim.start(false, 1, currentTime, currentTime, false);
            objectsAnim.start(false, 1, currentTime, currentTime, false);
        }

        checkPositionForDIVS();
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function() {
            isScrolling = false;
            console.log('Scroll Stopped');  
        }, 100);

    });
}

// Override Scroll Wheel //
function wheelScroll() {
    window.addEventListener("wheel", function(event) {
        // if (isScrolling)
        // return;

        // if (cameraAnim.isPlaying)
        // return;

        event.preventDefault
        // console.log("event.deltaY " + event.deltaY);

        if (event.deltaY < -10) {
            // console.log("MouseWheel Up");
            prevStep();
        } else if (event.deltaY > 10) {
            // console.log("MouseWheel Down");
            nextStep();
        }
    });  
}


// Override Touch for Swipe Detection //
function swipeScroll() {

    let touchstartY = 0;
    let touchmoveY = 0;
    let touchendY = 0;
    var distance = 0;

    scrollSections.addEventListener('touchstart', function(e) {
        touchstartY = e.touches[0].clientY;
        distance = 0;
    });

    scrollSections.addEventListener('touchmove', function(e) {
        touchmoveY = e.touches[0].clientY;
        const distance = Math.abs(touchmoveY - touchstartY);
        if (distance > 5) {
            e.preventDefault();
        }
    }, { passive: false });

    scrollSections.addEventListener('touchend', function(e) {
        if (touchmoveY == 0)
            touchmoveY = touchstartY;

        touchendY = touchmoveY - touchstartY;
        distance = Math.abs(touchendY);

        console.log("distance: " + distance);
        if (distance > 100) {
            if (touchendY > 0) {
                prevStep();
            } else {
                nextStep();
            }
        }

        touchstartY = 0;
        touchmoveY = 0;
        touchendY = 0;
        distance = 0;
    });
}


// Check Position for DIVS //
function checkPositionForDIVS() {
    for (let index = 0; index < scrollSteps.length; index++) {
        var sect = document.getElementById("section-" + index);

        if (scrollSections.scrollTop >= scrollSteps[index]-offset_in && scrollSections.scrollTop <= scrollSteps[index]+offset_out) {
            // console.log("Section " + inter);
            sect.classList.remove("hidden");
            currentStep = index;
        } else {
            if (index < scrollSteps.length-1)
            sect.classList.add("hidden");
        }
    }
}


// Button Steps //
function nextStep() { 
    if (currentStep < scrollSteps.length-1)
    {
        if (disableStepNavigation)
        return;

        setTimeout(() => {
            disableStepNavigation = false;
        }, disableStepNavigation_Delay);
        disableStepNavigation = true;

        currentStep++;
        console.log("CurrentStep " + currentStep);
        scrollToAnimated(scrollSections, scrollSteps[currentStep], scrollSpeed);
    }
}

function prevStep() {
    if (currentStep > 0)
    {
        if (disableStepNavigation)
        return;

        setTimeout(() => {
            disableStepNavigation = false;
        }, disableStepNavigation_Delay);
        disableStepNavigation = true;

        currentStep--;
        console.log("CurrentStep " + currentStep);
        scrollToAnimated(scrollSections, scrollSteps[currentStep], scrollSpeed);
    }
}

function scrollToAnimated(element, to, duration) {
    var start = element.scrollTop;
    var distance = Math.abs(to - start);
    var duration = distance / scrollSpeed * 1000; // duraciÃ³n de la animaciÃ³n en milisegundos
    var startTime = performance.now();
  
    function animateScroll() {
      var time = performance.now() - startTime;
      var percentage = Math.min(time / duration, 1);
  
      element.scrollTop = start + (to - start) * percentage;
  
      if (percentage < 1) {
        requestAnimationFrame(animateScroll);
      }
    }
    requestAnimationFrame(animateScroll);
}
  

function checkButtons() {
    var left_BT = document.getElementById("arrow-left");
    var right_BT = document.getElementById("arrow-right");
    if (!use_buttons) {
        left_BT.style.display = "none";
        right_BT.style.display = "none";
        return;
    }

    var download_gif = document.getElementById("donwload-gif");
    setInterval(() => {
        if (currentStep <= 0)
        {
            left_BT.style.pointerEvents = "none";
            left_BT.style.opacity = 0.25;
        } else {
            left_BT.style.pointerEvents = "auto";
            left_BT.style.opacity = 1;
        }

        if (currentStep >= scrollSteps.length-1)
        {
            right_BT.style.pointerEvents = "none";
            right_BT.style.opacity = 0.25;
        } else {
            right_BT.style.pointerEvents = "auto";
            right_BT.style.opacity = 1;
        }

        if (currentTime > 90)
        {
            download_gif.classList.add("hidden");
        } else {
            download_gif.classList.remove("hidden");
        }

        // if (currentTime > animationDuration)
        //     currentTime = animationDuration;

        var currentPosText = document.getElementById("current-position-text");
        currentPosText.innerHTML = "<b>Animation Time:</b> " + Math.round(currentTime) + " frames <br><b>Scroll Position:</b> " + Math.round(scrollSections.scrollTop) + " px<br><b>--- " + Math.round(engine.getFps()) + " FPS ---</b> ";
    
    }, 200);
}

// Camera Mouse Movement //
var moveScale = 120;
function setMouseCameraMove() {
    if(!isTouch) 
    {
        var mouseMove = function(evt){
        evt.preventDefault();
            // reduce the scrolling speed
            let mX, mY
            if (evt.movementX != 0) {mX = evt.movementX / moveScale}
            else mX = evt.movementX
            if (evt.movementY != 0) {mY = evt.movementY / -moveScale}
            else mY = evt.movementY
            // Take delta of mouse movement from last event and create movement vector
            var movementVector = new BABYLON.Vector3(mX/moveScale, 0, mY/moveScale);
            window.scene.activeCamera.position.addInPlace(movementVector);
            // if (second < 6.4)
        }
        window.addEventListener('mousemove',mouseMove,false);
    } 
}

function scrollToStep(scrollIndex) {

    $('.navbar-collapse').collapse('hide');

    currentStep = scrollIndex;
    scrollToAnimated(scrollSections, scrollSteps[currentStep], scrollSpeed);
}