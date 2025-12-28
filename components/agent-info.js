import { LitElement, html, css } from '../lib/lit/lit-core.min.js';

class AgentInfo extends LitElement {
  
  // Disable shadow DOM
  createRenderRoot() {
    return this;
  }
  
  constructor() {
    super();
    
  }

  render() {
    return html`
     <div class="flex-fill">
        <div class="mb-1">AGENT NAME</div>
        <h2>0 / 200</h2>
        <div style="color: #3cd2a5; font-weight:bold; font-size: 1.15rem"> 
            <i class="fa fa-circle  fs-7px ms-auto" style="color: #3cd2a5;"></i>
            Active
        </div>
    </div>
    `;
  }
}

customElements.define('agent-info', AgentInfo);
