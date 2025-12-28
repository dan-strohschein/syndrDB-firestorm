import { LitElement, html, css } from '../lib/lit/lit-core.min.js';

class SQLInfo extends LitElement {
  
  // Disable shadow DOM
  createRenderRoot() {
    return this;
  }
  
  constructor() {
    super();
    
  }

  render() {
    return html`
    <div style="width:fit-content;">
        <button class="btn d-flex justify-content-between align-items-center w-100" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
            <span class="icon-container d-flex" style="color: yellow; margin-right: 0.15rem;">
                <!-- Up Icon (shown when open) -->
                <i class="fas fa-chevron-up" style="display: none;"></i>
                <!-- Down Icon (shown when closed) -->
                <i class="fas fa-chevron-down"></i>
            </span>    
            <span class="text-start" style="color:yellow; font-size: 1rem; font-weight: bold; margin-top: 0.25rem;width:100%; text-align:left;">
            SELECT * FROM ...
            </span>
        
        </button>
        <div class="collapse" id="collapseExample" style="margin-left:1rem;">
            <div style="color:yellow; font-size: 1rem; font-weight: bold; margin-top: 0.25rem;">
                Some placeholder content for the collapse component.
            </div>
        </div>
    </div>
    `;
  }
}

customElements.define('sql-info', SQLInfo);