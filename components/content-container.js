import { LitElement, html, css } from '../lib/lit/lit-core.min.js';

class ContentContainer extends LitElement {
  
  constructor() {
    super();
    this.nodeCount = 0;
    this.agents = [];
    this.radius = 150; // 100px space + approximate node size
    this.serverRadius = 40; // Approximate radius of server icon
    this.nodeSize = 30; // Approximate size of test-node icon
    this.agentMap = new Map(); // Map agent_id to test-node element
  }

  static styles = css`
 
  `;

  // Disable shadow DOM
  createRenderRoot() {
    return this;
  }

  firstUpdated() {
    // Listen for test-start event from modal
    document.addEventListener('test-start', (event) => {
      this.handleTestStart(event.detail);
    });
  }

  async handleTestStart(config) {
    console.log('Starting test generation with config:', config);
    const { agentCount, testDuration } = config;
    
    // Dispatch event to show loading state
    document.dispatchEvent(new CustomEvent('test-gen-started', {
      detail: { agentCount }
    }));
    
    try {
      // Run Python test generation
      if (window.electronAPI) {
        console.log('Calling runTestGen with agentCount:', agentCount);
        const result = await window.electronAPI.runTestGen(agentCount);
        console.log('Test generation result:', result);
        
        // If we get here, it was successful
        if (result.success) {
          // Read the manifest file
          const manifest = await window.electronAPI.readManifest();
          
          if (manifest && manifest.agents) {
            this.agents = manifest.agents;
            this.nodeCount = manifest.agents.length;
            console.log(`Loaded ${this.nodeCount} agents from manifest`);
            
            // Re-render with new agent data
            this.requestUpdate();
            
            // Wait for render to complete, then position nodes
            await this.updateComplete;
            this.positionNodes();
            this.drawLines();
            this.mapAgents();
            
            // Dispatch success event to enable run button
            document.dispatchEvent(new CustomEvent('test-gen-complete', {
              detail: { success: true, agents: this.agents }
            }));
          } else {
            throw new Error('Manifest file not found or empty');
          }
        }
      } else {
        // Fallback for non-Electron environment
        console.warn('electronAPI not available, using dummy data');
        this.agents = [];
        for (let i = 0; i < agentCount; i++) {
          this.agents.push({
            agent_id: `agent_${i + 1}`,
            persona: 'test_agent',
            query_count: 0
          });
        }
        
        this.nodeCount = agentCount;
        this.requestUpdate();
        
        await this.updateComplete;
        this.positionNodes();
        this.drawLines();
        this.mapAgents();
        
        document.dispatchEvent(new CustomEvent('test-gen-complete', {
          detail: { success: true, agents: this.agents }
        }));
      }
    } catch (error) {
      console.error('Error during test generation:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      const errorMsg = error.message || error.error || JSON.stringify(error);
      alert(`Error during test generation: ${errorMsg}`);
      document.dispatchEvent(new CustomEvent('test-gen-complete', {
        detail: { success: false, error: errorMsg }
      }));
    }
  }

  async loadManifestAndSetup() {
    try {
      if (window.electronAPI) {
        const manifest = await window.electronAPI.readManifest();
        if (manifest && manifest.agents) {
          this.agents = manifest.agents;
          this.nodeCount = manifest.agents.length;
          console.log(`Loaded ${this.nodeCount} agents from manifest`);
          
          // Re-render with new agent count
          this.requestUpdate();
          
          // Wait for render to complete
          await this.updateComplete;
          
          // Position nodes and draw lines
          this.positionNodes();
          this.drawLines();
          
          // Map agent IDs to their test-node elements
          this.mapAgents();
          
          // Start watching the mmap file
          this.startMmapMonitoring();
        } else {
          console.warn('No manifest found, using default configuration');
          this.nodeCount = 6;
          this.positionNodes();
          this.drawLines();
        }
      } else {
        console.warn('Electron API not available, using default configuration');
        this.nodeCount = 6;
        this.positionNodes();
        this.drawLines();
      }
    } catch (error) {
      console.error('Error loading manifest:', error);
      this.nodeCount = 6;
      this.positionNodes();
      this.drawLines();
    }
  }

  mapAgents() {
    const nodes = this.querySelectorAll('test-node');
    nodes.forEach((node, index) => {
      if (this.agents[index]) {
        const agentId = this.agents[index].agent_id;
        this.agentMap.set(agentId, node);
        // Store agent info on the node element
        node.agentData = this.agents[index];
      }
    });
  }

  startMmapMonitoring() {
    if (window.electronAPI) {
      window.electronAPI.watchMmapFile((data) => {
        this.handleMmapUpdate(data);
      });
      window.electronAPI.startWatching();
      console.log('Started monitoring mmap file');
    }
  }

  handleMmapUpdate(data) {
    console.log('Mmap update:', data);
    
    // Handle different types of events based on the data structure
    // You'll need to define the structure of your log entries
    if (data.agent_id && data.event_type) {
      const node = this.agentMap.get(data.agent_id);
      const server = this.querySelector('server-component');
      
      if (data.event_type === 'query_sent' && node) {
        // Agent sends query to server
        node.send();
      } else if (data.event_type === 'response_received' && node && server) {
        // Server sends response to agent
        server.send(node);
      }
    }
  }

  positionNodes() {
    const nodes = this.querySelectorAll('.test-node-wrapper');
    const angleStep = (2 * Math.PI) / this.nodeCount;
    
    nodes.forEach((node, index) => {
      const angle = index * angleStep - Math.PI / 2; // Start from top
      const x = Math.cos(angle) * this.radius;
      const y = Math.sin(angle) * this.radius;
      
      node.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  drawLines() {
    const svg = this.querySelector('.connection-lines');
    if (!svg) return;
    
    const angleStep = (2 * Math.PI) / this.nodeCount;
    
    // Clear existing lines
    svg.innerHTML = '';
    
    for (let i = 0; i < this.nodeCount; i++) {
      const angle = i * angleStep - Math.PI / 2;
      
      // Start point: edge of server facing the node
      const x1 = Math.cos(angle) * this.serverRadius;
      const y1 = Math.sin(angle) * this.serverRadius;
      
      // Calculate test-node center position
      const nodeCenterX = Math.cos(angle) * this.radius;
      const nodeCenterY = Math.sin(angle) * this.radius;
      
      // Calculate end point: edge of test-node facing the server
      // The line should originate from the side of the node closest to the server
      // This is the opposite direction of the angle (pointing back toward center)
      const x2 = nodeCenterX - Math.cos(angle) * this.nodeSize;
      const y2 = nodeCenterY - Math.sin(angle) * this.nodeSize;
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('stroke', 'white');
      line.setAttribute('stroke-width', '1');
      
      svg.appendChild(line);
    }
  }

  render() {
    return html`
      <div class="card-container frosted-glass" style="display: flex; flex: 1; min-height: 0; height: 100%; margin: 1rem;">
            <div class="card-container-body"> 
              <div style="height: 100%; display: flex; align-items: center; justify-content: center;">
                 <div style="position: relative;">
                   <!-- SVG for connection lines -->
                   <svg class="connection-lines" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: ${this.radius * 2 + 100}px; height: ${this.radius * 2 + 100}px; pointer-events: none; z-index: 0;" 
                        viewBox="${-this.radius - 50} ${-this.radius - 50} ${this.radius * 2 + 100} ${this.radius * 2 + 100}">
                   </svg>
                   
                   <!-- Server in the center -->
                   <server-component style="position: relative; z-index: 2;"></server-component>
                   
                   <!-- Test nodes positioned in a circle -->
                   ${Array.from({ length: this.nodeCount }, (_, i) => html`
                     <div class="test-node-wrapper" style="position: absolute; top: 0; left: 0; z-index: 2;">
                       <test-node></test-node>
                     </div>
                   `)}
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

customElements.define('content-container', ContentContainer);
