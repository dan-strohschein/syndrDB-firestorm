import { LitElement, html, css } from '../lib/lit/lit-core.min.js';

class Navigation extends LitElement {
  
  

  constructor() {
    super();
    this.testGenComplete = false;
  }

  static properties = {
    testGenComplete: { type: Boolean }
  };


  // Disable shadow DOM
  createRenderRoot() {
    return this;
  }

  triggerRandomSend() {
    const testNodes = document.querySelectorAll('test-node');
    
    if (testNodes.length === 0) {
      return;
    }
    
    // Pick a random test-node
    const randomIndex = Math.floor(Math.random() * testNodes.length);
    const randomNode = testNodes[randomIndex];
    
   
    // Call its send function
    if (randomNode && typeof randomNode.send === 'function') {
      randomNode.send();
    }
  }

  firstUpdated() {
    console.log("Navigation firstUpdated called");
    
    // Listen for test generation completion
    document.addEventListener('test-gen-complete', (event) => {
      if (event.detail.success) {
        this.testGenComplete = true;
        this.requestUpdate();
      }
    });
    
    // Use setTimeout to ensure DOM is fully ready
    setTimeout(() => {
      const sendButton = this.querySelector('#send-random-btn');
      const configButton = this.querySelector('#config-btn');
      const runButton = this.querySelector('#run-test-btn');

      console.log("Send button:", sendButton);
      console.log("Config button:", configButton);
      
      if (sendButton) {
        sendButton.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("Send button clicked via onclick");
          this.triggerRandomSend();
        };
        
        sendButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("Send button clicked via addEventListener");
          this.triggerRandomSend();
        }, true);
      }

      if (runButton) {
        runButton.onclick = (e) => {
          if (!this.testGenComplete) return;
          e.preventDefault();
          e.stopPropagation();
          console.log("Run button clicked via onclick");
          this.runTest();
        }
      }

      if (configButton) {
        configButton.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("Config button clicked via onclick");
          this.openConfigModal();
        };
        
        configButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("Config button clicked via addEventListener");
          this.openConfigModal();
        }, true);
      }
    }, 100);
  }

  openConfigModal() {
    const modal = document.querySelector('test-config-modal');
    if (modal) {
      modal.open();
    }
  }

  runTest() {
    console.log("Running test execution...");
    // TODO: Implement test execution
    // python run-firestorm.py --execute --duration 30
  }

  render() {
    return html`
      <div class="card-container frosted-glass navigation-container">
            <div class="card-container-body" style="display: flex; flex-direction: row; align-items: flex-start; width:100%;"> 
                  
                <div style="display: flex; flex-direction: column; align-items: flex-start;">
                    <span>content</span>
                  </div>
                  <div style="display: flex; flex-direction: row; gap: 10px; align-items: center; margin-left: auto; z-index: 1000; position: relative;">
                    <a id="config-btn"
                            href="#"
                            class="btn btn-sm btn-outline-primary"
                            style=" text-decoration: 
                                  none; cursor: pointer; position: relative; z-index: 1001;
                                  --bs-btn-padding-y: .25rem; --bs-btn-padding-x: .35rem; --bs-btn-font-size: .75rem;
                                  --bs-fbtn-font-weight:bold;
                                  ">
                      <i class="fas fa-plus"></i>
                    </a>
                    <a id="send-random-btn"
                            href="#"
                            class="btn btn-outline-success btn-sm"
                            style=" color: white; text-decoration:${this.testGenComplete ? '' : 'disabled'}"
                            ${this.testGenComplete ? '' : 'disabled'}
                            role="button" 
                            aria-disabled="${!this.testGenComplete}"
                            style=" color: white; text-decoration: none; cursor: ${this.testGenComplete ? 'pointer' : 'not-allowed'}; position: relative; z-index: 1001;"
                    <a id="run-test-btn"
                            href="#"
                            class="btn btn-outline-success btn-sm disabled"
                            disabled" role="button" aria-disabled="true"
                            style=" color: white; text-decoration: none; cursor: pointer; position: relative; z-index: 1001;"
                            disabled
                            >
                      <i class="fas fa-play"></i>
                    </a>
                  </div>
            </div>
            <div class="card-container-arrow">
                <div class="card-container-arrow-top-left"></div>
                <div class="card-container-arrow-top-right"></div>
                <div class="card-container-arrow-bottom-left"></div>
                <div class="card-container-arrow-bottom-right"></div>
            </div>
           
       </div>
       
     
    `;
  }
}

customElements.define('navigation-component', Navigation);
