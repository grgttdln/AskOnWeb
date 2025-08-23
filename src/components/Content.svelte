<script>
  import { afterUpdate } from "svelte";
  import { contextStack, queryStack, responseStack } from "@/store.js";

  let contentContainer;

  afterUpdate(() => {
    if (contentContainer) {
      contentContainer.scrollTo({
        top: contentContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  });

  function formatTime(timestamp) {
    if (!timestamp) return "";
    if (typeof timestamp === "string") return timestamp;

    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  }
</script>

<div class="content-container" bind:this={contentContainer}>
  {#if $contextStack.length === 0 && $queryStack.length === 0 && $responseStack.length === 0}
    <div class="empty-state">
      <p>No context or queries yet</p>
      <div class="sample-text">
        <p>
          Try highlighting this text to see the selection feature in action.
        </p>
        <p>You can select any text on this page and a popup will appear.</p>
      </div>
    </div>
  {:else}
    {#if $queryStack.length > 0}
      <div class="query-container">
        {#each $queryStack as query, i}
          <div class="query-item">
            <div class="query-text">{query.text}</div>
            <div class="timestamp">{query.time}</div>
          </div>
        {/each}
      </div>
    {/if}

    {#if $responseStack.length > 0}
      <div class="section-header"></div>
      <div class="qa-container">
        {#each $responseStack as r}
          <div class="qa-item">
            <div class="query-bubble">
              <div class="query-text">{r.query}</div>
              <div class="timestamp">{formatTime(r.timestamp)}</div>
            </div>
            <div class="response-bubble">
              <div class="response-text">{r.answer}</div>
              <div class="timestamp">{formatTime(r.timestamp)}</div>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <div class="spacer"></div>
  {/if}
</div>

<style>
  .content-container {
    flex: 1;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background-color: #f9f9f9;
    height: calc(100vh - 140px);
    user-select: text;
  }

  .section-header {
    margin: 0.5rem 0;
    padding: 0.5rem 0;
    border-bottom: 1px solid #e0e0e0;
  }

  .section-header h3 {
    font-size: 1rem;
    font-weight: 500;
    color: #666;
    margin: 0;
  }

  .query-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    margin-bottom: 1rem;
  }

  .query-item {
    background-color: #f0f0f0;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-family: "Jost", sans-serif;
    position: relative;
    align-self: flex-end;
    max-width: 80%;
  }

  .query-text {
    word-break: break-word;
    color: #666;
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #9ca3af;
    min-height: 400px;
    gap: 2rem;
  }

  .sample-text {
    max-width: 80%;
    text-align: center;
    background-color: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e0e0e0;
    color: #4a4a4a;
  }

  .sample-text p {
    margin-bottom: 1rem;
  }

  .sample-text p:last-child {
    margin-bottom: 0;
  }

  .timestamp {
    font-size: 0.7rem;
    opacity: 0.7;
    margin-top: 0.3rem;
    text-align: right;
    color: #666;
  }

  .qa-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    margin-bottom: 1rem;
  }

  .qa-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .query-bubble {
    background-color: #f0f0f0;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    align-self: flex-end;
    max-width: 80%;
  }

  .response-bubble {
    background-color: #f0f0f0;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    align-self: flex-start;
    max-width: 70%;
  }

  .spacer {
    height: 4rem;
    width: 100%;
    flex-shrink: 0;
  }

  p {
    margin: 0;
    word-break: break-word;
  }
</style>
