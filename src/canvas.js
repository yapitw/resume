import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import opentype from "./lib/threejs_plugin";

// import OrbitControls from 'three-orbitcontrols';
// THREE.OrbitControls = OrbitControls;

export default class CanvasBG {
  constructor() {
    this.init = this.init.bind(this);
    this.destroy = this.destroy.bind(this);
    this.mount = document.querySelector(".canvas-bg");
    if (this.mount) this.init();
  }
  init() {
    this.scene = new THREE.Scene();
    const scene = this.scene;
    let font = null;
    const elem = {};

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(1, 1);

    let intersected = null;
    let intersectPoint = null;

    function calDistance(a, b) {
      const x = a.x - b.x;
      const y = a.y - b.y;
      const z = a.z - b.z;
      const distance = Math.sqrt(x * x + y * y + z * z);
      return distance;
    }

    // 文字與滑鼠互動
    function interaction(x, y) {
      const canvas = renderer.domElement;
      const posX =
        x - (canvas.offsetLeft - (window.scrollX || window.pageXOffset));
      const posY =
        y - (canvas.offsetTop - (window.scrollY || window.pageYOffset));
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      mouse.x = (posX / width) * 2 - 1;
      mouse.y = -(posY / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      var intersects = raycaster.intersectObjects([plane]);

      if (intersects.length) {
        // console.log(intersects);
        intersectPoint = intersects[0].point;

        for (let i = 0; i < elem.text.length; i++) {
          const distance = calDistance(
            elem.text[i].geometry.boundingSphere.center,
            intersectPoint
          );
          if (distance < 1 && !elem.text[i].selected) {
            elem.text[i].selected = true;
            // elem.text[i].position.y = 0;
            elem.text[i].tween
              .stop()
              .to({ y: 0.3 * distance, x: 0, z: 0 }, 1000)
              .start();
          } else if (distance > 1 && elem.text[i].selected) {
            elem.text[i].selected = false;
            // elem.text[i].position.y = 0;
            elem.text[i].tween
              .stop()
              .to({ y: 0, x: 0, z: 0 }, 1000)
              .start();
          }
        }
      }

      camera.position.x = 1 + mouse.x * 0.1;
      camera.position.y = 1 + mouse.y * 0.1;
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    }

    function onMouseMove(event) {
      interaction(event.clientX, event.clientY);
    }

    function onTouchMove(event) {
      console.log(event);
      event.preventDefault();
      const x = event.touches[0].clientX;
      const y = event.touches[0].clientY;
      interaction(x, y);
    }

    // 設定攝影機
    const setCameraSize = () => {
      renderer.setSize(window.innerWidth, window.innerWidth * 0.5);
      const aspectRatio = window.innerWidth / (window.innerWidth * 0.5);
      let range = 1.6;
      if (window.innerWidth > window.innerHeight) {
        range = 2;
      } else {
        range = 1.6;
      }
      camera.left = aspectRatio * -range;
      camera.right = aspectRatio * range;
      camera.top = range;
      camera.bottom = -range;
      camera.updateProjectionMatrix();
    };

    // 滑鼠控制視角
    // const controls = new THREE.OrbitControls(camera);
    // controls.update();

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(
      window.devicePixelRatio > 1.5 ? 1.5 : window.devicePixelRatio
    );
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.mount.appendChild(renderer.domElement);

    window.camera = new THREE.OrthographicCamera(1, 1, 1, 1, -50, 1000);
    setCameraSize();

    const light = new THREE.HemisphereLight(0xffffff, 0x0033ee, 0.5);
    light.position.x = 2;
    light.position.y = 5;
    light.position.z = -1;
    scene.add(light);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.3);
    dirLight.position.x = 2;
    dirLight.position.y = 5;
    dirLight.position.z = -1;

    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 500;
    // dirLight.shadow.radius = 0;
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    raycaster.setFromCamera(mouse, camera);

    // 建立平面
    const plane = new THREE.Mesh(
      new THREE.CircleBufferGeometry(4, 32),
      new THREE.ShadowMaterial({
        color: 0x001166,
        opacity: 0.7
      })
    );
    plane.rotation.x = -Math.PI * 0.5;
    plane.receiveShadow = true;
    scene.add(plane);

    // 讀取字型
    opentype.load("font/CreteRound-Regular.ttf", (err, font) => {
      createTextMeshes(font);
    });
    const geo_option = {
      amount: 0.13,
      bevelEnabled: false,
      material: 0,
      extrudeMaterial: 1
    };
    const createTextMeshes = font => {
      // const texture = new THREE.TextureLoader().load("textures/gradient2.png");
      const material = [
        new THREE.MeshPhongMaterial({
          color: 0xffffff,
          flatShading: true
          // map: texture,
        }),
        new THREE.MeshPhongMaterial({
          // color: 0xffb7f6,
          color: 0xcccccc,
          flatShading: true
        })
      ];
      const textGeoArr1 = font.getTextGeometry({
        text: "Pattison",
        x: -1.8,
        y: -0.7,
        fontSize: 1,
        geo_option
      });
      // console.log(textGeo);

      const textGeoArr2 = font.getTextGeometry({
        text: "Front End",
        x: -2.2,
        y: 0.3,
        fontSize: 1,
        geo_option
      });

      const textGeoArr3 = font.getTextGeometry({
        text: "Dev.",
        x: -0.9,
        y: 1.3,
        fontSize: 1,
        geo_option
      });

      const textGeoArr = [...textGeoArr1, ...textGeoArr2, ...textGeoArr3];
      // console.log(textGeoArr);

      elem.text = [];
      for (let i = 0; i < textGeoArr.length; i++) {
        let mesh = new THREE.Mesh(textGeoArr[i], material);

        elem.text.push(mesh);
      }

      for (let i = 0; i < elem.text.length; i++) {
        const target = elem.text[i];
        target.selected = false;
        target.tempPosition = { x: 0, y: 0, z: 0 };
        target.tween = new TWEEN.Tween(target.tempPosition)
          .easing(TWEEN.Easing.Quadratic.Out)
          .onUpdate(obj => {
            target.position.y = obj.y;
            target.rotation.x = obj.x;
            target.rotation.z = obj.z;
          });
        // console.log(target)
        target.castShadow = true;
        scene.add(target);
      }
    };

    camera.position.z = 1;
    camera.position.y = 1;
    camera.position.x = 1;
    camera.lookAt(0, 0, 0);

    window.addEventListener("resize", setCameraSize);
    renderer.domElement.addEventListener("mousemove", onMouseMove, false);
    renderer.domElement.addEventListener("touchmove", onTouchMove, false);
    renderer.domElement.addEventListener("touchstart", event => {
      event.preventDefault();
    });
    const animate = () => {
      this.frameId = requestAnimationFrame(animate);
      TWEEN.update();
      renderer.render(scene, camera);
      // controls.update();
    };

    animate();

    // 加入其他幾何元素
    //   elem.sphere = new THREE.Mesh(
    //     new THREE.SphereGeometry(0.15,32,16),
    //     new THREE.MeshPhongMaterial({
    //       color: 0xcccccc
    //       // color: 0x2244ff,
    //     })
    //   );
    //   elem.sphere.position.x = -2.2;
    //   elem.sphere.position.y = 0.15;
    //   elem.sphere.position.z = 0.7;
    //   elem.sphere.castShadow = true;
    //   scene.add(elem.sphere);

    //   elem.cube = new THREE.Mesh(
    //     new THREE.CubeGeometry(0.2,0.2,0.2),
    //     new THREE.MeshPhongMaterial({
    //       color: 0xcccccc
    //       // color: 0x22ff44,
    //     })
    //   );
    //   elem.cube.position.x = 2.3;
    //   elem.cube.position.y = 0.1;
    //   elem.cube.position.z = -0.6;
    //   elem.cube.castShadow = true;
    //   scene.add(elem.cube);
  }

  destroy() {
    cancleAnimationFrame(this.frameId);
    window.removeEventListener("resize", setCameraSize);
  }
}
