import { LitElement, html, css } from '../lib/lit/lit-core.min.js';

class AgentInfoContainer extends LitElement {
  
  static properties = {
    agents: { type: Array }
  };

  // Disable shadow DOM
  createRenderRoot() {
    return this;
  }
  
  constructor() {
    super();
    this.agents = [];
  }

  firstUpdated() {
    // Listen for test-gen-complete event with real agent data
    document.addEventListener('test-gen-complete', (event) => {
      if (event.detail.success && event.detail.agents) {
        this.agents = event.detail.agents;
        this.requestUpdate();
        
        // Wait for render to complete, then attach hover listeners
        this.updateComplete.then(() => {
          this.attachHoverListeners();
        });
      }
    });
  }

  updated() {
    // Re-attach hover listeners after each update
    this.attachHoverListeners();
  }

  attachHoverListeners() {
    const tiles = this.querySelectorAll('.agent-tile');
    tiles.forEach((tile, index) => {
      tile.onmouseenter = () => {
        const testNodes = document.querySelectorAll('test-node');
        if (testNodes[index]) {
          testNodes[index].highlight(true);
        }
      };
      
      tile.onmouseleave = () => {
        const testNodes = document.querySelectorAll('test-node');
        if (testNodes[index]) {
          testNodes[index].highlight(false);
        }
      };
    });
  }

  updateAgents(agentCount) {
    this.agents = [];
    for (let i = 0; i < agentCount; i++) {
      this.agents.push({
        agent_id: `agent_${i + 1}`,
        persona: 'test_agent',
        query_count: 0
      });
    }
    this.requestUpdate();
  }

  render() {
    return html`
      <div class="card-container frosted-glass" style="position: relative; width:100%; height:100%; margin: 1rem; margin-left: 0;">
        <div class="card-container-body" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; padding: 1rem; overflow-y: auto; box-sizing: border-box; z-index: 10;">
          <h6 style="margin-bottom: 1rem; color: #ffffff; text-align:center; position: sticky; top: 0; background: rgba(20, 20, 30, 0.9); padding: 0.5rem 0; z-index: 11;">Agent Details</h6>
          
          ${this.agents.length === 0 ? html`
            <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">No agents configured</p>
          ` : html`
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${this.agents.map((agent, index) => html`
                <div class="agent-tile" data-agent-index="${index}" style="background: rgba(255, 255, 255, 0.05); padding: 0.75rem; border-radius: 4px; border: 1px solid rgba(255, 255, 255, 0.1); cursor: pointer; transition: background 0.2s;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="font-weight: 500; color: #ffffff; font-size: 0.875rem;">${agent.agent_id}</span>
                    <span style="color: rgba(255, 255, 255, 0.7); font-size: 0.75rem;">#${index + 1}</span>
                  </div>
                  <div style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.6);">
                    <div>Persona: <span style="color: #00ffaa;">${agent.persona || 'N/A'}</span></div>
                    <div>Queries: <span style="color: #ff6600;">${agent.query_count || 0}</span></div>
                  </div>
                </div>
              `)}
            </div>
          `}
        </div>
        
        <div class="card-container-arrow" style="pointer-events: none;">
          <div class="card-container-arrow-top-left" style="pointer-events: none;"></div>
          <div class="card-container-arrow-top-right" style="pointer-events: none;"></div>
          <div class="card-container-arrow-bottom-left" style="pointer-events: none;"></div>
          <div class="card-container-arrow-bottom-right" style="pointer-events: none;"></div>
        </div>
      </div>
    `;
  }
}

customElements.define('agent-info-container', AgentInfoContainer);
