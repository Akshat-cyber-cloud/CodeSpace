import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Play, Server, ExternalLink, Terminal, Cpu, Activity, Loader2, Trash2, Folder, File, Send, ArrowLeft, ChevronDown } from 'lucide-react';
import AuthPage from './components/AuthPage';

const MLogo = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4H20V20H4V4Z" fill="white" fillOpacity="0.01" />
    <path d="M4 6.5L12 12L20 6.5V18C20 18.5523 19.5523 19 19 19H5C4.44772 19 4 18.5523 4 18V6.5Z" fill="white" />
    <path d="M20 5.5L12 11L4 5.5C4.2647 5.1952 4.636 5 5 5H19C19.364 5 19.7353 5.1952 20 5.5Z" fill="white" />
  </svg>
);

const DashesLogo = () => (
  <div className="grid grid-cols-2 gap-2 transform -rotate-45">
    <div className="w-5 h-1.5 bg-white rounded-full translate-x-2" />
    <div className="w-8 h-1.5 bg-white rounded-full" />
    <div className="w-8 h-1.5 bg-white rounded-full translate-x-2" />
    <div className="w-5 h-1.5 bg-white rounded-full" />
    <div className="w-4 h-1.5 bg-white rounded-full translate-x-2" />
    <div className="w-6 h-1.5 bg-white rounded-full" />
  </div>
);

const SlackLogo = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522v-2.521zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.523-2.522v-2.522h2.523zM15.165 17.687a2.527 2.527 0 0 1-2.523-2.52 2.528 2.528 0 0 1 2.523-2.522h6.313A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.52H15.165z" />
  </svg>
);


const ORBIT_ICONS = [MLogo, DashesLogo, SlackLogo];

export default function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check for auth=success in the URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      setIsLoggedIn(true);
      setShowAuth(false);
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Pod states
  const [activeTab, setActiveTab] = useState('Overview');
  const [pods, setPods] = useState([]);
  const [isStarting, setIsStarting] = useState(false);
  const [logs, setLogs] = useState([]);
  const [apiMode, setApiMode] = useState('live');
  const [activePodWorkspace, setActivePodWorkspace] = useState(null);

  // File system mock state
  const [files, setFiles] = useState({
    'public/vite.svg': `<svg xmlns="http://www.w3.org/2000/svg" type="image/svg+xml" viewBox="0 0 256 256">\n  <!-- Vite Logo -->\n</svg>`,
    'src/assets/react.svg': `<svg xmlns="http://www.w3.org/2000/svg" type="image/svg+xml" viewBox="0 0 118 118">\n  <!-- React Logo -->\n</svg>`,
    'src/App.css': `#root {\n  max-width: 1280px;\n  margin: 0 auto;\n  padding: 2rem;\n  text-align: center;\n}`,
    'src/App.jsx': `import React from 'react';\nimport './index.css';\n\nexport default function App() {\n  return (\n    <div className="app-container">\n      <h1>Hello Vite</h1>\n    </div>\n  );\n}`,
    'src/index.css': `body {\n  margin: 0;\n  background: #f4f3ec;\n  font-family: Inter, system-ui, sans-serif;\n}\n\n.app-container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n}`,
    'src/main.jsx': `import React from 'react'\nimport ReactDOM from 'react-dom/client'\nimport App from './App.jsx'\nimport './index.css'\n\nReactDOM.createRoot(document.getElementById('root')).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n)`,
    '.eslintrc.cjs': `module.exports = {\n  root: true,\n  env: { browser: true, es2020: true },\n  extends: [\n    'eslint:recommended',\n    'plugin:react/recommended',\n    'plugin:react/jsx-runtime',\n    'plugin:react-hooks/recommended',\n  ],\n  ignorePatterns: ['dist', '.eslintrc.cjs'],\n  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },\n  settings: { react: { version: '18.2' } },\n  plugins: ['react-refresh'],\n  rules: {\n    'react-refresh/only-export-components': [\n      'warn',\n      { allowConstantExport: true },\n    ],\n  },\n}`,
    '.gitignore': `# Logs\nlogs\n*.log\nnpm-debug.log*\n\nnode_modules\ndist\ndist-ssr\n*.local\n\n# Editor directories and files\n.vscode/*\n!.vscode/extensions.json\n.idea\n.DS_Store\n*.sln`,
    'index.html': `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Vite + React</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.jsx"></script>\n  </body>\n</html>`,
    'package.json': `{\n  "name": "vite-project",\n  "version": "0.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  },\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  }\n}`,
    'README.md': `# React + Vite\n\nThis template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.\n\nCurrently, two official plugins are available:\n\n- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh\n- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh`,
    'vite.config.js': `import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  plugins: [react()],\n})`
  });
  const [activeFile, setActiveFile] = useState('src/index.css');

  // AI Copilot state
  const [agentMessages, setAgentMessages] = useState([
    { role: 'system', text: "Hello! I'm your ACC Copilot. What would you like to build or modify in this workspace today?" }
  ]);
  const [agentInput, setAgentInput] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);

  const handleAgentSubmit = (e) => {
    e.preventDefault();
    if (!agentInput.trim() || isAgentTyping) return;

    const userText = agentInput.trim();
    setAgentMessages(prev => [...prev, { role: 'user', text: userText }]);
    setAgentInput('');
    setIsAgentTyping(true);

    setTimeout(() => {
      setAgentMessages(prev => [...prev, { 
        role: 'system', 
        text: `I'll implement that now. Generating updated code...`,
        changes: ['src/App.jsx', 'src/index.css']
      }]);
      
      setActiveFile('src/App.jsx');
      const targetAppJsx = `import React from 'react';\nimport './index.css';\n\nexport default function App() {\n  return (\n    <div className="app-container dark-mode">\n      <nav className="navbar">\n        <div className="logo">ViteApp</div>\n        <div className="links">\n          <a href="#">Home</a>\n          <a href="#">About</a>\n          <a href="#">Contact</a>\n        </div>\n      </nav>\n      <main>\n        <h1>Welcome to Dark Mode</h1>\n        <p>This layout was dynamically generated by the ACC AI Copilot.</p>\n        <button className="primary-btn">Get Started</button>\n      </main>\n    </div>\n  );\n}`;
      
      const targetIndexCss = `body {\n  margin: 0;\n  background: #121212;\n  color: #fff;\n  font-family: Inter, system-ui, sans-serif;\n}\n\n.app-container {\n  min-height: 100vh;\n  display: flex;\n  flex-direction: column;\n}\n\n.navbar {\n  display: flex;\n  justify-content: space-between;\n  padding: 1.5rem 2rem;\n  background: #1e1e1e;\n  border-bottom: 1px solid #333;\n}\n\n.logo { font-weight: bold; color: #ea580c; }\n.links a { color: #aaa; text-decoration: none; margin-left: 1rem; }\n.links a:hover { color: #fff; }\n\nmain {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  text-align: center;\n}\n\n.primary-btn {\n  margin-top: 2rem;\n  padding: 0.8rem 1.5rem;\n  background: #ea580c;\n  color: white;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n  font-weight: bold;\n}`;

      let currentApp = files['src/App.jsx'] + '\n\n// AI Copilot applying changes...';
      setFiles(prev => ({ ...prev, 'src/App.jsx': currentApp }));
      
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        if (charIndex <= targetAppJsx.length) {
          setFiles(prev => ({
            ...prev,
            'src/App.jsx': targetAppJsx.slice(0, charIndex)
          }));
          charIndex += 15;
        } else {
          clearInterval(typeInterval);
          // Now update CSS
          setActiveFile('src/index.css');
          let cssIndex = 0;
          const cssInterval = setInterval(() => {
            if (cssIndex <= targetIndexCss.length) {
              setFiles(prev => ({
                ...prev,
                'src/index.css': targetIndexCss.slice(0, cssIndex)
              }));
              cssIndex += 15;
            } else {
              clearInterval(cssInterval);
              setIsAgentTyping(false);
            }
          }, 15);
        }
      }, 15);
    }, 1500);
  };

  const addLog = (text) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${text}`]);
  };

  const handleStartPod = async () => {
    setIsStarting(true);
    setLogs([]);
    addLog("⚡ Initiating cloud sandbox request...");
    addLog("📡 POST Request: http://localhost/api/sandbox/start");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch('http://localhost/api/sandbox/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        addLog("✨ Server responded with 201 Created!");
        addLog(`📦 Sandbox ID: ${data.sandboxId}`);
        addLog(`🌐 Preview URL: ${data.previewUrl}`);

        const newPod = {
          id: data.sandboxId,
          name: `sandbox-${data.sandboxId.slice(0, 6)}`,
          url: data.previewUrl,
          status: 'Running',
          created: new Date().toLocaleTimeString(),
          type: 'Live Cloud Pod'
        };

        setPods(prev => [newPod, ...prev]);
        setApiMode('live');
        setIsStarting(false);
      } else {
        throw new Error(`API error ${response.status}`);
      }
    } catch (err) {
      console.warn("API request failed or timed out, activating high-fidelity demo engine.", err);
      addLog("⚠️ Connection to localhost API failed (Backend offline or CORS protection).");
      addLog("🔧 Activating ACC Intelligent Simulation engine...");

      setTimeout(() => addLog("🚀 Kubernetes: Scheduling new sandboxed Pod container..."), 1000);
      setTimeout(() => addLog("📦 Pulling cloud-agent-secure-image:latest..."), 2000);
      setTimeout(() => addLog("🛡️ Network: Binding virtual host & service route..."), 3200);
      setTimeout(() => {
        const mockId = Math.random().toString(36).substring(2, 12);
        const newPod = {
          id: mockId,
          name: `sandbox-${mockId.slice(0, 6)}`,
          url: `http://${mockId}.preview.localhost`,
          status: 'Running',
          created: new Date().toLocaleTimeString(),
          type: 'Simulated Sandbox'
        };
        setPods(prev => [newPod, ...prev]);
        addLog("✨ Simulated Sandbox successfully provisioned!");
        addLog(`🌐 Preview URL: http://${mockId}.preview.localhost`);
        setIsStarting(false);
      }, 4500);

      setApiMode('mock');
    }
  };

  const deletePod = (id) => {
    setPods(prev => prev.filter(p => p.id !== id));
  };

  if (activePodWorkspace) {
    return (
      <div className="h-screen bg-[#1e1e1e] text-gray-300 flex flex-col font-sans">
        {/* Top Header */}
        <div className="h-12 bg-[#252526] border-b border-[#333] flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActivePodWorkspace(null)} 
              className="text-gray-400 hover:text-white flex items-center gap-2 text-sm transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <div className="h-4 w-px bg-[#444]"></div>
            <div className="flex items-center gap-2">
               <Cpu className="w-4 h-4 text-[#ea580c]" />
               <span className="text-sm font-semibold text-gray-200">{activePodWorkspace.name}</span>
               <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full font-semibold border border-green-700/50">
                 {activePodWorkspace.status}
               </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href={activePodWorkspace.url} target="_blank" rel="noreferrer" className="text-xs bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded flex items-center gap-2 transition">
              <Play className="w-3 h-3 fill-white" /> Run Preview
            </a>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel (File Explorer) */}
          <div className="w-64 bg-[#252526] border-r border-[#333] flex flex-col shrink-0">
            <div className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#333]">Explorer</div>
            <div className="flex-1 overflow-y-auto py-2 text-sm font-medium">
              {/* Mock folders */}
              <div className="flex items-center gap-2 text-gray-300 py-1.5 hover:bg-[#2a2d2e] cursor-pointer px-3 transition">
                <ChevronDown className="w-4 h-4 text-gray-500" />
                <Folder className="w-4 h-4 text-blue-400" fill="currentColor" />
                public
              </div>
              <div onClick={() => setActiveFile('public/vite.svg')} className={`pl-9 flex items-center gap-2 py-1.5 hover:bg-[#2a2d2e] cursor-pointer px-3 transition ${activeFile === 'public/vite.svg' ? 'bg-[#37373d] text-[#ea580c]' : 'text-gray-300'}`}>
                <File className="w-4 h-4 text-orange-400" />
                vite.svg
              </div>

              <div className="flex items-center gap-2 text-gray-300 py-1.5 hover:bg-[#2a2d2e] cursor-pointer px-3 transition">
                <ChevronDown className="w-4 h-4 text-gray-500" />
                <Folder className="w-4 h-4 text-blue-400" fill="currentColor" />
                src
              </div>
              <div className="pl-9 flex items-center gap-2 text-gray-300 py-1.5 hover:bg-[#2a2d2e] cursor-pointer px-3 transition">
                <ChevronDown className="w-4 h-4 text-gray-500" />
                <Folder className="w-4 h-4 text-blue-400" fill="currentColor" />
                assets
              </div>
              <div onClick={() => setActiveFile('src/assets/react.svg')} className={`pl-14 flex items-center gap-2 py-1.5 hover:bg-[#2a2d2e] cursor-pointer px-3 transition ${activeFile === 'src/assets/react.svg' ? 'bg-[#37373d] text-[#ea580c]' : 'text-gray-300'}`}>
                <File className="w-4 h-4 text-blue-400" />
                react.svg
              </div>
              <div onClick={() => setActiveFile('src/App.css')} className={`pl-9 flex items-center gap-2 py-1.5 hover:bg-[#2a2d2e] cursor-pointer px-3 transition ${activeFile === 'src/App.css' ? 'bg-[#37373d] text-[#ea580c]' : 'text-gray-300'}`}>
                <File className="w-4 h-4 text-blue-300" />
                App.css
              </div>
              <div onClick={() => setActiveFile('src/App.jsx')} className={`pl-9 flex items-center gap-2 py-1.5 hover:bg-[#2a2d2e] cursor-pointer px-3 transition ${activeFile === 'src/App.jsx' ? 'bg-[#37373d] text-[#ea580c]' : 'text-gray-300'}`}>
                <File className="w-4 h-4 text-yellow-400" />
                App.jsx
              </div>
              <div onClick={() => setActiveFile('src/index.css')} className={`pl-9 flex items-center gap-2 py-1.5 hover:bg-[#2a2d2e] cursor-pointer px-3 transition ${activeFile === 'src/index.css' ? 'bg-[#37373d] text-[#ea580c]' : 'text-gray-300'}`}>
                <File className="w-4 h-4 text-blue-300" />
                index.css
              </div>
              <div onClick={() => setActiveFile('src/main.jsx')} className={`pl-9 flex items-center gap-2 py-1.5 hover:bg-[#2a2d2e] cursor-pointer px-3 transition ${activeFile === 'src/main.jsx' ? 'bg-[#37373d] text-[#ea580c]' : 'text-gray-300'}`}>
                <File className="w-4 h-4 text-yellow-400" />
                main.jsx
              </div>
              
              <div onClick={() => setActiveFile('.eslintrc.cjs')} className={`flex items-center gap-2 py-1.5 hover:bg-[#2a2d2e] cursor-pointer px-3 transition ${activeFile === '.eslintrc.cjs' ? 'bg-[#37373d] text-[#ea580c]' : 'text-gray-300'}`}>
                <File className="w-4 h-4 text-yellow-400" />
                .eslintrc.cjs
              </div>
              <div onClick={() => setActiveFile('.gitignore')} className={`flex items-center gap-2 py-1.5 hover:bg-[#2a2d2e] cursor-pointer px-3 transition ${activeFile === '.gitignore' ? 'bg-[#37373d] text-[#ea580c]' : 'text-gray-300'}`}>
                <File className="w-4 h-4 text-gray-400" />
                .gitignore
              </div>
              <div onClick={() => setActiveFile('index.html')} className={`flex items-center gap-2 py-1.5 hover:bg-[#2a2d2e] cursor-pointer px-3 transition ${activeFile === 'index.html' ? 'bg-[#37373d] text-[#ea580c]' : 'text-gray-300'}`}>
                <File className="w-4 h-4 text-orange-400" />
                index.html
              </div>
              <div onClick={() => setActiveFile('package.json')} className={`flex items-center gap-2 py-1.5 hover:bg-[#2a2d2e] cursor-pointer px-3 transition ${activeFile === 'package.json' ? 'bg-[#37373d] text-[#ea580c]' : 'text-gray-300'}`}>
                <File className="w-4 h-4 text-green-400" />
                package.json
              </div>
              <div onClick={() => setActiveFile('README.md')} className={`flex items-center gap-2 py-1.5 hover:bg-[#2a2d2e] cursor-pointer px-3 transition ${activeFile === 'README.md' ? 'bg-[#37373d] text-[#ea580c]' : 'text-gray-300'}`}>
                <File className="w-4 h-4 text-blue-300" />
                README.md
              </div>
              <div onClick={() => setActiveFile('vite.config.js')} className={`flex items-center gap-2 py-1.5 hover:bg-[#2a2d2e] cursor-pointer px-3 transition ${activeFile === 'vite.config.js' ? 'bg-[#37373d] text-[#ea580c]' : 'text-gray-300'}`}>
                <File className="w-4 h-4 text-purple-400" />
                vite.config.js
              </div>
            </div>
          </div>

          {/* Center (Code Editor & Bottom Terminal) */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-[#333]">
            {/* Code Editor */}
            <div className="flex-1 bg-[#1e1e1e] flex flex-col min-h-0">
              <div className="flex text-sm bg-[#252526] shrink-0">
                <div className="px-4 py-2 bg-[#1e1e1e] text-orange-400 border-t-2 border-orange-500 flex items-center gap-2">
                   <File className="w-4 h-4 text-blue-300" /> {activeFile.split('/').pop()}
                </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                <textarea 
                  className="w-full h-full bg-transparent text-gray-300 font-mono text-[13px] leading-relaxed resize-none outline-none" 
                  value={files[activeFile] || ''}
                  onChange={(e) => setFiles(prev => ({ ...prev, [activeFile]: e.target.value }))}
                  spellCheck="false"
                />
              </div>
            </div>

            {/* Bottom Terminal */}
            <div className="h-64 bg-[#1e1e1e] border-t border-[#333] flex flex-col shrink-0">
              <div className="flex text-xs bg-[#252526] px-2 pt-1 border-b border-[#333] shrink-0">
                <div className="px-3 py-1.5 text-gray-300 uppercase tracking-wider border-b-2 border-orange-500 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5" /> Terminal
                </div>
              </div>
              <div className="flex-1 p-3 font-mono text-[12px] leading-relaxed text-gray-300 overflow-y-auto bg-[#181818]">
                <div className="text-gray-500 mb-2">Welcome to ACC Sandboxed Terminal. Type your commands below.</div>
                <div><span className="text-green-500">akshat@acc-sandbox</span><span className="text-blue-400">~/workspace</span>$ npm install lucide-react</div>
                <div className="text-gray-400 my-1">added 1 package, and audited 221 packages in 2s</div>
                <div><span className="text-green-500">akshat@acc-sandbox</span><span className="text-blue-400">~/workspace</span>$ npm run dev</div>
                <div className="text-cyan-400 mt-1">  VITE v5.0.0  ready in 350 ms</div>
                <div className="text-green-400">  ➜  Local:   http://localhost:5173/</div>
                <div className="text-gray-400">  ➜  Network: use --host to expose</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-green-500">akshat@acc-sandbox</span><span className="text-blue-400">~/workspace</span>$
                  <input type="text" className="bg-transparent outline-none text-white flex-1" autoFocus/>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel (AI Agent) */}
          <div className="w-80 bg-[#252526] flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-[#333] text-sm font-bold flex items-center gap-2 shrink-0">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              ACC AI Copilot
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-[13px]">
              {agentMessages.map((msg, idx) => (
                <div key={idx} className={msg.role === 'system' ? "bg-[#333] p-3.5 rounded-xl text-gray-200 shadow-sm border border-[#444] rounded-tl-none" : "bg-orange-500/10 text-orange-100 p-3.5 rounded-xl self-end border border-orange-500/20 shadow-sm rounded-tr-none ml-8"}>
                  {msg.role === 'system' && <div className="font-bold text-[#ea580c] mb-1 text-xs uppercase tracking-wider">System</div>}
                  <p className="mb-2 whitespace-pre-wrap">{msg.text}</p>
                  {msg.changes && (
                    <div className="bg-[#1e1e1e] p-2 rounded border border-[#444] text-xs font-mono text-gray-400 mt-2">
                      {msg.changes.map(file => (
                        <div key={file} className="text-green-400">+ Updated {file}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isAgentTyping && (
                <div className="bg-[#333] p-3.5 rounded-xl text-gray-200 shadow-sm border border-[#444] rounded-tl-none self-start flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-[#333] shrink-0 bg-[#2d2d30]">
              <form onSubmit={handleAgentSubmit} className="bg-[#1e1e1e] rounded-xl p-1.5 flex items-center border border-[#444] focus-within:border-orange-500 transition">
                <input 
                  type="text" 
                  value={agentInput}
                  onChange={(e) => setAgentInput(e.target.value)}
                  placeholder="Give a command to edit files..." 
                  className="bg-transparent text-sm w-full outline-none text-white px-3 py-2" 
                  disabled={isAgentTyping}
                />
                <button type="submit" disabled={isAgentTyping || !agentInput.trim()} className="p-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:hover:bg-orange-600 rounded-lg text-white transition shrink-0">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f4f3ec] flex font-sans text-gray-900">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 h-screen p-6 flex flex-col shadow-sm z-10">
          <div className="flex items-center gap-3 mb-10 pl-2">
            <div className="bg-[#1c2135] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs italic shadow-md">ACC</div>
            <span className="font-bold text-sm tracking-tight">Akshat Cyber Cloud</span>
          </div>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('Overview')}
              className={`text-sm font-semibold py-2.5 px-4 rounded-xl text-left transition ${activeTab === 'Overview' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('Security Agents')}
              className={`text-sm font-semibold py-2.5 px-4 rounded-xl text-left transition ${activeTab === 'Security Agents' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              Security Agents
            </button>
            <button
              onClick={() => setActiveTab('Cloud Infrastructure')}
              className={`text-sm font-semibold py-2.5 px-4 rounded-xl text-left transition ${activeTab === 'Cloud Infrastructure' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              Cloud Infrastructure
            </button>
            <button
              onClick={() => setActiveTab('Settings')}
              className={`text-sm font-semibold py-2.5 px-4 rounded-xl text-left transition ${activeTab === 'Settings' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              Settings
            </button>
          </div>
          <div className="mt-auto">
            <button
              onClick={() => setIsLoggedIn(false)}
              className="text-[#ea580c] hover:bg-orange-50 text-sm font-semibold py-2.5 px-4 rounded-xl text-left transition w-full"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-12 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-[32px] font-bold text-[#16171d] tracking-tight">Command Center</h1>
              <button
                onClick={handleStartPod}
                disabled={isStarting}
                className="bg-[#ea580c] hover:bg-[#d04a07] disabled:bg-gray-300 text-white font-bold text-xs tracking-wider px-5 py-3 rounded-xl transition flex items-center gap-2 active:scale-95 shadow-sm"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    CREATING POD...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    CREATE NEW POD
                  </>
                )}
              </button>
            </div>
            <p className="text-gray-500 font-medium mb-10">Welcome back. Your autonomous agents are actively monitoring the infrastructure.</p>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-sm font-semibold text-gray-500 mb-2">Active Sandboxes</div>
                <div className="text-3xl font-bold text-[#16171d]">{pods.length}</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-sm font-semibold text-gray-500 mb-2">Active Agents</div>
                <div className="text-3xl font-bold text-[#16171d]">{12 + pods.length}</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-sm font-semibold text-gray-500 mb-2">System Status</div>
                <div className="text-3xl font-bold text-green-500 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div> Secure
                </div>
              </div>
            </div>

            {/* Main view panel depending on selected tab */}
            {activeTab === 'Overview' && (
              <div className="space-y-6">
                {/* Console / Launch status panel */}
                {(isStarting || logs.length > 0) && (
                  <div className="bg-gray-900 text-gray-100 rounded-3xl p-6 shadow-xl border border-gray-800 font-mono text-xs">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-orange-500" />
                        <span className="font-bold text-gray-300">Sandbox Creation Console</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isStarting && <Loader2 className="w-3 h-3 animate-spin text-orange-500" />}
                        <span className="text-[10px] bg-gray-800 text-orange-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                          {apiMode === 'live' ? 'Live Mode' : 'Demo Engine'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-2">
                      {logs.map((log, index) => (
                        <div key={index} className="leading-relaxed whitespace-pre-wrap">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dashboard active sandbox services list */}
                {pods.length > 0 ? (
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Server className="w-5 h-5 text-[#ea580c]" /> Active Cloud Sandbox Pods
                    </h3>
                    <div className="divide-y divide-gray-100">
                      {pods.map(pod => (
                        <div key={pod.id} className="py-4 flex items-center justify-between group first:pt-0 last:pb-0">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#ea580c]">
                              <Cpu className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 flex items-center gap-2">
                                {pod.name}
                                <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                                  {pod.status}
                                </span>
                              </div>
                              <div className="text-xs text-gray-400 font-medium">ID: {pod.id} &bull; Created at {pod.created}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setActivePodWorkspace(pod)}
                              className="text-xs font-bold text-white bg-gray-900 hover:bg-black px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                            >
                              Open Workspace
                              <Terminal className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={pod.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-[#ea580c] hover:bg-orange-50 px-4 py-2 rounded-xl transition flex items-center gap-1.5"
                            >
                              Preview
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => deletePod(pod.id)}
                              className="text-gray-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 min-h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2v20M17 5l-10 14M7 5l10 14M2 12h20" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">No active sandbox pods</h3>
                      <p className="text-gray-500 text-sm max-w-[250px] mx-auto mb-6">Create a secure virtual sandbox environment to build, deploy, and test code dynamically.</p>
                      <button
                        onClick={handleStartPod}
                        className="bg-orange-50 text-[#ea580c] hover:bg-orange-100 font-bold text-xs tracking-wider px-6 py-3.5 rounded-xl transition inline-flex items-center gap-2 active:scale-95"
                      >
                        <Play className="w-4.5 h-4.5 fill-[#ea580c]" />
                        PROVISION FIRST POD
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Security Agents' && (
              <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <Activity className="w-12 h-12 text-[#ea580c] mx-auto mb-4 animate-pulse" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Autonomous Security Agents</h3>
                  <p className="text-gray-500 text-sm max-w-[350px] mx-auto">12 global threat detection agents are active. Monitoring system logs, network packets, and open interfaces.</p>
                </div>
              </div>
            )}

            {activeTab === 'Cloud Infrastructure' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Kubernetes & Container Provisioning</h3>
                  <p className="text-gray-500 text-sm mb-6">Manage all dynamically-allocated cloud clusters, sandbox environments, and isolated virtual network stacks.</p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Sandbox Endpoint</div>
                      <div className="font-mono text-sm text-[#ea580c] break-all">http://localhost/api/sandbox/start</div>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cluster Engine</div>
                      <div className="text-sm font-bold text-gray-800">Docker Desktop & Kubernetes (V1.28)</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-gray-100 pt-6">
                    <div>
                      <div className="font-bold text-gray-800 text-sm">Provision Sandbox Instance</div>
                      <div className="text-gray-500 text-xs">Dynamic virtual environment inside micro-Kubernetes container</div>
                    </div>
                    <button
                      onClick={handleStartPod}
                      disabled={isStarting}
                      className="bg-[#ea580c] hover:bg-[#d04a07] disabled:bg-gray-300 text-white font-bold text-xs tracking-wider px-6 py-3 rounded-xl transition flex items-center gap-2 active:scale-95"
                    >
                      {isStarting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                      START POD
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Settings' && (
              <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 text-[#ea580c]">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Control Panel Settings</h3>
                  <p className="text-gray-500 text-sm max-w-[280px] mx-auto">System configuration, environment policies, and cloud integration keys.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }


  if (showAuth) {
    return <AuthPage onBack={() => setShowAuth(false)} onLogin={() => { setShowAuth(false); setIsLoggedIn(true); }} />;
  }

  return (
    <div className="min-h-screen bg-[#f4f3ec] text-gray-900 overflow-hidden font-sans relative">

      {/* Navigation */}
      <div className="absolute top-8 w-full flex justify-center z-50">
        <nav className="bg-white/80 backdrop-blur-xl px-2 py-2 rounded-full flex items-center shadow-sm border border-white/50 w-full max-w-[1200px] justify-between mx-6">
          <div className="flex items-center gap-10">
            <div className="bg-[#1c2135] text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg italic shadow-md ml-1">
              ACC
            </div>
            <div className="hidden md:flex gap-8 text-[11px] font-bold tracking-widest text-gray-800">
              <a href="#" className="hover:text-gray-500 transition">PLATFORM</a>
              <a href="#" className="hover:text-gray-500 transition">SOLUTIONS</a>
              <a href="#" className="hover:text-gray-500 transition">SECURITY</a>
              <a href="#" className="hover:text-gray-500 transition">DOCS</a>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold">
              <span className="text-[#ea580c] text-[10px] uppercase font-bold tracking-wider">NEWS</span>
              <span className="text-[11px] font-bold tracking-wider text-gray-800">LATEST ACC V2.0 RELEASED</span>
              <ChevronRight className="w-3 h-3 text-gray-400" />
            </div>
            <button
              onClick={() => setShowAuth(true)}
              className="bg-white text-gray-900 font-bold text-[11px] tracking-widest px-8 py-3.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100 hover:bg-gray-50 transition mr-1"
            >
              DEPLOY AGENT
            </button>
          </div>
        </nav>
      </div>

      {/* Main Hero Content */}
      <div className="container mx-auto px-6 lg:px-20 pt-44 pb-20 relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-screen items-center">

        {/* Left Content */}
        <div className="flex flex-col items-start max-w-xl z-20 relative">
          <div className="bg-[#ea580c]/10 text-[#ea580c] px-3 py-1.5 rounded-md text-[10px] font-bold tracking-widest uppercase mb-8">
            AI-DRIVEN CYBERSECURITY & CLOUD
          </div>

          <h1 className="text-6xl lg:text-[72px] font-medium leading-[1.05] tracking-tight text-[#16171d] mb-6">
            Intelligent Orchestration.<br />
            Built for Cyber Defense.
          </h1>

          <p className="text-[#4b5563] text-[18px] leading-[1.6] max-w-[420px] mb-10 font-medium">
            Deploy autonomous AI agents to monitor, manage,<br />and secure your cloud infrastructure at scale.
          </p>

          <button
            onClick={() => setShowAuth(true)}
            className="bg-[#ea580c] hover:bg-[#d04a07] text-white px-8 py-4 rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-500/20 active:scale-95"
          >
            START FREE TRIAL
          </button>

          <div className="relative mt-24 w-[340px] ml-4">
            <div className="absolute -top-6 -left-12 w-full bg-white/30 backdrop-blur-md rounded-2xl border border-white/50 p-6 transform -rotate-6 shadow-sm opacity-90 pointer-events-none">
              <div className="flex items-center gap-3 mb-5 opacity-60">
                <div className="w-8 h-8 rounded-full bg-gray-300" />
                <div className="flex flex-col gap-2 flex-1">
                  <div className="h-2 w-24 bg-gray-300 rounded" />
                  <div className="h-1.5 w-16 bg-gray-300 rounded" />
                </div>
              </div>
              <div className="h-2 w-full bg-gray-300 rounded mb-3 opacity-60" />
              <div className="h-2 w-4/5 bg-gray-300 rounded mb-3 opacity-60" />
              <div className="h-2 w-3/5 bg-gray-300 rounded opacity-60" />
            </div>

            <div className="bg-white rounded-2xl p-7 shadow-[0_20px_40px_rgba(0,0,0,0.06)] relative z-10 border border-white">
              <div className="text-[12px] font-bold tracking-widest text-[#16171d] mb-4">SECURITY AGENT</div>
              <p className="text-[13px] text-gray-500 font-medium mb-6 leading-relaxed">
                Autonomous threat detection and mitigation
              </p>
              <div className="flex gap-2">
                <span className="bg-[#f0f1f5] text-gray-600 px-2.5 py-1.5 rounded-md text-[10px] font-bold tracking-widest">SCAN</span>
                <span className="bg-[#f0f1f5] text-gray-600 px-2.5 py-1.5 rounded-md text-[10px] font-bold tracking-widest">MONITOR</span>
                <span className="bg-[#f0f1f5] text-gray-600 px-2.5 py-1.5 rounded-md text-[10px] font-bold tracking-widest">REMEDIATE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Stats */}
        <div className="hidden lg:flex flex-col gap-12 absolute right-32 top-[55%] transform -translate-y-1/2 z-20">
          <div>
            <h3 className="text-[32px] font-semibold text-[#16171d] mb-1 leading-none tracking-tight">99.9%</h3>
            <p className="text-[13px] text-gray-500 font-medium">Uptime SLA</p>
          </div>
          <div>
            <h3 className="text-[32px] font-semibold text-[#16171d] mb-1 leading-none tracking-tight">50x</h3>
            <p className="text-[13px] text-gray-500 font-medium">Faster Remediation</p>
          </div>
          <div>
            <h3 className="text-[32px] font-semibold text-[#16171d] mb-1 leading-none tracking-tight">0-Day</h3>
            <p className="text-[13px] text-gray-500 font-medium">Threat Protection</p>
          </div>
        </div>
      </div>

      <div className="absolute right-[-40%] top-[5%] w-[1400px] h-[1400px] pointer-events-none z-0">
        <div
          className="absolute inset-0 rounded-full border-[160px] border-[#e2ddd3]/60 shadow-[inset_0_0_50px_rgba(0,0,0,0.02)]"
          style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 85%)' }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 75, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 origin-center"
        >
          {[...Array(9)].map((_, i) => {
            const angle = i * -40 - 35;
            const IconComponent = ORBIT_ICONS[i % 3];

            return (
              <div
                key={i}
                className="absolute inset-0 origin-center"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div className="absolute top-[30px] left-1/2 transform -translate-x-1/2">
                  <div className="absolute top-1/2 left-1/2 w-[220px] h-[80px] bg-[#1a2035] opacity-50 blur-[30px] rounded-full transform translate-x-[-10%] -translate-y-1/2" />
                  <div className="absolute top-1/2 left-1/2 w-[140px] h-[60px] bg-[#0f1423] opacity-60 blur-[20px] rounded-full transform translate-x-[-20%] -translate-y-1/2" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 75, repeat: Infinity, ease: "linear" }}
                    className="relative z-10"
                  >
                    <motion.div
                      animate={{ y: [-5, 5, -5] }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.5
                      }}
                      className="relative"
                    >
                      <div className="w-[110px] h-[110px] rounded-full bg-gradient-to-br from-[#3b415a] via-[#242b45] to-[#161a2d] flex items-center justify-center text-white shadow-[0_15px_30px_rgba(20,25,45,0.4)] relative z-10 border border-[#4a5170]/50 backdrop-blur-md">
                        <IconComponent />
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

    </div>
  );
}
