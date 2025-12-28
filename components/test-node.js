import { LitElement, html, css } from '../lib/lit/lit-core.min.js';

class TestNode extends LitElement {
  
  

  constructor() {
    super();
    this.isHighlighted = false;
  }


  // Disable shadow DOM
  createRenderRoot() {
    return this;
  }

  highlight(show) {
    this.isHighlighted = show;
    const icon = this.querySelector('i');
    if (!icon) return;
    
    if (show) {
      icon.style.borderBottom = '3px solid #3cd2a5';
      icon.style.paddingBottom = '2px';
    } else {
      icon.style.borderBottom = '';
      icon.style.paddingBottom = '';
    }
  }

  async send() {
    const icon = this.querySelector('i');
    if (!icon) return;
    
    // 1. Animate orange flash around the test-node
    await this.flashAnimation(icon, 'orange');
    
    // 2. Create and animate the traveling circle
    await this.animateTravelingCircle();
  }

  receive() {
    const icon = this.querySelector('i');
    if (!icon) return;
    
    // Animate green flash
    icon.animate([
      { 
        filter: `drop-shadow(0 0 5px #0f0) drop-shadow(0 0 10px #0f0) drop-shadow(0 0 15px #0f0)`,
        opacity: 1 
      },
      { 
        filter: `drop-shadow(0 0 20px #00ff00) drop-shadow(0 0 30px #00ff00) drop-shadow(0 0 40px #00ff00)`,
        opacity: 1 
      },
      { 
        filter: `drop-shadow(0 0 5px #0f0) drop-shadow(0 0 10px #0f0) drop-shadow(0 0 15px #0f0)`,
        opacity: 1 
      }
    ], {
      duration: 400,
      easing: 'ease-in-out'
    });
  }

  flashAnimation(element, color) {
    return new Promise((resolve) => {
      // Create flash effect using box-shadow
      const originalBoxShadow = element.style.boxShadow;
      
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

  async animateTravelingCircle() {
    // Find the parent container to get position info
    const wrapper = this.closest('.test-node-wrapper');
    const container = this.closest('[style*="position: relative"]');
    const serverComponent = container?.querySelector('server-component');
    
    if (!wrapper || !container || !serverComponent) {
      return;
    }
    
    // Get the transform values to find our position
    const transform = wrapper.style.transform;
    
    // More flexible regex to handle various whitespace patterns and scientific notation
    const matches = transform.match(/translate\(\s*([-\d.eE+]+)px\s*,\s*([-\d.eE+]+)px\s*\)/);
    
    if (!matches) {
      // Try alternative: translateX and translateY
      const translateXMatch = transform.match(/translateX\(([-\d.eE+]+)px\)/);
      const translateYMatch = transform.match(/translateY\(([-\d.eE+]+)px\)/);
      
      if (translateXMatch && translateYMatch) {
        const startX = parseFloat(translateXMatch[1]);
        const startY = parseFloat(translateYMatch[1]);
        
        // Continue with animation using these values
        return this.createAndAnimateCircle(container, serverComponent, startX, startY);
      }
      
      return;
    }
    
    const startX = parseFloat(matches[1]);
    const startY = parseFloat(matches[2]);
    
    return this.createAndAnimateCircle(container, serverComponent, startX, startY);
  }

  createAndAnimateCircle(container, serverComponent, startX, startY) {
    // End position is the center (where server is)
    const endX = 0;
    const endY = 0;
    
    // Create the traveling circle
    const circle = document.createElement('div');
    circle.style.cssText = `
      position: absolute;
      width: 8px;
      height: 8px;
      background: orange;
      border-radius: 50%;
      box-shadow: 0 0 10px orange, 0 0 20px orange, 0 0 30px orange;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
      pointer-events: none;
    `;
    
    container.appendChild(circle);
    
    // Animate the circle from test-node to server
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
        
        // Trigger server receive
        if (serverComponent && typeof serverComponent.receive === 'function') {
          serverComponent.receive();
        }
        
        resolve();
      };
    });
  }

  render() {
    return html`
      <div style="font-size: 2rem; color: #ffffff; display: flex; justify-content: center; align-items: center;">
       <i class="fa-solid fa-laptop-code"></i>
      </div>
    `;
  }
}

customElements.define('test-node', TestNode);
//<i class="fa-solid fa-laptop-code"></i>