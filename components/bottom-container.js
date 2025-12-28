import { LitElement, html, css } from '../lib/lit/lit-core.min.js';

class BottomContainer extends LitElement {
  
  // Disable shadow DOM
  createRenderRoot() {
    return this;
  }
  
  constructor() {
    super();
    
  }

  render() {
    return html`
      <div class="card-container frosted-glass" style="display: flex; flex: 1; min-height: 10vh; height: 25vh; margin-top: 0.25rem; margin-left:1rem; margin-right:1rem; margin-bottom:1rem">
            <div class="card-container-body"> 
              <div style="background-color: rgba(0,0,0,0.5); height:100%; display: flex; flex-direction: column; color: rgba(255,255,255,0.7); width:100%;">
                <div>
                    © 2024 SyndrDB Firestorm. All rights reserved.
                </div>
                <div>
                    <SQL-info></SQL-info>
                </div>
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

customElements.define('bottom-container', BottomContainer);