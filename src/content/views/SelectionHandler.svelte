<script>
  import { onMount, onDestroy } from "svelte";

  let selectionPopupVisible = false;
  let popupPosition = { x: 0, y: 0 };
  let selectedText = "";

  onMount(() => {
    document.addEventListener("mouseup", handleTextSelection);
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
      document.removeEventListener("click", handleClickOutside);
    };
  });

  function handleTextSelection(event) {
    const selection = window.getSelection();
    selectedText = selection.toString().trim();

    if (selectedText && selectedText.length > 0) {
      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Ensure the popup is within viewport bounds
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let x = rect.left + rect.width / 2;
        let y = rect.top - 10;

        // Adjust horizontal position if popup would go off-screen
        if (x < 100) x = 100;
        if (x > viewportWidth - 100) x = viewportWidth - 100;

        // Adjust vertical position if popup would go off-screen
        if (y < 50) y = rect.bottom + 10;

        popupPosition = { x, y };

        setTimeout(() => {
          selectionPopupVisible = true;
        }, 10);
      } catch (error) {
        console.error("Error handling text selection:", error);
        hideSelectionPopup();
      }
    } else {
      hideSelectionPopup();
    }
  }

  function handleClickOutside(event) {
    if (
      !event.target.closest(".web-selection-popup") &&
      selectionPopupVisible
    ) {
      hideSelectionPopup();
    }
  }

  function hideSelectionPopup() {
    selectionPopupVisible = false;
  }

  function handleAskClick() {
    chrome.runtime.sendMessage({
      action: "askQuestion",
      text: selectedText,
    });

    hideSelectionPopup();
  }

  function handleAddToContextClick() {
    const highlightManager = window["askonwebHighlightManager"];
    if (
      highlightManager &&
      typeof highlightManager.addHighlight === "function"
    ) {
      const highlightId = highlightManager.addHighlight(selectedText);

      chrome.runtime.sendMessage({
        action: "addToContext",
        text: selectedText,
        highlightId: highlightId,
      });
    } else {
      // Fallback
      chrome.runtime.sendMessage({
        action: "addToContext",
        text: selectedText,
      });
    }

    hideSelectionPopup();
  }
</script>

{#if selectionPopupVisible}
  <div
    class="web-selection-popup"
    style="top: {popupPosition.y}px; left: {popupPosition.x}px"
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
  .web-selection-popup {
    position: fixed;
    background-color: white;
    border-radius: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    padding: 4px;
    transform: translate(-50%, -100%);
    z-index: 2147483647; /* Maximum z-index to ensure it's on top */
    pointer-events: auto;
    font-family:
      "Jost",
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
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
    font-family: inherit;
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
