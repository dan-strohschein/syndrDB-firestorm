import { LitElement, html, css } from '../lib/lit/lit-core.min.js';

class TestConfigModal extends LitElement {
  
  static properties = {
    isOpen: { type: Boolean }
  };

  constructor() {
    super();
    this.isOpen = false;
    this.agentCount = 5;
    this.testDuration = 10;
    this.modalElement = null;
  }

  // Disable shadow DOM
  createRenderRoot() {
    return this;
  }

  open() {
    this.isOpen = true;
    this.requestUpdate();
    // Use Bootstrap's modal API
    setTimeout(() => {
      // Try to find modal in component first, then in body
      let modalEl = this.querySelector('.modal');
      if (!modalEl) {
        modalEl = this.modalElement;
      }
      
      if (modalEl) {
        // Store reference
        this.modalElement = modalEl;
        
        // Only append to body if not already there
        if (modalEl.parentElement !== document.body) {
          document.body.appendChild(modalEl);
        }
        
        // Get or create modal instance
        let modal = bootstrap.Modal.getInstance(modalEl);
        if (!modal) {
          modal = new bootstrap.Modal(modalEl, {
            backdrop: true,
            keyboard: true
          });
        }
        modal.show();
      }
    }, 0);
  }

  close() {
    const modalEl = this.modalElement || this.querySelector('.modal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) {
        modal.hide();
      }
    }
    this.clearForm();
    this.isOpen = false;
  }

  clearForm() {
    this.agentCount = 5;
    this.testDuration = 10;
    this.requestUpdate();
  }

  handleStart() {
    // Search within the modal element since it's been moved to body
    const modalEl = this.modalElement || document.body.querySelector('.modal');
    if (!modalEl) return;
    
    const agentInput = modalEl.querySelector('#agent-count');
    const durationInput = modalEl.querySelector('#test-duration');
    
    if (!agentInput || !durationInput) return;
    
    const agentCount = parseInt(agentInput.value) || 5;
    const testDuration = parseInt(durationInput.value) || 10;
    
    // Dispatch custom event with the configuration
    this.dispatchEvent(new CustomEvent('test-start', {
      detail: {
        agentCount,
        testDuration
      },
      bubbles: true,
      composed: true
    }));
    
    this.close();
  }

  handleCancel() {
    this.close();
  }

  render() {
    return html`
      <div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="testConfigModalLabel" aria-hidden="true" style="z-index: 10000;">
        <div class="modal-dialog" role="document" style="z-index: 10001;">
          <div class="modal-content" style="background: rgba(20, 20, 30, 0.95); border: 1px solid rgba(255, 255, 255, 0.2); color: white; z-index: 10002;">
            <div class="modal-header" style="border-bottom: 1px solid rgba(255, 255, 255, 0.2);">
              <h5 class="modal-title" id="testConfigModalLabel">Configure Test</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="agent-count" class="form-label">Number of Agents</label>
                <input 
                  type="number" 
                  class="form-control" 
                  id="agent-count" 
                  value="${this.agentCount}"
                  min="1"
                  max="50"
                  style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.3); color: white;"
                />
              </div>
              <div class="mb-3">
                <label for="test-duration" class="form-label">Test Duration (minutes)</label>
                <input 
                  type="number" 
                  class="form-control" 
                  id="test-duration" 
                  value="${this.testDuration}"
                  min="1"
                  max="120"
                  style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.3); color: white;"
                />
              </div>
            </div>
            <div class="modal-footer" style="border-top: 1px solid rgba(255, 255, 255, 0.2);">
              <button type="button" class="btn btn-secondary" id="cancel-btn">Cancel</button>
              <button type="button" class="btn btn-primary" id="start-btn">Start</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  firstUpdated() {
    // Attach event listeners after render
    const cancelBtn = this.querySelector('#cancel-btn');
    const startBtn = this.querySelector('#start-btn');
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.handleCancel());
    }
    
    if (startBtn) {
      startBtn.addEventListener('click', () => this.handleStart());
    }
  }
}

customElements.define('test-config-modal', TestConfigModal);
