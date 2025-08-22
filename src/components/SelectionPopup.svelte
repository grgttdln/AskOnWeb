<script>
  import { createEventDispatcher } from "svelte";

  export let position = { x: 0, y: 0 };
  export let visible = false;

  const dispatch = createEventDispatcher();

  function handleAskClick() {
    dispatch("ask");
  }

  function handleAddToContextClick() {
    dispatch("addToContext");
  }
</script>

{#if visible}
  <div
    class="selection-popup"
    style="top: {position.y}px; left: {position.x}px"
  >
    <div class="popup-buttons">
      <button on:click={handleAskClick} class="ask-button">
        <span class="quote-icon">❞</span> Ask On Web
      </button>
      <button on:click={handleAddToContextClick} class="context-button">
        <span class="plus-icon">+</span> Add to Context
      </button>
    </div>
  </div>
{/if}

<style>
  .selection-popup {
    position: fixed;
    background-color: white;
    border-radius: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    padding: 4px;
    transform: translate(-50%, -100%);
    margin-top: -10px;
    z-index: 10000;
    pointer-events: auto;
  }

  .popup-buttons {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  button {
    display: flex;
    align-items: center;
    gap: 6px;
    background-color: white;
    color: #333;
    border: 1px solid #e0e0e0;
    border-radius: 20px;
    padding: 6px 12px;
    font-family: "Jost", sans-serif;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
    white-space: nowrap;
  }

  button:hover {
    background-color: #f5f5f5;
  }

  .ask-button {
    background-color: white;
  }

  .context-button {
    background-color: #f9f9f9;
  }

  .quote-icon {
    font-size: 18px;
    line-height: 1;
  }

  .plus-icon {
    font-size: 16px;
    line-height: 1;
    font-weight: bold;
  }
</style>
