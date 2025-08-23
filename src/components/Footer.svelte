<script>
  import { createEventDispatcher } from "svelte";
  import SelectionTab from "./SelectionTab.svelte";
  import { contextStack } from "@/store.js";

  const dispatch = createEventDispatcher();
  let question = "";
  let showDebug = false;

  export function setQuestion(text) {
    if (text && text.trim()) {
      question = text.trim();
    }
  }

  function handleSubmit() {
    if (question.trim()) {
      dispatch("send", question);
      question = "";
    }
  }

  function handleUseSelection(event) {
    const { index, text } = event.detail;

    if (!question) {
      question = text;
    } else {
      question = question + " " + text;
    }

    contextStack.remove(index);
  }

  function handleCloseSelection(event) {
    const index = event.detail;
    contextStack.remove(index);
  }

  function handleDeleteSelection(event) {
    const index = event.detail;
    contextStack.remove(index);
  }

  function toggleDebug() {
    showDebug = !showDebug;
  }
</script>

<div class="footer-container">
  <SelectionTab
    selections={$contextStack.map((item) => item.text)}
    {showDebug}
    on:use={handleUseSelection}
    on:close={handleCloseSelection}
    on:delete={handleDeleteSelection}
    on:toggleDebug={toggleDebug}
  />

  <div class="question-input-container">
    <input
      type="text"
      placeholder="Ask a question"
      bind:value={question}
      on:keydown={(e) => e.key === "Enter" && handleSubmit()}
    />
    <button on:click={handleSubmit} aria-label="Send message">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="20px"
        viewBox="0 -960 960 960"
        width="20px"
        fill="#FFFFFF"
        ><path
          d="M630-444H192v-72h438L429-717l51-51 288 288-288 288-51-51 201-201Z"
        /></svg
      >
    </button>
  </div>
</div>

<style>
  .footer-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    background-color: rgba(249, 249, 249, 0.95);
    border-top: 1px solid #e0e0e0;
    padding: 0.5rem 0 1.5rem 0;
    z-index: 10;
  }

  .question-input-container {
    width: 90%;
    max-width: 460px;
    display: flex;
    border-radius: 2rem;
    border: 1px solid #e0e0e0;
    padding: 0.5rem;
    background-color: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }

  input {
    flex: 1;
    border: none;
    outline: none;
    padding: 0.75rem 1rem;
    font-size: 1rem;
  }

  button {
    padding: 0 1rem;
    background-color: #666;
    color: white;
    border: none;
    border-radius: 2rem;
    cursor: pointer;
  }
</style>
