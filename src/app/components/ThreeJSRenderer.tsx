import React, { useRef, useEffect, useCallback } from 'react';
import { THREE, OrbitControls, OBJLoader, GLTFLoader, EffectComposer, RenderPass, ShaderPass } from '../utils/three';
import { LevelsEffect, ASCIIEffect, DitherEffect, createAsciiCharTexture, createPaletteTexture } from '../utils/shaders';

interface ThreeJSRendererProps {
  width: number;
  height: number;
  aspectRatio: number;
  effectSettings: any;
  onModelLoad?: (model: THREE.Object3D) => void;
  onVideoLoad?: (aspectRatio: { width: number; height: number }) => void;
  onImageLoad?: (aspectRatio: { width: number; height: number }) => void;
  autoRotate: boolean;
}

interface ThreeJSRendererRef {
  loadFile: (file: File) => Promise<THREE.Object3D>;
  resetCamera: () => void;
  exportImage: (scale?: number) => Promise<string>;
  exportVideo: (scale?: number, onProgress?: (progress: number) => void) => Promise<string>;
}

const ThreeJSRenderer = React.forwardRef<ThreeJSRendererRef, ThreeJSRendererProps>(({ 
  width, 
  height, 
  aspectRatio, 
  effectSettings, 
  onModelLoad, 
  onVideoLoad,
  onImageLoad,
  autoRotate 
}, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const levelsPassRef = useRef<ShaderPass | null>(null);
  const asciiPassRef = useRef<ShaderPass | null>(null);
  const ditherPassRef = useRef<ShaderPass | null>(null);

  // Light refs
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemisphereLightRef = useRef<THREE.HemisphereLight | null>(null);

  const currentModelRef = useRef<THREE.Object3D | null>(null);
  const animationIdRef = useRef<number>();
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const isVideoRef = useRef<boolean>(false);
  const isImageRef = useRef<boolean>(false);
  const initializedRef = useRef<boolean>(false);

  const initThreeJS = useCallback(() => {
    if (!mountRef.current || initializedRef.current) return;

    initializedRef.current = true;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 1000);
    camera.position.set(0, 1, 5);
    cameraRef.current = camera;

    // Renderer with enhanced settings for brightness
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Enhanced lighting setup for maximum brightness and contrast
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    // Main directional light (key light)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3.0);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.bias = -0.0001;
    scene.add(directionalLight);
    directionalLightRef.current = directionalLight;

    // Fill light from opposite side
    const fillLight = new THREE.DirectionalLight(0xffffff, 2.0);
    fillLight.position.set(-5, 5, -7.5);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    // Additional rim light for better definition
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.5);
    rimLight.position.set(0, -5, 5);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // Hemisphere light for even more environmental lighting
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    scene.add(hemisphereLight);
    hemisphereLightRef.current = hemisphereLight;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.0;
    controlsRef.current = controls;

    // Post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const levelsPass = new ShaderPass(LevelsEffect);
    composer.addPass(levelsPass);
    levelsPassRef.current = levelsPass;

    const asciiPass = new ShaderPass(ASCIIEffect);
    composer.addPass(asciiPass);
    asciiPassRef.current = asciiPass;

    const ditherPass = new ShaderPass(DitherEffect);
    composer.addPass(ditherPass);
    ditherPassRef.current = ditherPass;



    composerRef.current = composer;

    // Default model (torus knot)
    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      roughness: 0.5,
      metalness: 0.5
    });
    const torusKnot = new THREE.Mesh(geometry, material);
    setupModel(torusKnot);

    updateEffectSettings();
  }, []);

  const setupModel = useCallback((model: THREE.Object3D) => {
    if (!sceneRef.current || !controlsRef.current || !cameraRef.current) return;

    // Remove current model
    if (currentModelRef.current) {
      sceneRef.current.remove(currentModelRef.current);
    }

    // Mark as not video or image
    isVideoRef.current = false;
    isImageRef.current = false;

    // Setup new model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    model.position.sub(center);
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2.5 / maxDim;
    model.scale.setScalar(scale);

    model.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

    currentModelRef.current = model;
    sceneRef.current.add(model);

    // Reset camera
    controlsRef.current.reset();
    controlsRef.current.target.copy(model.position);
    cameraRef.current.position.set(0, size.y * scale * 0.5, size.z * scale * 2);
    cameraRef.current.lookAt(model.position);
    controlsRef.current.update();

    onModelLoad?.(model);
  }, [onModelLoad]);

  const setupVideoPlane = useCallback((videoElement: HTMLVideoElement) => {
    if (!sceneRef.current || !controlsRef.current || !cameraRef.current) return;

    // Remove current model
    if (currentModelRef.current) {
      sceneRef.current.remove(currentModelRef.current);
    }

    // Mark as video
    isVideoRef.current = true;
    isImageRef.current = false;

    // Create video texture
    const videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;

    // Calculate aspect ratio from video
    const videoAspectRatio = videoElement.videoWidth / videoElement.videoHeight;
    
    // Create plane geometry with correct aspect ratio
    const planeGeometry = new THREE.PlaneGeometry(videoAspectRatio * 2, 2);
    const planeMaterial = new THREE.MeshBasicMaterial({ 
      map: videoTexture,
      side: THREE.DoubleSide
    });
    
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.set(0, 0, 0);

    currentModelRef.current = plane;
    sceneRef.current.add(plane);

    // Calculate optimal camera distance to fill canvas perfectly
    // Camera FOV is 50 degrees, plane height is 2
    const fovRadians = (50 * Math.PI) / 180;
    const planeHeight = 2;
    const optimalDistance = (planeHeight / 2) / Math.tan(fovRadians / 2);

    // Reset camera for video - perpendicular to Z-axis with optimal distance
    controlsRef.current.reset();
    controlsRef.current.target.set(0, 0, 0);
    cameraRef.current.position.set(0, 0, optimalDistance);
    cameraRef.current.lookAt(0, 0, 0);
    cameraRef.current.up.set(0, 1, 0);
    controlsRef.current.update();

    // Notify parent about video aspect ratio
    onVideoLoad?.({ 
      width: videoElement.videoWidth, 
      height: videoElement.videoHeight 
    });

    onModelLoad?.(plane);
  }, [onModelLoad, onVideoLoad]);

  const setupImagePlane = useCallback((imageElement: HTMLImageElement) => {
    if (!sceneRef.current || !controlsRef.current || !cameraRef.current) return;

    // Remove current model
    if (currentModelRef.current) {
      sceneRef.current.remove(currentModelRef.current);
    }

    // Mark as image
    isImageRef.current = true;
    isVideoRef.current = false;

    // Create image texture
    const imageTexture = new THREE.Texture(imageElement);
    imageTexture.needsUpdate = true;
    imageTexture.minFilter = THREE.LinearFilter;
    imageTexture.magFilter = THREE.LinearFilter;

    // Calculate aspect ratio from image
    const imageAspectRatio = imageElement.naturalWidth / imageElement.naturalHeight;
    
    // Create plane geometry with correct aspect ratio
    const planeGeometry = new THREE.PlaneGeometry(imageAspectRatio * 2, 2);
    const planeMaterial = new THREE.MeshBasicMaterial({ 
      map: imageTexture,
      side: THREE.DoubleSide
    });
    
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.set(0, 0, 0);

    currentModelRef.current = plane;
    sceneRef.current.add(plane);

    // Calculate optimal camera distance to fill canvas perfectly
    // Camera FOV is 50 degrees, plane height is 2
    const fovRadians = (50 * Math.PI) / 180;
    const planeHeight = 2;
    const optimalDistance = (planeHeight / 2) / Math.tan(fovRadians / 2);

    // Reset camera for image - perpendicular to Z-axis with optimal distance
    controlsRef.current.reset();
    controlsRef.current.target.set(0, 0, 0);
    cameraRef.current.position.set(0, 0, optimalDistance);
    cameraRef.current.lookAt(0, 0, 0);
    cameraRef.current.up.set(0, 1, 0);
    controlsRef.current.update();

    // Notify parent about image aspect ratio
    onImageLoad?.({ 
      width: imageElement.naturalWidth, 
      height: imageElement.naturalHeight 
    });

    onModelLoad?.(plane);
  }, [onModelLoad, onImageLoad]);

  const loadFile = useCallback((file: File) => {
    if (!file) return Promise.reject('No file provided');

    const fileURL = URL.createObjectURL(file);
    const fileName = file.name.toLowerCase();

    return new Promise<THREE.Object3D>((resolve, reject) => {
      // Check if it's a video file
      if (fileName.match(/\.(mp4|webm|mov)$/)) {
        // Clean up previous video if exists
        if (videoElementRef.current) {
          videoElementRef.current.pause();
          videoElementRef.current.src = '';
          videoElementRef.current = null;
        }

        const video = document.createElement('video');
        video.src = fileURL;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.crossOrigin = 'anonymous';
        
        video.addEventListener('loadedmetadata', () => {
          videoElementRef.current = video;
          setupVideoPlane(video);
          video.play();
          resolve(currentModelRef.current!);
        });

        video.addEventListener('error', (error) => {
          reject(error);
        });

        video.load();
      } else if (fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) {
        // Clean up video if switching from video to image
        if (videoElementRef.current) {
          videoElementRef.current.pause();
          videoElementRef.current.src = '';
          videoElementRef.current = null;
        }

        const image = new Image();
        image.crossOrigin = 'anonymous';
        
        image.onload = () => {
          setupImagePlane(image);
          resolve(currentModelRef.current!);
        };

        image.onerror = (error) => {
          reject(error);
        };

        image.src = fileURL;
      } else if (fileName.endsWith('.obj')) {
        // Clean up video if switching from video/image to 3D model
        if (videoElementRef.current) {
          videoElementRef.current.pause();
          videoElementRef.current.src = '';
          videoElementRef.current = null;
        }

        const loader = new OBJLoader();
        loader.load(
          fileURL,
          (object) => {
            setupModel(object);
            resolve(object);
          },
          undefined,
          (error) => reject(error)
        );
      } else if (fileName.match(/\.(glb|gltf)$/)) {
        // Clean up video if switching from video/image to 3D model
        if (videoElementRef.current) {
          videoElementRef.current.pause();
          videoElementRef.current.src = '';
          videoElementRef.current = null;
        }

        const loader = new GLTFLoader();
        loader.load(
          fileURL,
          (gltf) => {
            setupModel(gltf.scene);
            resolve(gltf.scene);
          },
          undefined,
          (error) => reject(error)
        );
      } else {
        reject('Unsupported file format');
      }
    });
  }, [setupModel, setupVideoPlane, setupImagePlane]);

  const updateLighting = useCallback(() => {
    if (!directionalLightRef.current) return;
    
    const { lighting } = effectSettings;
    const angle = (lighting?.directionalAngle || -45) * (Math.PI / 180); // Convert to radians
    const intensity = (lighting?.intensity || 80) / 100; // Convert percentage to 0-1
    
    // Calculate position based on angle (rotating around Y axis)
    const distance = 10;
    const x = Math.sin(angle) * distance;
    const z = Math.cos(angle) * distance;
    const y = 10; // Keep height constant
    
    directionalLightRef.current.position.set(x, y, z);
    directionalLightRef.current.intensity = 3.0 * intensity;
    
    // Update other lights based on intensity
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = 2.5 * intensity;
    }
    if (fillLightRef.current) {
      fillLightRef.current.intensity = 2.0 * intensity;
    }
    if (rimLightRef.current) {
      rimLightRef.current.intensity = 1.5 * intensity;
    }
    if (hemisphereLightRef.current) {
      hemisphereLightRef.current.intensity = 1.0 * intensity;
    }
  }, [effectSettings]);

  const updateEffectSettings = useCallback(() => {
    if (!levelsPassRef.current || !asciiPassRef.current || !ditherPassRef.current || !sceneRef.current) return;

    const { effectType, brightness, contrast, ascii, dither, colors, target } = effectSettings;
    
    // Update lighting
    updateLighting();

    // Reset all passes
    levelsPassRef.current.enabled = false;
    asciiPassRef.current.enabled = false;
    ditherPassRef.current.enabled = false;

    // Configure target mode - simplified implementation focusing on background
    const targetMode = target?.mode || 'fullScene';
    
    if (effectType === 'none') {
      // Determine background color for no-effect mode
      let noEffectBackgroundColor;
      if (target?.background?.type === 'solid') {
        noEffectBackgroundColor = target.background.solidColor || '#eeeeee';
      } else if (target?.background?.type === 'transparent') {
        noEffectBackgroundColor = null;
      } else {
        noEffectBackgroundColor = effectSettings.isDark ? '#1f2937' : '#eeeeee';
      }
      
      if (noEffectBackgroundColor === null) {
        sceneRef.current.background = null;
      } else {
        sceneRef.current.background = new THREE.Color(noEffectBackgroundColor);
      }
      
      return;
    }

    // Enable levels pass for all effects
    levelsPassRef.current.enabled = true;
    levelsPassRef.current.uniforms.uBrightness.value = brightness;
    levelsPassRef.current.uniforms.uContrast.value = contrast;

    // Get active colors
    const activeColors = colors.palette
      .filter((_: string, index: number) => colors.active[index])
      .map((color: string) => color);

    const paletteTexture = createPaletteTexture(activeColors);

    // Determine the background color based on target settings
    let finalBackgroundColor;
    if (target?.background?.type === 'solid') {
      finalBackgroundColor = target.background.solidColor || '#eeeeee';
    } else if (target?.background?.type === 'transparent') {
      finalBackgroundColor = null;
    } else {
      // Always respect the background color setting, regardless of palette mode
      finalBackgroundColor = colors.background;
    }

    if (effectType === 'ascii') {
      asciiPassRef.current.enabled = true;
      
      // Update ASCII settings
      asciiPassRef.current.uniforms.uCharSize.value.set(ascii.resolution, ascii.resolution);
      asciiPassRef.current.uniforms.uResolution.value.set(width, height);

      // Create character texture
      const { texture, count } = createAsciiCharTexture(ascii.characters, ascii.scale, ascii.font);
      if (asciiPassRef.current.uniforms.uCharSet.value) {
        asciiPassRef.current.uniforms.uCharSet.value.dispose();
      }
      asciiPassRef.current.uniforms.uCharSet.value = texture;
      asciiPassRef.current.uniforms.uCharCount.value = count;

      // Set colors
      asciiPassRef.current.uniforms.uColor.value.set(ascii.color);
      asciiPassRef.current.uniforms.uUsePalette.value = colors.usePalette;
      asciiPassRef.current.uniforms.uUseColorTrio.value = ascii.useColorTrio;
      
      // Set color trio
      if (ascii.useColorTrio && ascii.colorTrio) {
        asciiPassRef.current.uniforms.uColorTrio.value = ascii.colorTrio.map((color: string) => new THREE.Color(color));
      }

      if (colors.usePalette) {
        if (asciiPassRef.current.uniforms.uPaletteMap.value) {
          asciiPassRef.current.uniforms.uPaletteMap.value.dispose();
        }
        asciiPassRef.current.uniforms.uPaletteMap.value = paletteTexture;
        asciiPassRef.current.uniforms.uPaletteColorCount.value = activeColors.length;
      } else {
        asciiPassRef.current.uniforms.uBackgroundColor.value.set(colors.background);
      }
      
      // Set final background color
      if (finalBackgroundColor === null) {
        sceneRef.current.background = null;
      } else {
        sceneRef.current.background = new THREE.Color(finalBackgroundColor);
      }
    } else if (effectType === 'bayer' || effectType === 'noise') {
      ditherPassRef.current.enabled = true;
      
      ditherPassRef.current.uniforms.uResolution.value.set(width, height);
      if (ditherPassRef.current.uniforms.uPaletteMap.value) {
        ditherPassRef.current.uniforms.uPaletteMap.value.dispose();
      }
      ditherPassRef.current.uniforms.uPaletteMap.value = paletteTexture;
      ditherPassRef.current.uniforms.uPaletteColorCount.value = activeColors.length;
      ditherPassRef.current.uniforms.uDitherScale.value = dither.scale;
      
      if (effectType === 'bayer') {
        ditherPassRef.current.uniforms.uDitherMode.value = 0;
        ditherPassRef.current.uniforms.uMatrixType.value = dither.matrixType;
      } else {
        ditherPassRef.current.uniforms.uDitherMode.value = 1;
      }
      
      // Set final background color
      if (finalBackgroundColor === null) {
        sceneRef.current.background = null;
      } else {
        sceneRef.current.background = new THREE.Color(finalBackgroundColor);
      }
    }
  }, [effectSettings, width, height]);

  const animate = useCallback(() => {
    if (!controlsRef.current || !composerRef.current) return;
    
    controlsRef.current.update();
    composerRef.current.render();
    animationIdRef.current = requestAnimationFrame(animate);
  }, []);

  const resetCamera = useCallback(() => {
    if (!controlsRef.current || !cameraRef.current || !currentModelRef.current) return;

    if (isVideoRef.current || isImageRef.current) {
      // For videos and images, reset to perpendicular position to Z-axis with optimal distance
      const fovRadians = (50 * Math.PI) / 180;
      const planeHeight = 2;
      const optimalDistance = (planeHeight / 2) / Math.tan(fovRadians / 2);
      
      controlsRef.current.reset();
      controlsRef.current.target.set(0, 0, 0);
      cameraRef.current.position.set(0, 0, optimalDistance);
      cameraRef.current.lookAt(0, 0, 0);
      cameraRef.current.up.set(0, 1, 0);
      controlsRef.current.update();
    } else {
      // For 3D models, use existing logic
      const box = new THREE.Box3().setFromObject(currentModelRef.current);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2.5 / maxDim;
      
      controlsRef.current.reset();
      controlsRef.current.target.copy(currentModelRef.current.position);
      cameraRef.current.position.set(0, size.y * scale * 0.5, size.z * scale * 2);
      cameraRef.current.lookAt(currentModelRef.current.position);
      controlsRef.current.update();
    }
  }, []);

  const exportImage = useCallback((scale: number = 1) => {
    return new Promise<string>((resolve, reject) => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !composerRef.current) {
        reject('Renderer not ready');
        return;
      }

      if (scale === 1) {
        // Use current canvas dimensions - no need to resize
        composerRef.current.render();
        const dataURL = rendererRef.current.domElement.toDataURL('image/png');
        resolve(dataURL);
        return;
      }

      // Store current size
      const currentWidth = rendererRef.current.domElement.width;
      const currentHeight = rendererRef.current.domElement.height;
      
      // Calculate scaled dimensions
      const targetWidth = Math.round(currentWidth * scale);
      const targetHeight = Math.round(currentHeight * scale);
      
      // Temporarily resize for export
      rendererRef.current.setSize(targetWidth, targetHeight);
      composerRef.current.setSize(targetWidth, targetHeight);
      
      // Update camera aspect ratio
      const originalAspect = cameraRef.current.aspect;
      cameraRef.current.aspect = targetWidth / targetHeight;
      cameraRef.current.updateProjectionMatrix();
      
      // Update uniform resolutions
      if (asciiPassRef.current) {
        asciiPassRef.current.uniforms.uResolution.value.set(targetWidth, targetHeight);
      }
      if (ditherPassRef.current) {
        ditherPassRef.current.uniforms.uResolution.value.set(targetWidth, targetHeight);
      }
      
      // Render at scaled resolution
      composerRef.current.render();
      
      // Get the data URL
      const dataURL = rendererRef.current.domElement.toDataURL('image/png');
      
      // Restore original size
      rendererRef.current.setSize(currentWidth, currentHeight);
      composerRef.current.setSize(currentWidth, currentHeight);
      cameraRef.current.aspect = originalAspect;
      cameraRef.current.updateProjectionMatrix();
      
      // Restore uniform resolutions
      if (asciiPassRef.current) {
        asciiPassRef.current.uniforms.uResolution.value.set(currentWidth, currentHeight);
      }
      if (ditherPassRef.current) {
        ditherPassRef.current.uniforms.uResolution.value.set(currentWidth, currentHeight);
      }
      
      resolve(dataURL);
    });
  }, []);

  const exportVideo = useCallback((scale: number = 1, onProgress?: (progress: number) => void) => {
    return new Promise<string>((resolve, reject) => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !composerRef.current || !controlsRef.current) {
        reject('Renderer not ready');
        return;
      }

      // Store current settings
      const currentWidth = rendererRef.current.domElement.width;
      const currentHeight = rendererRef.current.domElement.height;
      const originalAspect = cameraRef.current.aspect;
      const originalAutoRotate = controlsRef.current.autoRotate;
      
      // Calculate scaled dimensions
      const targetWidth = Math.round(currentWidth * scale);
      const targetHeight = Math.round(currentHeight * scale);
      
      // Resize for export if scale is not 1
      if (scale !== 1) {
        rendererRef.current.setSize(targetWidth, targetHeight);
        composerRef.current.setSize(targetWidth, targetHeight);
        cameraRef.current.aspect = targetWidth / targetHeight;
        cameraRef.current.updateProjectionMatrix();
        
        // Update uniform resolutions
        if (asciiPassRef.current) {
          asciiPassRef.current.uniforms.uResolution.value.set(targetWidth, targetHeight);
        }
        if (ditherPassRef.current) {
          ditherPassRef.current.uniforms.uResolution.value.set(targetWidth, targetHeight);
        }
      }
      
      // Enable auto-rotation only for 3D objects, not for videos or images
      if (!isVideoRef.current && !isImageRef.current) {
        controlsRef.current.autoRotate = true;
        controlsRef.current.autoRotateSpeed = 2.0;
      }
      
      // Video recording setup
      const canvas = rendererRef.current.domElement;
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        // Restore original settings
        if (scale !== 1) {
          rendererRef.current!.setSize(currentWidth, currentHeight);
          composerRef.current!.setSize(currentWidth, currentHeight);
          cameraRef.current!.aspect = originalAspect;
          cameraRef.current!.updateProjectionMatrix();
          
          // Restore uniform resolutions
          if (asciiPassRef.current) {
            asciiPassRef.current.uniforms.uResolution.value.set(currentWidth, currentHeight);
          }
          if (ditherPassRef.current) {
            ditherPassRef.current.uniforms.uResolution.value.set(currentWidth, currentHeight);
          }
        }
        
        controlsRef.current!.autoRotate = originalAutoRotate;
        controlsRef.current!.autoRotateSpeed = 1.0;
        
        resolve(url);
      };
      
      mediaRecorder.onerror = (error) => {
        reject(error);
      };
      
      // Start recording
      mediaRecorder.start();
      
      // Record for 5 seconds with progress updates
      const duration = 5000; // 5 seconds
      const startTime = Date.now();
      
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        onProgress?.(progress);
        
        if (elapsed >= duration) {
          clearInterval(progressInterval);
          mediaRecorder.stop();
        }
      }, 100);
      
      // Continue animation during recording
      const recordingAnimate = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed < duration) {
          controlsRef.current!.update();
          composerRef.current!.render();
          requestAnimationFrame(recordingAnimate);
        }
      };
      recordingAnimate();
    });
  }, []);

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    loadFile,
    resetCamera,
    exportImage,
    exportVideo,
  }), [loadFile, resetCamera, exportImage, exportVideo]);

  // Initialize Three.js only once
  useEffect(() => {
    initThreeJS();
    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (videoElementRef.current) {
        videoElementRef.current.pause();
        videoElementRef.current.src = '';
      }
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      initializedRef.current = false;
    };
  }, [initThreeJS, animate]);

  // Update auto-rotation
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Update size
  useEffect(() => {
    if (rendererRef.current && cameraRef.current && composerRef.current) {
      rendererRef.current.setSize(width, height);
      composerRef.current.setSize(width, height);
      cameraRef.current.aspect = aspectRatio;
      cameraRef.current.updateProjectionMatrix();
      
      // Update uniform resolutions for ASCII and Dither effects
      if (asciiPassRef.current) {
        asciiPassRef.current.uniforms.uResolution.value.set(width, height);
      }
      if (ditherPassRef.current) {
        ditherPassRef.current.uniforms.uResolution.value.set(width, height);
      }
    }
  }, [width, height, aspectRatio]);

  // Update effect settings whenever they change
  useEffect(() => {
    updateEffectSettings();
  }, [updateEffectSettings]);

  return <div ref={mountRef} />;
});

ThreeJSRenderer.displayName = 'ThreeJSRenderer';

export default ThreeJSRenderer;