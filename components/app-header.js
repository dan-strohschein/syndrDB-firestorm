import { LitElement, html, css } from '../lib/lit/lit-core.min.js';

class AppHeader extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .header-container {
      text-align: center;
      padding: 3rem 0;
    }

    h1 {
      color: #0d6efd;
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }

    h2 {
      color: #198754;
      font-size: 2rem;
      font-weight: 300;
    }

    .icon {
      font-size: 3rem;
      color: #0d6efd;
    }

    .card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
  `;

  static properties = {
    appName: { type: String }
  };

  constructor() {
    super();
    this.appName = 'SyndrDB Firestorm';
  }

  render() {
    return html`
      <div class="header-container">
        <div class="card">
          <h1>
            <i class="fas fa-fire icon"></i>
            ${this.appName}
          </h1>
          <h2>
            <i class="fas fa-hand-sparkles"></i>
            HELLO WORLD!
          </h2>
        </div>
      </div>
    `;
  }
}

customElements.define('app-header', AppHeader);
