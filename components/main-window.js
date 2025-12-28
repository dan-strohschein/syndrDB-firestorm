import { LitElement, html, css } from '../lib/lit/lit-core.min.js';

class MainWindow extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
    }

    

  `;
  
  static properties = {
    appName: { type: String }
  };

  constructor() {
    super();
    this.appName = 'SyndrDB Firestorm';
  }


  // Disable shadow DOM
  createRenderRoot() {
    return this;
  }
  //<div class="galaxy-container">
         // <galaxy-component></galaxy-component>
  //      </div>
 
  render() {
    return html`
      <div class="container main-container">
       
        
      </div>
    `;
  }
}

customElements.define('main-window', MainWindow);
