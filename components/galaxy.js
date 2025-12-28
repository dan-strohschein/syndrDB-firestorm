import { LitElement, html, css } from '../lib/lit/lit-core.min.js';
import { tsParticles } from '@tsparticles/engine';
import { loadAll } from '@tsparticles/all';

class Galaxy extends LitElement {
  static properties = {
    rotation: { type: Number }
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
      background: radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%);
      overflow: hidden;
    }

    #galaxy-container {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }

    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  `;

  constructor() {
    super();
    this.rotation = 0;
    this.particlesContainer = null;
  }

  firstUpdated() {
    // Wait a bit for tsParticles to be fully loaded
    setTimeout(() => this.initGalaxy(), 100);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.particlesContainer) {
      this.particlesContainer.destroy();
    }
  }

  // Disable shadow DOM
  createRenderRoot() {
    return this;
  }

  // Generate particles in a spiral galaxy shape (Milky Way style)
  generateGalaxyParticles(numArms = 4, particlesPerArm = 500) {
    const particles = [];
    const centerX = 50;
    const centerY = 50;
    
    // Create spiral arms
    for (let arm = 0; arm < numArms; arm++) {
      const armAngle = (arm * Math.PI * 2) / numArms;
      
      for (let i = 0; i < particlesPerArm; i++) {
        const t = i / particlesPerArm;
        
        // Logarithmic spiral formula for realistic galaxy arms
        const angle = armAngle + t * Math.PI * 4 + this.rotation;
        const radius = t * 40; // Max radius of 40% of container
        
        // Add randomness to create thickness in arms
        const randomAngle = angle + (Math.random() - 0.5) * 0.5;
        const randomRadius = radius + (Math.random() - 0.5) * 3;
        
        // Convert polar to cartesian coordinates
        const x = centerX + randomRadius * Math.cos(randomAngle);
        const y = centerY + randomRadius * Math.sin(randomAngle);
        
        // Calculate distance from center for size/opacity variation
        const distanceFromCenter = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        
        // Star properties based on distance
        const size = Math.random() * 2 + 0.5;
        const opacityLevel = Math.max(0.2, 1 - (distanceFromCenter / 50) + Math.random() * 0.3);
        
        const opacity ={
                value: { min: 0.2, max: 1 },
             animation: {
               enable: true,
               speed: 0.5,
               sync: false
             }
        }

        const sizeProp = {
          value: { min: 0.5, max: 3 }
        }

        // Color variation (warm to cool stars)
        const colorRand = Math.random();
        let color;
        if (colorRand < 0.3) {
          color = '#ffffff'; // White stars
        } else if (colorRand < 0.6) {
          color = '#ffeaa7'; // Yellow stars
        } else if (colorRand < 0.8) {
          color = '#74b9ff'; // Blue stars
        } else {
          color = '#fab1a0'; // Red stars
        }

         //   color: {
        //     value: ['#ffffff', '#ffeaa7', '#74b9ff', '#fab1a0']
        //   },
        //   shape: {
        //     type: 'circle'
        //   },
        //   opacity: {
        //     value: { min: 0.2, max: 1 },
        //     animation: {
        //       enable: true,
        //       speed: 0.5,
        //       sync: false
        //     }
        //   },
        //   size: {
        //     value: { min: 0.5, max: 3 }
        //   },
        
        particles.push({
          position: { x, y },
          options: {
            size: sizeProp,
            color: color,
            shape : { type: 'circle' },
             opacity: opacity
        }
          
        });
      }
    }
    
    // Add dense central bulge
    for (let i = 0; i < 300; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 8; // Smaller radius for bulge
      
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      particles.push({
        position: { x, y },
        options: {
            size: {value: { min: 0.5, max: 3} },
            color: {
             value: ['#ffffff', '#ffeaa7', '#74b9ff', '#fab1a0']
           },
            shape : { type: 'circle' },
             opacity: {
                value: { min: 0.2, max: 1 },
             animation: {
               enable: true,
               speed: 0.5,
               sync: false
             }
            }
        }
      });
    }
    
    return particles;
  }

  manuallyAddParticles(galaxyParticles) {
    if (!this.particlesContainer) return;
    
    const particlesManager = this.particlesContainer.particles;
    if (!particlesManager) return;
    
    console.log('Creating particles manually...');
    
    // First try calling init on the particles manager
    if (typeof particlesManager.init === 'function') {
      console.log('Calling particles.init()...');
      try {
        particlesManager.init();
        
        // Check if init created particles
        setTimeout(() => {
          const particles = particlesManager.array || [];
          console.log(`After init: ${particles.length} particles`);
          
          if (particles.length > 0) {
            this.positionParticles(galaxyParticles);
            this.startRotation();
          } else {
            // Init didn't work, try adding manually
            console.log('Init did not create particles, trying addParticle...');
            this.tryAddingParticlesManually(galaxyParticles, particlesManager);
          }
        }, 200);
      } catch (e) {
        console.error('Error calling init:', e);
      }
    } else {
      this.tryAddingParticlesManually(galaxyParticles, particlesManager);
    }
  }
  
  tryAddingParticlesManually(galaxyParticles, particlesManager) {
    console.log('Manually adding particles one by one...');
    
    galaxyParticles.forEach((particleData, index) => {
      try {
        const x = (particleData.position.x / 100) * this.particlesContainer.canvas.size.width;
        const y = (particleData.position.y / 100) * this.particlesContainer.canvas.size.height;
        
        // Try addParticle with position
        if (typeof particlesManager.addParticle === 'function') {
          particlesManager.addParticle({ x, y });
        }
      } catch (e) {
        if (index === 0) console.error('Error adding particle:', e);
      }
    });
    
    // Check if particles were added
    setTimeout(() => {
      const particles = particlesManager.array || [];
      console.log(`After manual add: ${particles.length} particles`);
      if (particles.length > 0) {
        this.positionParticles(galaxyParticles);
        this.startRotation();
      }
    }, 100);
  }

  async initGalaxy() {
    const container = this.querySelector('#galaxy-container');
    
    // Wait for tsparticles to load
    if (!tsParticles) {
      console.error('tsParticles not loaded');
      return;
    }

    console.log('Initializing galaxy with tsParticles...');

    const galaxyParticles = this.generateGalaxyParticles(4, 500);
    
    try {
      // Initialize tsParticles - try the container method
      const options = {
        background: {
          color: 'rgb(0, 0, 0)',
          opacity: 0
        },
        fullScreen: {
          enable: false
        },
        // particles: {
        //   number: {
        //     value: 2300,
        //     density: {
        //       enable: false
        //     }
        //   },
        //   color: {
        //     value: ['#ffffff', '#ffeaa7', '#74b9ff', '#fab1a0']
        //   },
        //   shape: {
        //     type: 'circle'
        //   },
        //   opacity: {
        //     value: { min: 0.2, max: 1 },
        //     animation: {
        //       enable: true,
        //       speed: 0.5,
        //       sync: false
        //     }
        //   },
        //   size: {
        //     value: { min: 0.5, max: 3 }
        //   },
        //   move: {
        //     enable: false,
        //     speed: 0
        //   }
        // },
        manualParticles: galaxyParticles,
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: 'grab'
            }
          },
          modes: {
            grab: {
              distance: 150
            }
          }
        }
      };


       const loadPromise = tsParticles.load({ 
          id: 'galaxy-container',
          element: container,
          options: options 
        });
      // Use the set method to initialize - pass element and options as separate params
      
      loadPromise.then(container => {
            this.particlesContainer = container;

            console.log('tsParticles loaded:', this.particlesContainer);
            console.log('Particles object:', this.particlesContainer.particles);
            
            // Wait for particles to be initialized
            if (this.particlesContainer) {

setTimeout(() => {
            this.positionParticles(galaxyParticles);
            this.startRotation();
            }, 500);


                // Check particle count with retries
                // let attempts = 0;
                // const checkParticles = () => {
                // const particlesManager = this.particlesContainer.particles;
                // const particles = particlesManager?._array || [];
                // console.log(`Attempt ${attempts + 1}: Found ${particles.length} particles`);
                
                // if (particles.length > 0) {
                //     console.log('Particles ready, positioning them...');
                //     this.positionParticles(galaxyParticles);
                //     this.startRotation();
                // } else if (attempts < 10) {
                //     attempts++;
                //     setTimeout(checkParticles, 200);
                // } else {
                //     // console.error('Failed to initialize particles after multiple attempts');
                //     // console.log('particlesContainer structure:', Object.keys(this.particlesContainer));
                //     // console.log('particles manager:', particlesManager);
                //     // console.log('particles manager methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(particlesManager)));
                //     // console.log('Canvas size:', this.particlesContainer.canvas?.size);
                //     // console.log('Canvas element:', this.particlesContainer.canvas?.element);
                //     // console.log('actualOptions.particles:', this.particlesContainer.actualOptions?.particles);
                //     // console.log('Container started:', this.particlesContainer.started);
                //     // console.log('Container destroyed:', this.particlesContainer.destroyed);
                    
                //     // Try to start the container if it's not started
                //     if (!this.particlesContainer.started && typeof this.particlesContainer.start === 'function') {
                //     console.log('Attempting to start the container...');
                //     this.particlesContainer.start();
                    
                //     setTimeout(() => {
                //         const particles = particlesManager?.array || [];
                //         console.log(`After start: ${particles.length} particles`);
                //         if (particles.length > 0) {
                //         this.positionParticles(galaxyParticles);
                //         this.startRotation();
                //         } else {
                //         console.log('Start did not help, trying manual add...');
                //         this.manuallyAddParticles(galaxyParticles);
                //         }
                //     }, 300);
                //     } else {
                //     // Try to manually add particles
                //     console.log('Attempting to manually add particles...');
                //     this.manuallyAddParticles(galaxyParticles);
                //     }
                // }
                // };
                
                // checkParticles();
            }

      });
      
    } catch (error) {
      console.error('Error initializing tsParticles:', error);
    }
  }

  positionParticles(galaxyParticles) {
    // Access particles through the container's particles property
    const particlesManager = this.particlesContainer.particles;
    if (!particlesManager) {
      console.error('Particles manager not ready');
      return;
    }

    // Get all particles - the API might use different property names
    // let particles = particlesManager.array;
    // if (!particles) {
    //   particles = Array.from(particlesManager);
    // }

    let particles = particlesManager._array; // Fallback to internal array if needed, since its not exposed anywhere
    console.log("wasting time yo! ", particlesManager._array)
    console.log(`Positioning ${particles.length} particles into galaxy shape...`);
    console.log('First particle:', particles[0]);
    console.log('Canvas size:', this.particlesContainer.canvas.size);
    
    galaxyParticles.forEach((particleData, index) => {
      if (particles[index]) {
        const particle = particles[index];
        const newX = (particleData.position.x / 100) * this.particlesContainer.canvas.size.width;
        const newY = (particleData.position.y / 100) * this.particlesContainer.canvas.size.height;
        
        particle.position.x = newX;
        particle.position.y = newY;
        
        // Try different ways to set size/opacity
        if (particle.size) {
          if (typeof particle.size === 'object' && 'value' in particle.size) {
            particle.size.value = particleData.size;
          } else {
            particle.size = particleData.size;
          }
        }
        
        if (particle.opacity) {
          if (typeof particle.opacity === 'object' && 'value' in particle.opacity) {
            particle.opacity.value = particleData.opacity;
          } else {
            particle.opacity = particleData.opacity;
          }
        }
      }
    });
    
    // Force a refresh if available
    if (this.particlesContainer.refresh) {
      const bob = this.particlesContainer.refresh();

      bob.then((ack) => {
       
        console.log('Particles refreshed after positioning.');
      });
    }
  }

  startRotation() {
    const rotationSpeed = 0.00025; // Slow rotation
    
    const animate = () => {
      if (!this.particlesContainer || !this.particlesContainer.canvas) return;
      
      const centerX = this.particlesContainer.canvas.size.width / 2;
      const centerY = this.particlesContainer.canvas.size.height / 2;

      const particlesManager = this.particlesContainer.particles;
      if (!particlesManager) return;
      
      let particles = particlesManager._array;
      if (!particles) {
        particles = Array.from(particlesManager);
      }
      
      particles.forEach(particle => {
        if (!particle.position) return;
        
        // Calculate current angle and distance from center
        const dx = particle.position.x - centerX;
        const dy = particle.position.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const currentAngle = Math.atan2(dy, dx);
        
        // Rotate based on distance (differential rotation like real galaxies)
        const rotationAmount = rotationSpeed * (1 + (200 / (distance + 100)));
        const newAngle = currentAngle + rotationAmount;
        
        // Update position
        particle.position.x = centerX + distance * Math.cos(newAngle);
        particle.position.y = centerY + distance * Math.sin(newAngle);
      });

      requestAnimationFrame(animate);
    };

    animate();
  }

  render() {
    return html`
      <div id="galaxy-container" style="width: 100%; height: 100%; min-height: 600px; background: transparent; position: absolute;z-index:1000;"></div>
    `;
  }
}

customElements.define('galaxy-component', Galaxy);
