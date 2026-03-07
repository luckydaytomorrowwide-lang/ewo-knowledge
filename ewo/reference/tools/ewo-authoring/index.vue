<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <!-- Top Toolbar -->
    <div class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-bold text-gray-800 leading-tight">EWO Workflow<br>Authoring Tool</h1>
        <span class="text-sm text-gray-500 leading-tight">v1.0<br>Event-Wired Orchestration</span>
      </div>
      <div class="flex items-center gap-2">
        <NuxtLink
          to="/workflow-runner"
          class="px-4 py-2 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100 text-sm font-medium text-purple-700 transition-all"
        >
          Runner
        </NuxtLink>

        <div class="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded">
          <label class="text-xs font-medium text-gray-500">WF:</label>
          <input
            v-model="wfName"
            type="text"
            placeholder="Untitled"
            class="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-400 w-64 bg-white"
          />
        </div>

        <button
          @click="handleNew"
          class="px-4 py-2 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 text-sm font-medium text-blue-700 transition-all"
        >
          New
        </button>
        <button
          @click="handleLoad"
          class="px-4 py-2 bg-cyan-50 border border-cyan-200 rounded hover:bg-cyan-100 text-sm font-medium text-cyan-700 transition-all"
        >
          Load
        </button>
        <button
          @click="handleValidate"
          :disabled="nodes.length === 0"
          class="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded text-sm font-medium text-emerald-700 transition-all"
          :class="nodes.length > 0 ? 'hover:bg-emerald-100 cursor-pointer' : 'opacity-50 cursor-not-allowed'"
        >
          Validate
        </button>
        <button
          @click="handleExport"
          :disabled="nodes.length === 0"
          class="px-4 py-2 bg-green-50 border border-green-200 rounded text-sm font-medium text-green-700 transition-all"
          :class="nodes.length > 0 ? 'hover:bg-green-100 cursor-pointer' : 'opacity-50 cursor-not-allowed'"
        >
          Export
        </button>
        <button
          @click="handleExportPng"
          :disabled="nodes.length === 0"
          class="px-4 py-2 bg-orange-50 border border-orange-200 rounded text-sm font-medium text-orange-700 transition-all"
          :class="nodes.length > 0 ? 'hover:bg-orange-100 cursor-pointer' : 'opacity-50 cursor-not-allowed'"
        >
          PNG
        </button>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept=".json"
      @change="onFileSelected"
      class="hidden"
    />

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Palette -->
      <div
        class="bg-white border-r border-gray-200 overflow-y-auto transition-all duration-200 relative"
        :class="sidebarOpen ? 'w-64' : 'w-0 overflow-hidden border-r-0'"
      >
        <div class="p-4 w-64">
          <h2 class="text-sm font-semibold text-gray-700 mb-3">Node Palette</h2>

          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search nodes..."
            class="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-4 focus:outline-none focus:border-blue-500"
          />

          <!-- Activities -->
          <div class="mb-4">
            <h3
              @click="activitiesOpen = !activitiesOpen"
              class="text-xs font-semibold text-gray-600 mb-2 uppercase flex items-center justify-between cursor-pointer hover:text-gray-800"
            >
              <span>Activities ({{ filteredActivities.length }})</span>
              <div class="flex items-center gap-2">
                <button
                  @click.stop="showCreateActivityModal = true"
                  class="text-blue-600 hover:text-blue-700 font-bold text-lg leading-none"
                  title="Create new activity"
                >+</button>
                <span class="text-lg leading-none">{{ activitiesOpen ? '▼' : '▶' }}</span>
              </div>
            </h3>
            <div v-show="activitiesOpen" class="space-y-1">
              <div
                v-for="activity in filteredActivities"
                :key="activity.id"
                draggable="true"
                @dragstart="onDragStart($event, { ...activity, dragType: 'ac' })"
                class="p-2 bg-blue-50 border border-blue-200 rounded cursor-move hover:bg-blue-100 text-xs font-medium flex items-center justify-between"
              >
                <span>{{ activity.name }}</span>
                <span v-if="activity.isCustom" class="text-xs text-blue-600">*</span>
              </div>
            </div>
          </div>

          <!-- Workflows (wfCall) -->
          <div class="mb-4">
            <h3
              @click="workflowsOpen = !workflowsOpen"
              class="text-xs font-semibold text-gray-600 mb-2 uppercase flex items-center justify-between cursor-pointer hover:text-gray-800"
            >
              <span>Workflows ({{ filteredWorkflows.length }})</span>
              <span class="text-lg leading-none">{{ workflowsOpen ? '▼' : '▶' }}</span>
            </h3>
            <div v-show="workflowsOpen" class="space-y-1">
              <div
                v-for="wf in filteredWorkflows"
                :key="wf.id"
                draggable="true"
                @dragstart="onDragStart($event, { ...wf, dragType: 'wfCall' })"
                class="p-2 bg-purple-50 border border-purple-200 rounded cursor-move hover:bg-purple-100 text-xs font-medium"
              >
                {{ wf.name }}
              </div>
            </div>
          </div>

          <!-- Special Nodes -->
          <div>
            <h3
              @click="specialOpen = !specialOpen"
              class="text-xs font-semibold text-gray-600 mb-2 uppercase flex items-center justify-between cursor-pointer hover:text-gray-800"
            >
              <span>Special (4)</span>
              <span class="text-lg leading-none">{{ specialOpen ? '▼' : '▶' }}</span>
            </h3>
            <div v-show="specialOpen" class="space-y-1">
              <div
                draggable="true"
                @dragstart="onDragStart($event, { dragType: 'start' })"
                class="p-2 bg-green-50 border border-green-200 rounded cursor-move hover:bg-green-100 text-xs font-medium"
              >
                ▶ Workflow Start
              </div>
              <div
                draggable="true"
                @dragstart="onDragStart($event, { dragType: 'end' })"
                class="p-2 bg-red-50 border border-red-200 rounded cursor-move hover:bg-red-100 text-xs font-medium"
              >
                ⬛ Workflow End
              </div>
              <div
                draggable="true"
                @dragstart="onDragStart($event, { dragType: 'literal' })"
                class="p-2 bg-yellow-50 border border-yellow-200 rounded cursor-move hover:bg-yellow-100 text-xs font-medium"
              >
                📌 Literal Value
              </div>
              <div
                draggable="true"
                @dragstart="onDragStart($event, { dragType: 'forEachRegion' })"
                class="p-2 bg-blue-50 border border-blue-200 rounded cursor-move hover:bg-blue-100 text-xs font-medium"
              >
                🔁 ForEach Region
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Canvas Area -->
      <div class="flex-1 relative">
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="absolute top-2 left-2 z-10 w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-100 text-gray-500 text-xs"
        >
          {{ sidebarOpen ? '◀' : '▶' }}
        </button>

        <VueFlow
          v-model:nodes="nodes"
          v-model:edges="edges"
          :node-types="nodeTypes"
          :edge-types="edgeTypes"
          :default-viewport="{ zoom: 0.8 }"
          :min-zoom="0.2"
          :max-zoom="2"
          :pan-on-drag="panMode ? [0, 1, 2] : false"
          :selection-key-code="panMode ? null : true"
          :pan-on-scroll="true"
          :selection-mode="'partial'"
          :connect-on-drop="false"
          class="workflow-canvas"
          @drop="onDrop"
          @dragover="onDragOver"
          @node-click="onNodeClick"
          @edge-click="onEdgeClick"
          @connect="onConnect"
        >
          <Background pattern-color="#aaa" :gap="16" />
          <Controls>
            <ControlButton
              @click="panMode = !panMode"
              :title="panMode ? 'Pan Mode (click to switch to Select)' : 'Select Mode (click to switch to Pan)'"
              class="mode-toggle-button"
            >
              <svg v-if="panMode" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" /><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" /><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" /><path d="M13 13l6 6" />
              </svg>
            </ControlButton>
          </Controls>
          <MiniMap />
        </VueFlow>

        <div
          v-if="nodes.length === 0"
          class="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div class="text-center text-gray-400">
            <div class="text-6xl mb-4">🎨</div>
            <p class="text-lg font-medium">Drag nodes from the palette to start</p>
            <p class="text-sm">Connect outputs to inputs to define data dependencies</p>
          </div>
        </div>
      </div>

      <!-- Right Property Panel -->
      <div
        class="bg-white border-l border-gray-200 overflow-y-auto transition-all duration-200"
        :class="propertyPanelOpen ? 'w-80' : 'w-0 overflow-hidden border-l-0'"
      >
        <div class="p-4 w-80">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-semibold text-gray-700">Properties</h2>
            <button
              @click="propertyPanelOpen = false"
              class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            >✕</button>
          </div>

          <!-- AC Node Properties -->
          <div v-if="selectedNode && selectedNode.type === 'ewoAc'">
            <div class="mb-4 pb-4 border-b">
              <div class="text-xs font-medium text-gray-500 mb-2">ACTIVITY NODE</div>
              <div class="mb-3">
                <label class="block text-xs font-medium text-gray-700 mb-1">Label</label>
                <input v-model="selectedNode.data.label" type="text" class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500" @input="updateNode" />
              </div>
              <div class="mb-3">
                <label class="block text-xs font-medium text-gray-700 mb-1">Operation</label>
                <div class="px-3 py-2 bg-gray-100 rounded text-sm text-gray-600">{{ selectedNode.data.operation || selectedNode.data.functionRef }}</div>
              </div>
            </div>

            <!-- Deps (auto-detected) -->
            <div v-if="computedDeps.length > 0" class="mb-4 pb-4 border-b">
              <div class="text-xs font-medium text-gray-500 mb-2">DEPS (auto-detected)</div>
              <div class="space-y-1">
                <div v-for="dep in computedDeps" :key="dep.port" class="text-xs p-2 bg-green-50 rounded border border-green-200">
                  <span class="font-medium">{{ dep.port }}</span>
                  <span class="text-gray-500"> ← {{ dep.source }}</span>
                </div>
              </div>
            </div>

            <!-- Inputs -->
            <div v-if="selectedNode.data.inputs?.length > 0" class="mb-4 pb-4 border-b">
              <div class="text-xs font-medium text-gray-500 mb-2">INPUTS</div>
              <div class="space-y-2">
                <div v-for="input in selectedNode.data.inputs" :key="input.name" class="text-xs">
                  <div class="p-2 bg-green-50 rounded border border-green-200 mb-1">
                    <div class="font-medium">{{ input.name }} <span class="text-gray-500">{{ input.type }}</span></div>
                  </div>
                  <button @click="createLiteralForInput(input)" class="w-full px-3 py-1 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 rounded text-xs font-medium text-yellow-800">
                    📌 Create Literal
                  </button>
                </div>
              </div>
            </div>

            <!-- Outputs -->
            <div v-if="selectedNode.data.outputs?.length > 0" class="mb-4 pb-4 border-b">
              <div class="text-xs font-medium text-gray-500 mb-2">OUTPUTS</div>
              <div class="space-y-1">
                <div v-for="output in selectedNode.data.outputs" :key="output.name" class="text-xs p-2 bg-blue-50 rounded border border-blue-200">
                  <span class="font-medium">{{ output.name }}</span> <span class="text-gray-500">{{ output.type }}</span>
                </div>
              </div>
            </div>

            <!-- Guard -->
            <div class="mb-4 pb-4 border-b">
              <div class="flex items-center gap-2 mb-2">
                <input type="checkbox" :checked="!!selectedNode.data.guard" @change="toggleGuard" class="rounded" />
                <span class="text-xs font-medium text-gray-500">GUARD CONDITION</span>
              </div>
              <div v-if="selectedNode.data.guard !== undefined && selectedNode.data.guard !== null">
                <input v-model="selectedNode.data.guard" type="text" placeholder=".category == &quot;typeA&quot;" class="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:border-blue-500" @input="updateNode" />
                <p class="text-xs text-gray-400 mt-1">JQ expression</p>
              </div>
            </div>

            <button @click="deleteNode" class="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium">Delete Node</button>
          </div>

          <!-- wfCall Node Properties -->
          <div v-else-if="selectedNode && selectedNode.type === 'ewoWfCall'">
            <div class="mb-4 pb-4 border-b">
              <div class="text-xs font-medium text-gray-500 mb-2">WF CALL NODE</div>
              <div class="mb-3">
                <label class="block text-xs font-medium text-gray-700 mb-1">Label</label>
                <input v-model="selectedNode.data.label" type="text" class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500" @input="updateNode" />
              </div>
              <div class="mb-3">
                <label class="block text-xs font-medium text-gray-700 mb-1">Callee</label>
                <input v-model="selectedNode.data.wfCall.callee" type="text" placeholder="WF-Purchase" class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500" @input="updateNode" />
              </div>
              <div class="mb-3">
                <label class="block text-xs font-medium text-gray-700 mb-1">Version</label>
                <input v-model="selectedNode.data.wfCall.calleeVersion" type="text" placeholder="^1.0.0" class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500" @input="updateNode" />
              </div>
              <div class="mb-3">
                <label class="block text-xs font-medium text-gray-700 mb-1">Boundary</label>
                <div class="flex gap-4 text-xs">
                  <label class="flex items-center gap-1">
                    <input type="radio" :value="false" v-model="selectedNode.data.wfCall.boundary" @change="onBoundaryChange" /> inline
                  </label>
                  <label class="flex items-center gap-1">
                    <input type="radio" :value="true" v-model="selectedNode.data.wfCall.boundary" @change="onBoundaryChange" /> external
                  </label>
                </div>
              </div>
              <div v-if="selectedNode.data.wfCall.boundary === true" class="mb-3 p-3 bg-amber-50 border border-amber-200 rounded">
                <div class="text-xs font-semibold text-amber-800 mb-2">Policy (boundary=true)</div>
                <div class="mb-2">
                  <label class="block text-xs text-gray-600 mb-1">Timeout (sec)</label>
                  <input
                    type="number"
                    :value="selectedNode.data.wfCall.policy?.timeoutSec ?? ''"
                    @input="onPolicyTimeoutChange($event)"
                    placeholder="120"
                    class="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div class="mb-2">
                  <label class="block text-xs text-gray-600 mb-1">Retry Max</label>
                  <input
                    type="number"
                    :value="selectedNode.data.wfCall.policy?.retry?.max ?? ''"
                    @input="onPolicyRetryMaxChange($event)"
                    placeholder="2"
                    class="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div class="mb-2">
                  <label class="block text-xs text-gray-600 mb-1">Retry Backoff (sec)</label>
                  <input
                    type="number"
                    :value="selectedNode.data.wfCall.policy?.retry?.backoffSec ?? ''"
                    @input="onPolicyRetryBackoffChange($event)"
                    placeholder="5"
                    class="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div class="mb-2">
                  <label class="block text-xs text-gray-600 mb-1">Max Recursion Depth</label>
                  <input
                    type="number"
                    :value="selectedNode.data.wfCall.policy?.maxRecursionDepth ?? ''"
                    @input="onPolicyMaxRecursionDepthChange($event)"
                    placeholder="20"
                    class="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div class="mb-2">
                  <label class="flex items-center gap-2 text-xs text-gray-600">
                    <input type="checkbox" v-model="selectedNode.data.wfCall.recursive" @change="updateNode" />
                    Recursive (self-call)
                  </label>
                </div>
              </div>
            </div>

            <!-- Deps (auto) -->
            <div v-if="computedDeps.length > 0" class="mb-4 pb-4 border-b">
              <div class="text-xs font-medium text-gray-500 mb-2">DEPS (auto-detected)</div>
              <div class="space-y-1">
                <div v-for="dep in computedDeps" :key="dep.port" class="text-xs p-2 bg-purple-50 rounded border border-purple-200">
                  <span class="font-medium">{{ dep.port }}</span>
                  <span class="text-gray-500"> ← {{ dep.source }}</span>
                </div>
              </div>
            </div>

            <button @click="deleteNode" class="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium">Delete Node</button>
          </div>

          <!-- Literal Node Properties -->
          <div v-else-if="selectedNode && selectedNode.type === 'ewoLiteral'">
            <div class="mb-4 pb-4 border-b">
              <div class="text-xs font-medium text-gray-500 mb-2">LITERAL VALUE</div>
              <div class="mb-3">
                <label class="block text-xs font-medium text-gray-700 mb-1">Type</label>
                <select v-model="selectedNode.data.valueType" class="w-full px-3 py-2 border border-gray-300 rounded text-sm" @change="updateNode">
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                  <option value="object">object</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="block text-xs font-medium text-gray-700 mb-1">Value</label>
                <input v-if="selectedNode.data.valueType === 'number'" type="number" v-model="selectedNode.data.value" class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500" @input="updateNode" />
                <select v-else-if="selectedNode.data.valueType === 'boolean'" v-model="selectedNode.data.value" class="w-full px-3 py-2 border border-gray-300 rounded text-sm" @change="updateNode">
                  <option :value="true">true</option>
                  <option :value="false">false</option>
                </select>
                <textarea v-else-if="selectedNode.data.valueType === 'object'" v-model="selectedNode.data.value" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:border-blue-500" @input="updateNode" />
                <input v-else type="text" v-model="selectedNode.data.value" class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500" @input="updateNode" />
              </div>
            </div>
            <button @click="deleteNode" class="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium">Delete Literal</button>
          </div>

          <!-- Start Node Properties -->
          <div v-else-if="selectedNode && selectedNode.type === 'ewoStart'">
            <div class="mb-4 pb-4 border-b">
              <div class="text-xs font-medium text-gray-500 mb-2">WORKFLOW START</div>
              <div class="text-xs font-medium text-gray-500 mb-2">WF Inputs:</div>
              <div v-for="(input, idx) in selectedNode.data.inputs" :key="idx" class="flex items-center gap-2 mb-2">
                <input v-model="input.name" placeholder="name" class="flex-1 px-2 py-1 border border-gray-300 rounded text-xs" @input="updateNode" />
                <select v-model="input.type" class="w-20 px-1 py-1 border border-gray-300 rounded text-xs" @change="updateNode">
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                  <option value="object">object</option>
                  <option value="array">array</option>
                  <option value="any">any</option>
                </select>
                <button @click="removeInput(idx)" class="text-red-400 hover:text-red-600 text-xs">✕</button>
              </div>
              <button @click="addInput" class="w-full px-3 py-1.5 bg-green-50 border border-green-200 rounded text-xs text-green-700 hover:bg-green-100">+ Add Input</button>
            </div>
          </div>

          <!-- ForEach Region Properties -->
          <div v-else-if="selectedNode && selectedNode.type === 'ewoForEachRegion'">
            <div class="mb-4 pb-4 border-b">
              <div class="text-xs font-medium text-gray-500 mb-2">FOREACH REGION</div>
              <div class="mb-3">
                <label class="block text-xs font-medium text-gray-700 mb-1">Zone ID</label>
                <input v-model="selectedNode.data.zoneId" type="text" class="w-full px-3 py-2 border border-gray-300 rounded text-sm" @input="updateNode" />
              </div>
              <div class="mb-3">
                <label class="block text-xs font-medium text-gray-700 mb-1">Label</label>
                <input v-model="selectedNode.data.label" type="text" class="w-full px-3 py-2 border border-gray-300 rounded text-sm" @input="updateNode" />
              </div>
              <div class="mb-3">
                <label class="block text-xs font-medium text-gray-700 mb-1">Iteration Param</label>
                <input v-model="selectedNode.data.iterationParam" type="text" class="w-full px-3 py-2 border border-gray-300 rounded text-sm" @input="updateNode" />
              </div>
              <div class="mb-3">
                <label class="block text-xs font-medium text-gray-700 mb-1">Output Collection</label>
                <input v-model="selectedNode.data.outputCollection" type="text" class="w-full px-3 py-2 border border-gray-300 rounded text-sm" @input="updateNode" />
              </div>
            </div>
            <button @click="deleteNode" class="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium">Delete Region</button>
          </div>

          <!-- End Node Properties -->
          <div v-else-if="selectedNode && selectedNode.type === 'ewoEnd'">
            <div class="mb-4 pb-4 border-b">
              <div class="text-xs font-medium text-gray-500 mb-2">WORKFLOW END</div>
              <div class="text-xs font-medium text-gray-500 mb-2">WF Outputs:</div>
              <div v-for="(output, idx) in selectedNode.data.outputs" :key="idx" class="flex items-center gap-2 mb-2">
                <input v-model="output.name" placeholder="name" class="flex-1 px-2 py-1 border border-gray-300 rounded text-xs" @input="updateNode" />
                <button @click="removeOutput(idx)" class="text-red-400 hover:text-red-600 text-xs">✕</button>
              </div>
              <button @click="addOutput" class="w-full px-3 py-1.5 bg-red-50 border border-red-200 rounded text-xs text-red-700 hover:bg-red-100">+ Add Output</button>

              <!-- Auto-detected sources -->
              <div v-if="endNodeSources.length > 0" class="mt-3">
                <div class="text-xs font-medium text-gray-500 mb-1">Connected Sources:</div>
                <div v-for="src in endNodeSources" :key="src.output" class="text-xs p-1 bg-gray-50 rounded mb-1">
                  {{ src.output }} ← {{ src.source }}
                </div>
              </div>
            </div>
          </div>

          <!-- Edge Properties -->
          <div v-else-if="selectedEdge">
            <div class="mb-4 pb-4 border-b">
              <div class="text-xs font-medium text-gray-500 mb-2">EDGE</div>
              <div class="text-xs space-y-1">
                <div><span class="text-gray-500">Source:</span> {{ selectedEdge.data?.sourceParam }}</div>
                <div><span class="text-gray-500">Target:</span> {{ selectedEdge.data?.targetParam }}</div>
              </div>
            </div>
            <button @click="deleteEdge" class="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium">Delete Edge</button>
          </div>

          <!-- No selection -->
          <div v-else class="text-sm text-gray-400 text-center py-8">
            Select a node or edge to view properties
          </div>
        </div>
      </div>
    </div>

    <!-- Create Activity Modal -->
    <CreateActivityModal
      v-if="showCreateActivityModal"
      @close="showCreateActivityModal = false"
      @create="handleCreateActivity"
    />

    <!-- Loading Overlay -->
    <div
      v-if="isLoadingDefinitions"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      style="backdrop-filter: blur(4px);"
    >
      <div class="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <div class="flex flex-col items-center gap-6">
          <div class="relative w-16 h-16">
            <div class="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <div class="text-center">
            <h3 class="text-xl font-bold text-gray-800 mb-2">Loading Workflow Definitions</h3>
            <p class="text-sm text-gray-600">Scanning activities and workflows from file system...</p>
          </div>
          <div class="w-full bg-gray-100 rounded-lg p-4 text-xs text-gray-700 space-y-1">
            <div class="flex items-center gap-2">
              <span class="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              <span>Loading activities...</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse" style="animation-delay: 0.2s;"></span>
              <span>Loading workflows...</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse" style="animation-delay: 0.4s;"></span>
              <span>Initializing editor...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, markRaw, nextTick, watch } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls, ControlButton } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { toPng } from 'html-to-image'

import EwoAcNode from '~/components/ewo-authoring/EwoAcNode.vue'
import EwoWfCallNode from '~/components/ewo-authoring/EwoWfCallNode.vue'
import EwoLiteralNode from '~/components/ewo-authoring/EwoLiteralNode.vue'
import EwoStartNode from '~/components/ewo-authoring/EwoStartNode.vue'
import EwoEndNode from '~/components/ewo-authoring/EwoEndNode.vue'
import EwoForEachRegionNode from '~/components/ewo-authoring/EwoForEachRegionNode.vue'
import EwoDataEdge from '~/components/ewo-authoring/EwoDataEdge.vue'
import CreateActivityModal from '~/components/workflow-authoring/CreateActivityModal.vue'

import { exportEwoJson } from '~/utils/ewo/exporter'
import { importEwoJson } from '~/utils/ewo/importer'
import { validateEwoWorkflow } from '~/utils/ewo/validator'
import type { EwoJson } from '~/utils/ewo/types'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

const nodeTypes = {
  ewoAc: markRaw(EwoAcNode),
  ewoWfCall: markRaw(EwoWfCallNode),
  ewoLiteral: markRaw(EwoLiteralNode),
  ewoStart: markRaw(EwoStartNode),
  ewoEnd: markRaw(EwoEndNode),
  ewoForEachRegion: markRaw(EwoForEachRegionNode),
}

const edgeTypes = {
  ewoDataEdge: markRaw(EwoDataEdge),
}

const fileSystemActivities = ref<any[]>([])
const fileSystemWorkflows = ref<any[]>([])

const showCreateActivityModal = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const searchQuery = ref('')
const nodes = ref<any[]>([])
const edges = ref<any[]>([])
const selectedNode = ref<any>(null)
const selectedEdge = ref<any>(null)
const propertyPanelOpen = ref(false)

const wfName = ref('')
const wfVersion = ref('1.0.0')
const wfDescription = ref('')

const isLoadingDefinitions = ref(true)
const sidebarOpen = ref(true)
const panMode = ref(true)
const activitiesOpen = ref(true)
const workflowsOpen = ref(false)
const specialOpen = ref(true)

let nodeIdCounter = 0
let edgeIdCounter = 0

const { getViewport, setViewport, fitView, screenToFlowCoordinate } = useVueFlow()

const filteredActivities = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return fileSystemActivities.value.filter(a => a.name.toLowerCase().includes(q))
})

const filteredWorkflows = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return fileSystemWorkflows.value.filter(w => w.name.toLowerCase().includes(q))
})

const computedDeps = computed(() => {
  if (!selectedNode.value) return []
  const incoming = edges.value.filter(e => e.target === selectedNode.value.id)
  return incoming.map(e => {
    const srcNode = nodes.value.find(n => n.id === e.source)
    const srcLabel = srcNode?.data?.label || srcNode?.id || '?'
    const srcPort = e.sourceHandle?.replace(/^output-/, '') || ''
    const tgtPort = e.targetHandle?.replace(/^input-/, '') || ''
    const srcDisplay = srcNode?.type === 'ewoStart' ? `$input.${srcPort}` :
                       srcNode?.type === 'ewoLiteral' ? `literal(${srcNode.data?.value})` :
                       `${srcLabel}.${srcPort}`
    return { port: tgtPort, source: srcDisplay }
  })
})

const endNodeSources = computed(() => {
  const endNode = selectedNode.value
  if (!endNode || endNode.type !== 'ewoEnd') return []
  const incoming = edges.value.filter(e => e.target === endNode.id)
  return incoming.map(e => {
    const srcNode = nodes.value.find(n => n.id === e.source)
    const srcLabel = srcNode?.data?.label || srcNode?.id || '?'
    const srcPort = e.sourceHandle?.replace(/^output-/, '') || ''
    const tgtPort = e.targetHandle?.replace(/^input-/, '') || ''
    return { output: tgtPort, source: `${srcLabel}.${srcPort}` }
  })
})

// --- Lifecycle ---

onMounted(async () => {
  isLoadingDefinitions.value = true

  try {
    const response = await $fetch('/api/workflow-defs/scan')
    fileSystemActivities.value = (response as any).activities || []
    fileSystemWorkflows.value = (response as any).workflows || []
    console.log(`Loaded ${fileSystemActivities.value.length} activities and ${fileSystemWorkflows.value.length} workflows`)
  } catch (error) {
    console.error('Failed to load workflow definitions:', error)
    alert('Failed to load activities/workflows from file system.\n\nThe palette will be empty. Please check the server logs.')
  }

  const saved = localStorage.getItem('ewo-authoring-draft')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      nodes.value = data.nodes || []
      edges.value = data.edges || []
      wfName.value = data.wfName || ''
      wfVersion.value = data.wfVersion || '1.0.0'
      wfDescription.value = data.wfDescription || ''
      nodeIdCounter = Math.max(...nodes.value.map(n => parseInt(n.id.replace(/\D/g, '')) || 0), 0) + 1
      edgeIdCounter = Math.max(...edges.value.map(e => parseInt(e.id.replace(/\D/g, '')) || 0), 0) + 1
    } catch { /* ignore */ }
  }

  isLoadingDefinitions.value = false
})

watch([nodes, edges, wfName], () => {
  try {
    localStorage.setItem('ewo-authoring-draft', JSON.stringify({
      nodes: nodes.value,
      edges: edges.value,
      wfName: wfName.value,
      wfVersion: wfVersion.value,
      wfDescription: wfDescription.value,
    }))
  } catch { /* ignore quota errors */ }
}, { deep: true })

// --- Drag & Drop ---

const onDragStart = (event: DragEvent, item: any) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/ewo', JSON.stringify(item))
  }
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
}

const onDrop = (event: DragEvent) => {
  event.preventDefault()
  const raw = event.dataTransfer?.getData('application/ewo')
  if (!raw) return

  const item = JSON.parse(raw)
  const position = screenToFlowCoordinate({ x: event.clientX, y: event.clientY })
  let newNode: any

  switch (item.dragType) {
    case 'start':
      newNode = {
        id: `node-${nodeIdCounter++}`,
        type: 'ewoStart',
        position,
        data: { inputs: [] },
      }
      break
    case 'end':
      newNode = {
        id: `node-${nodeIdCounter++}`,
        type: 'ewoEnd',
        position,
        data: { label: 'Workflow End', outputs: [] },
      }
      break
    case 'literal':
      newNode = {
        id: `node-${nodeIdCounter++}`,
        type: 'ewoLiteral',
        position,
        data: { value: '', valueType: 'string' },
      }
      break
    case 'forEachRegion':
      newNode = {
        id: `node-${nodeIdCounter++}`,
        type: 'ewoForEachRegion',
        position,
        style: { width: '520px', height: '300px' },
        data: {
          label: 'ForEach Zone',
          zoneId: `zone-${Date.now().toString(36)}`,
          iterationParam: 'item',
          outputCollection: '',
        },
      }
      break
    case 'wfCall':
      newNode = {
        id: `node-${nodeIdCounter++}`,
        type: 'ewoWfCall',
        position,
        data: {
          label: item.name,
          operation: item.id,
          functionRef: item.id,
          inputs: item.inputs || [],
          outputs: item.outputs || [],
          wfCall: { callee: item.id, calleeVersion: '', boundary: false },
        },
      }
      break
    default:
      newNode = {
        id: `node-${nodeIdCounter++}`,
        type: 'ewoAc',
        position,
        data: {
          label: item.name,
          operation: item.id,
          functionRef: item.id,
          nodeType: item.type || 'activity',
          inputs: item.inputs || [],
          outputs: item.outputs || [],
        },
      }
  }

  nodes.value.push(newNode)
}

// --- Connection ---

const onConnect = (connection: any) => {
  const sourceParam = connection.sourceHandle?.replace(/^output-/, '')
  const targetParam = connection.targetHandle?.replace(/^input-/, '')

  const sourceNode = nodes.value.find((n: any) => n.id === connection.source)
  const sourceOutput = sourceNode?.data?.outputs?.find((o: any) => o.name === sourceParam)
  const dataType = sourceOutput?.type || ''

  edges.value.push({
    id: `edge-${edgeIdCounter++}`,
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    type: 'ewoDataEdge',
    data: { sourceParam, targetParam, dataType },
  })
}

// --- Selection ---

const onNodeClick = (event: any) => {
  const node = nodes.value.find((n: any) => n.id === event.node.id)
  if (node) {
    selectedNode.value = node
    selectedEdge.value = null
    propertyPanelOpen.value = true
  }
}

const onEdgeClick = (event: any) => {
  const edge = edges.value.find((e: any) => e.id === event.edge.id)
  if (edge) {
    selectedEdge.value = edge
    selectedNode.value = null
    propertyPanelOpen.value = true
  }
}

const updateNode = () => { nodes.value = [...nodes.value] }

const ensureWfCallPolicy = () => {
  if (!selectedNode.value?.data?.wfCall) return
  if (!selectedNode.value.data.wfCall.policy) {
    selectedNode.value.data.wfCall.policy = {}
  }
}

const onBoundaryChange = () => {
  if (selectedNode.value?.data?.wfCall?.boundary === true) {
    ensureWfCallPolicy()
  }
  updateNode()
}

const onPolicyTimeoutChange = (event: Event) => {
  ensureWfCallPolicy()
  const val = (event.target as HTMLInputElement).value
  selectedNode.value!.data.wfCall.policy!.timeoutSec = val ? Number(val) : undefined
  updateNode()
}

const onPolicyRetryMaxChange = (event: Event) => {
  ensureWfCallPolicy()
  const policy = selectedNode.value!.data.wfCall.policy!
  const val = (event.target as HTMLInputElement).value
  if (val) {
    if (!policy.retry) policy.retry = { max: 0, backoffSec: 5 }
    policy.retry.max = Number(val)
  } else if (policy.retry) {
    policy.retry.max = 0
  }
  updateNode()
}

const onPolicyRetryBackoffChange = (event: Event) => {
  ensureWfCallPolicy()
  const policy = selectedNode.value!.data.wfCall.policy!
  const val = (event.target as HTMLInputElement).value
  if (val) {
    if (!policy.retry) policy.retry = { max: 2, backoffSec: 0 }
    policy.retry.backoffSec = Number(val)
  } else if (policy.retry) {
    policy.retry.backoffSec = 0
  }
  updateNode()
}

const onPolicyMaxRecursionDepthChange = (event: Event) => {
  ensureWfCallPolicy()
  const val = (event.target as HTMLInputElement).value
  selectedNode.value!.data.wfCall.policy!.maxRecursionDepth = val ? Number(val) : undefined
  updateNode()
}

const deleteNode = () => {
  if (!selectedNode.value) return
  const id = selectedNode.value.id
  nodes.value = nodes.value.filter(n => n.id !== id)
  edges.value = edges.value.filter(e => e.source !== id && e.target !== id)
  selectedNode.value = null
}

const deleteEdge = () => {
  if (!selectedEdge.value) return
  edges.value = edges.value.filter(e => e.id !== selectedEdge.value.id)
  selectedEdge.value = null
}

// --- Property panel helpers ---

const toggleGuard = () => {
  if (!selectedNode.value) return
  if (selectedNode.value.data.guard !== undefined && selectedNode.value.data.guard !== null) {
    selectedNode.value.data.guard = undefined
  } else {
    selectedNode.value.data.guard = ''
  }
  updateNode()
}

const addInput = () => {
  if (!selectedNode.value?.data.inputs) selectedNode.value.data.inputs = []
  selectedNode.value.data.inputs.push({ name: '', type: 'string' })
  updateNode()
}

const removeInput = (idx: number) => {
  selectedNode.value?.data.inputs?.splice(idx, 1)
  updateNode()
}

const addOutput = () => {
  if (!selectedNode.value?.data.outputs) selectedNode.value.data.outputs = []
  selectedNode.value.data.outputs.push({ name: '' })
  updateNode()
}

const removeOutput = (idx: number) => {
  selectedNode.value?.data.outputs?.splice(idx, 1)
  updateNode()
}

const createLiteralForInput = (input: any) => {
  if (!selectedNode.value) return
  let defaultVal: any = ''
  if (input.type === 'number') defaultVal = 0
  else if (input.type === 'boolean') defaultVal = false
  else if (input.type === 'object') defaultVal = '{}'

  const litNode = {
    id: `node-${nodeIdCounter++}`,
    type: 'ewoLiteral',
    position: {
      x: selectedNode.value.position.x - 200,
      y: selectedNode.value.position.y + (selectedNode.value.data.inputs?.indexOf(input) || 0) * 60,
    },
    data: { value: defaultVal, valueType: input.type || 'string' },
  }
  nodes.value.push(litNode)

  edges.value.push({
    id: `edge-${edgeIdCounter++}`,
    source: litNode.id,
    target: selectedNode.value.id,
    sourceHandle: 'output',
    targetHandle: `input-${input.name}`,
    type: 'ewoDataEdge',
    data: { sourceParam: 'value', targetParam: input.name, dataType: input.type },
  })
}

// --- Toolbar actions ---

const handleNew = () => {
  if (!confirm('Create new workflow? Current work will be lost.')) return
  nodes.value = []
  edges.value = []
  selectedNode.value = null
  selectedEdge.value = null
  wfName.value = ''
  wfVersion.value = '1.0.0'
  wfDescription.value = ''
  nodeIdCounter = 0
  edgeIdCounter = 0
}

const handleLoad = () => {
  fileInput.value?.click()
}

const onFileSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    const json = JSON.parse(text) as EwoJson

    const result = importEwoJson(json)
    nodes.value = result.nodes
    edges.value = result.edges
    wfName.value = result.meta.name || result.meta.id
    wfVersion.value = result.meta.version || '1.0.0'
    wfDescription.value = result.meta.description || ''

    await nextTick()
    setTimeout(() => {
      setViewport(result.viewport)
    }, 100)

    nodeIdCounter = Math.max(...nodes.value.map(n => parseInt(n.id.replace(/\D/g, '')) || 0), 0) + 1
    edgeIdCounter = Math.max(...edges.value.map(e => parseInt(e.id.replace(/\D/g, '')) || 0), 0) + 1

    selectedNode.value = null
    selectedEdge.value = null
    alert(`Loaded: ${wfName.value}\nNodes: ${nodes.value.length}, Edges: ${edges.value.length}`)
  } catch (error) {
    console.error('Failed to load JSON:', error)
    alert('Failed to load JSON file. Check the format.')
  }

  input.value = ''
}

const handleValidate = () => {
  const result = validateEwoWorkflow(nodes.value, edges.value)
  let msg = ''

  if (result.valid) {
    msg = 'Workflow is valid!\n'
    if (result.warnings.length > 0) {
      msg += `\n${result.warnings.length} warning(s):\n`
      result.warnings.forEach((w, i) => { msg += `${i + 1}. [${w.category}] ${w.message}\n` })
    }
    if (result.warnings.length === 0) msg += 'No issues found.'
  } else {
    msg = `Validation failed\n\n${result.errors.length} error(s):\n`
    result.errors.forEach((e, i) => { msg += `${i + 1}. [${e.category}] ${e.message}\n` })
    if (result.warnings.length > 0) {
      msg += `\n${result.warnings.length} warning(s):\n`
      result.warnings.forEach((w, i) => { msg += `${i + 1}. [${w.category}] ${w.message}\n` })
    }
  }

  alert(msg)
}

const handleExport = () => {
  const id = wfName.value || prompt('Enter Workflow ID:', 'MyWorkflow') || 'MyWorkflow'
  const name = wfName.value || id
  const version = wfVersion.value || '1.0.0'

  const viewport = getViewport()
  const json = exportEwoJson(nodes.value, edges.value, viewport, {
    id,
    version,
    name,
    description: wfDescription.value || undefined,
  })

  const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${id}.ewo.json`
  a.click()
  URL.revokeObjectURL(url)
}

const handleExportPng = async () => {
  const flowEl = document.querySelector('.vue-flow') as HTMLElement | null
  if (!flowEl || nodes.value.length === 0) return

  const savedViewport = getViewport()

  try {
    await fitView({ padding: 0.15, duration: 0 })
    await nextTick()
    await new Promise(r => setTimeout(r, 300))

    // html-to-image deep-clones each <svg> via cloneNode(true) and skips
    // CSS inlining for SVG children. Without VueFlow's theme CSS,
    // paths default to fill:black (SVG spec default).
    const saved: { el: Element; attr: string; prev: string | null }[] = []
    const setAttr = (el: Element, attr: string, value: string) => {
      saved.push({ el, attr, prev: el.getAttribute(attr) })
      el.setAttribute(attr, value)
    }

    flowEl.querySelectorAll('.vue-flow__edge-path').forEach(p => {
      setAttr(p, 'fill', 'none')
      if (!p.getAttribute('stroke')) setAttr(p, 'stroke', '#b1b1b7')
      if (!p.getAttribute('stroke-width')) setAttr(p, 'stroke-width', '1')
    })
    flowEl.querySelectorAll('.vue-flow__connection-path').forEach(p => {
      setAttr(p, 'fill', 'none')
    })
    flowEl.querySelectorAll('.vue-flow__edge-interaction').forEach(p => {
      setAttr(p, 'display', 'none')
    })

    const dataUrl = await toPng(flowEl, {
      backgroundColor: '#f9fafb',
      pixelRatio: 2,
      filter: (node: HTMLElement) => {
        const cls = node.classList
        if (!cls) return true
        if (cls.contains('vue-flow__controls')) return false
        if (cls.contains('vue-flow__minimap')) return false
        return true
      },
    })

    saved.forEach(({ el, attr, prev }) => {
      if (prev === null) el.removeAttribute(attr)
      else el.setAttribute(attr, prev)
    })

    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${wfName.value || 'workflow'}.png`
    a.click()
  } catch (err: any) {
    console.error('PNG export failed:', err)
    alert(`PNG export failed:\n\n${err.message}`)
  } finally {
    setViewport(savedViewport)
  }
}

const handleCreateActivity = async (activityData: any) => {
  try {
    const response = await $fetch('/api/workflow-defs/activities', {
      method: 'POST',
      body: {
        name: activityData.name,
        scope: activityData.scope,
        mode: activityData.mode,
        description: activityData.description,
        inputs: activityData.inputs,
        outputs: activityData.outputs,
        code: activityData.mode === 'inline' ? activityData.code : undefined,
      },
    })
    alert(`Activity "${activityData.name}" created!\nFile: ${(response as any).path}`)

    const scanResult = await $fetch('/api/workflow-defs/scan')
    fileSystemActivities.value = (scanResult as any).activities || []
    fileSystemWorkflows.value = (scanResult as any).workflows || []
  } catch (error: any) {
    alert(`Failed to create activity: ${error.data?.message || error.message}`)
  }
}
</script>

<style scoped>
.workflow-canvas {
  background-color: #f9fafb;
}

:deep(.vue-flow__controls-button) {
  width: 32px;
  height: 32px;
  border: 1px solid #e5e7eb;
  background: white;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.vue-flow__controls-button:hover) {
  background: #f3f4f6;
}

:deep(.vue-flow__controls) {
  display: flex !important;
  flex-direction: column !important;
}

:deep(.vue-flow__controls .mode-toggle-button) {
  order: -999 !important;
  border-bottom: 2px solid #e5e7eb !important;
  margin-bottom: 4px !important;
}
</style>
