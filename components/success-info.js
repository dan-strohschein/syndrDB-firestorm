import { LitElement, html, css } from '../lib/lit/lit-core.min.js';

class SuccessInfo extends LitElement {
  
  // Disable shadow DOM
  createRenderRoot() {
    return this;
  }
  
  constructor() {
    super();
    
  }

  render() {
    return html`
      <div >
           
       </div>
    `;
  }
}

customElements.define('success-info', SuccessInfo);