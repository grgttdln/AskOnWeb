<script>
  import { onMount } from "svelte";
  import Header from "@/components/Header.svelte";
  import Content from "@/components/Content.svelte";
  import Footer from "@/components/Footer.svelte";
  import SelectionPopup from "@/components/SelectionPopup.svelte";
  import { contextStack, queryStack } from "@/store.js";

  let popupVisible = false;
  let popupPosition = { x: 0, y: 0 };
  let selectedText = "";
  let questionInput;

  onMount(() => {
    document.addEventListener("mouseup", handleTextSelection);
    document.addEventListener("click", handleClickOutside);

    contextStack.load();
    queryStack.load();

    // Check if there are stored temporary selections from web pages
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(
        ["tempSelections", "tempTimestamp"],
        (result) => {
          if (
            result.tempSelections &&
            result.tempSelections.length > 0 &&
            result.tempTimestamp
          ) {
            const now = Date.now();
            if (now - result.tempTimestamp < 30000) {
              result.tempSelections.forEach((text) => {
                contextStack.add(text);
              });

              chrome.storage.local.remove(["tempSelections", "tempTimestamp"]);
            }
          }
        }
      );
    }

    // Listen for real-time updates from background script
    if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "selectionAdded" && message.selection) {
          // Reload context to ensure we have the latest data
          contextStack.load();
        }
      });

      // Create a connection to the background script to keep it aware of the popup
      const port = chrome.runtime.connect({ name: "popup" });
    }

    return () => {
      // Clean up event listeners
      document.removeEventListener("mouseup", handleTextSelection);
      document.removeEventListener("click", handleClickOutside);
    };
  });

  function handleTextSelection(event) {
    const selection = window.getSelection();
    selectedText = selection.toString().trim();

    if (selectedText) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      popupPosition = {
        x: rect.left + rect.width / 2,
        y: rect.top,
      };

      setTimeout(() => {
        popupVisible = true;
      }, 10);
    } else {
      hideSelectionPopup();
    }
  }

  function handleClickOutside(event) {
    if (!event.target.closest(".selection-popup") && popupVisible) {
      hideSelectionPopup();
    }
  }

  function hideSelectionPopup() {
    popupVisible = false;
  }

  function handleSelectionAsk() {
    if (selectedText) {
      queryStack.add(selectedText);

      if (questionInput) {
        questionInput.setQuestion(selectedText);
      }

      hideSelectionPopup();
    }
  }

  function handleSelectionAddToContext() {
    if (selectedText) {
      // Add to context stack (highlight will be handled by content script)
      contextStack.add(selectedText);
      hideSelectionPopup();
    }
  }

  function handleSendMessage(event) {
    const question = event.detail;

    queryStack.add(question);

    setTimeout(() => {
      console.log(`Received query: ${question}`);
    }, 1000);
  }
</script>

<div class="app-container">
  <Header />
  <Content />
  <Footer on:send={handleSendMessage} bind:this={questionInput} />
  <SelectionPopup
    visible={popupVisible}
    position={popupPosition}
    on:ask={handleSelectionAsk}
    on:addToContext={handleSelectionAddToContext}
  />
</div>

<style>
  .app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    min-height: 600px;
    width: 500px;
    max-width: 500px;
    margin: 0;
    padding: 0;
    background-color: #f9f9f9;
    color: #4a4a4a;
    position: relative;
    font-family: "Jost", sans-serif;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: "Jost", sans-serif;
    display: block;
    width: 500px;
    min-height: 100vh;
    background-color: #f9f9f9;
    overflow-x: hidden;
  }

  :global(#app) {
    width: 500px;
    height: 100vh;
    min-height: 600px;
    margin: 0;
    padding: 0;
    text-align: left;
    overflow: hidden;
  }
</style>
