<script>
  import { createEventDispatcher } from "svelte";

  export let selections = [];
  export let showDebug = false;

  const dispatch = createEventDispatcher();

  function getDisplayText(text) {
    return text.length > 50 ? text.substring(0, 50) + "..." : text;
  }

  function handleClose(index) {
    dispatch("close", index);
  }

  function handleUse(index) {
    dispatch("use", { index, text: selections[index] });
  }

  function toggleDebug() {
    dispatch("toggleDebug");
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      toggleDebug();
    }
  }

  function handleDelete(index) {
    dispatch("delete", index);
  }
</script>

<div class="selection-header">
  {#if selections && selections.length > 0}
    <button
      class="context-count"
      on:click={toggleDebug}
      on:keydown={handleKeyDown}
      aria-label="Toggle context debug view"
    >
      <span class="count-badge">{selections.length}</span>
      <span class="count-label">items in context</span>
      <span class="debug-toggle">{showDebug ? "▼" : "▶"}</span>
    </button>
  {/if}
</div>

{#if selections && selections.length > 0}
  <div class="selections-container">
    {#if showDebug}
      <div class="debug-info">
        <h4>Context Stack ({selections.length} items)</h4>
        <div class="debug-list">
          {#each selections as selection, index (index)}
            <div class="debug-item">
              <span class="debug-index">{index + 1}.</span>
              <span class="debug-text">{selection}</span>
              <button
                class="delete-btn"
                on:click={() => handleDelete(index)}
                aria-label="Delete context item"
              >
                ×
              </button>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .selection-header {
    width: 90%;
    max-width: 600px;
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0.25rem;
  }

  .context-count {
    display: flex;
    align-items: center;
    font-size: 0.8rem;
    color: #666;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 1rem;
    background-color: #f0f0f0;
    border: none;
  }

  .context-count:hover {
    background-color: #e0e0e0;
  }

  .count-badge {
    background-color: #666;
    color: white;
    border-radius: 50%;
    width: 1.2rem;
    height: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 0.25rem;
    font-weight: bold;
  }

  .count-label {
    margin-right: 0.25rem;
  }

  .debug-toggle {
    font-size: 0.7rem;
  }

  .debug-info {
    background-color: #f9f9f9;
    border: 1px solid #e0e0e0;
    border-radius: 0.5rem;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.8rem;
    width: 100%;
  }

  .debug-info h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    color: #666;
  }

  .debug-list {
    max-height: 150px;
    overflow-y: auto;
  }

  .debug-item {
    display: flex;
    padding: 0.25rem 0;
    border-bottom: 1px solid #eee;
    position: relative;
    align-items: center;
  }

  .debug-item:last-child {
    border-bottom: none;
  }

  .debug-index {
    width: 1.5rem;
    color: #999;
  }

  .debug-text {
    flex: 1;
    word-break: break-word;
    padding-right: 1.5rem;
  }

  .delete-btn {
    position: absolute;
    right: 0.25rem;
    width: 1.2rem;
    height: 1.2rem;
    border-radius: 50%;
    background-color: #e0e0e0;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    line-height: 1;
    color: #666;
    padding: 0;
  }

  .delete-btn:hover {
    background-color: #ccc;
  }

  .selections-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 90%;
    max-width: 600px;
    margin-bottom: 0.75rem;
  }

  .selection-tab {
    display: flex;
    align-items: center;
    background-color: white;
    border-radius: 1rem;
    padding: 0.5rem 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e0e0e0;
    position: relative;
  }

  @keyframes flash {
    0% {
      background-color: #f0f7ff;
    }
    50% {
      background-color: #d0e8ff;
    }
    100% {
      background-color: white;
    }
  }

  .flash {
    animation: flash 1s ease-out;
  }

  .quote-icon {
    font-size: 1.5rem;
    line-height: 1;
    color: #666;
    margin-right: 0.5rem;
    flex-shrink: 0;
  }

  .selection-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.9rem;
    color: #4a4a4a;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: 0.5rem;
    flex-shrink: 0;
  }

  .use-btn {
    background-color: #666;
    color: white;
    border: none;
    border-radius: 1rem;
    padding: 0.25rem 0.75rem;
    font-size: 0.8rem;
    cursor: pointer;
  }

  .close-btn {
    background: none;
    border: none;
    color: #999;
    font-size: 1.2rem;
    line-height: 1;
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
