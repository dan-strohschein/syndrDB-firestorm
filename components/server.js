import { LitElement, html, css } from '../lib/lit/lit-core.min.js';

class ServerComponent extends LitElement {
  
  

  constructor() {
    super();
    this.sendTimer = null;
  }


  // Disable shadow DOM
  createRenderRoot() {
    return this;
  }

  firstUpdated() {
    this.startRandomSendTimer();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up timer when component is removed
    if (this.sendTimer) {
      clearTimeout(this.sendTimer);
    }
  }

  startRandomSendTimer() {
    // const scheduleNextSend = () => {
    //   // Random interval between 2-5 seconds
    //   const delay = Math.random() * 3000 + 2000;
      
    //   this.sendTimer = setTimeout(() => {
    //     this.sendToRandomNode();
    //     scheduleNextSend(); // Schedule the next one
    //   }, delay);
    // };
    
    // scheduleNextSend();
  }

  sendToRandomNode() {
    const testNodes = document.querySelectorAll('test-node');
    if (testNodes.length === 0) return;
    
    // Pick a random test-node
    const randomIndex = Math.floor(Math.random() * testNodes.length);
    const randomNode = testNodes[randomIndex];
    
    // Call send with the random node
    if (randomNode) {
      this.send(randomNode);
    }
  }

  receive() {
    const icon = this.querySelector('i');
    if (!icon) return;
    
    // Animate blue flash
    icon.animate([
      { 
        filter: `drop-shadow(0 0 5px #00f) drop-shadow(0 0 10px #00f) drop-shadow(0 0 15px #00f)`,
        opacity: 1 
      },
      { 
        filter: `drop-shadow(0 0 20px #0088ff) drop-shadow(0 0 30px #0088ff) drop-shadow(0 0 40px #0088ff)`,
        opacity: 1 
      },
      { 
        filter: `drop-shadow(0 0 5px #00f) drop-shadow(0 0 10px #00f) drop-shadow(0 0 15px #00f)`,
        opacity: 1 
      }
    ], {
      duration: 400,
      easing: 'ease-in-out'
    });
  }

  async send(targetNode) {
    const icon = this.querySelector('i');
    if (!icon) return;
    
    // 1. Animate purple flash around the server
    await this.flashAnimation(icon, 'purple');
    
    // 2. Create and animate the traveling circle to the target node
    await this.animateTravelingCircleToNode(targetNode);
  }

  flashAnimation(element, color) {
    return new Promise((resolve) => {
      element.animate([
        { 
          filter: `drop-shadow(0 0 5px ${color}) drop-shadow(0 0 10px ${color}) drop-shadow(0 0 15px ${color})`,
          opacity: 1 
        },
        { 
          filter: `drop-shadow(0 0 20px ${color}) drop-shadow(0 0 30px ${color}) drop-shadow(0 0 40px ${color})`,
          opacity: 1 
        },
        { 
          filter: `drop-shadow(0 0 5px ${color}) drop-shadow(0 0 10px ${color}) drop-shadow(0 0 15px ${color})`,
          opacity: 1 
        }
      ], {
        duration: 400,
        easing: 'ease-in-out'
      }).onfinish = () => {
        resolve();
      };
    });
  }

  async animateTravelingCircleToNode(targetNode) {
    const container = this.closest('[style*="position: relative"]');
    if (!container || !targetNode) return;

    const wrapper = targetNode.closest('.test-node-wrapper');
    if (!wrapper) return;

    // Get the target node's position
    const transform = wrapper.style.transform;
    const matches = transform.match(/translate\(\s*([-\d.eE+]+)px\s*,\s*([-\d.eE+]+)px\s*\)/);
    
    if (!matches) {
      const translateXMatch = transform.match(/translateX\(([-\d.eE+]+)px\)/);
      const translateYMatch = transform.match(/translateY\(([-\d.eE+]+)px\)/);
      
      if (translateXMatch && translateYMatch) {
        const endX = parseFloat(translateXMatch[1]);
        const endY = parseFloat(translateYMatch[1]);
        return this.createAndAnimatePurpleCircle(container, targetNode, endX, endY);
      }
      return;
    }
    
    const endX = parseFloat(matches[1]);
    const endY = parseFloat(matches[2]);
    
    return this.createAndAnimatePurpleCircle(container, targetNode, endX, endY);
  }

  createAndAnimatePurpleCircle(container, targetNode, endX, endY) {
    // Start position is the center (where server is)
    const startX = 0;
    const startY = 0;
    
    // Create the traveling purple circle
    const circle = document.createElement('div');
    circle.style.cssText = `
      position: absolute;
      width: 8px;
      height: 8px;
      background: purple;
      border-radius: 50%;
      box-shadow: 0 0 10px purple, 0 0 20px purple, 0 0 30px purple;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
      pointer-events: none;
    `;
    
    container.appendChild(circle);
    
    // Animate the circle from server to test-node
    return new Promise((resolve) => {
      const animation = circle.animate([
        { 
          left: `calc(50% + ${startX}px)`,
          top: `calc(50% + ${startY}px)`,
          opacity: 1
        },
        { 
          left: `calc(50% + ${endX}px)`,
          top: `calc(50% + ${endY}px)`,
          opacity: 1
        }
      ], {
        duration: 600,
        easing: 'ease-in-out'
      });
      
      animation.onfinish = () => {
        // Remove the circle
        circle.remove();
        
        // Trigger test-node receive
        if (targetNode && typeof targetNode.receive === 'function') {
          targetNode.receive();
        }
        
        resolve();
      };
    });
  }

  render() {
    return html`
      <div style="font-size: 3rem; color: #ffffff; display: flex; justify-content: center; align-items: center;">
       <i class="giant fas fa-server"></i> 
      </div>
    `;
  }
}

customElements.define('server-component', ServerComponent);
//<i class="fa-solid fa-laptop-code"></i>