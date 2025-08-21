<script>
  import { afterUpdate } from "svelte";
  export let messages = [];
  let contentContainer;

  afterUpdate(() => {
    if (contentContainer) {
      contentContainer.scrollTo({
        top: contentContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  });
</script>

<div class="content-container" bind:this={contentContainer}>
  {#if messages.length === 0}
    <div class="empty-state">
      <p>No messages yet</p>
    </div>
  {:else}
    {#each messages as message, i}
      <div
        class="message {message.type} {i === messages.length - 1
          ? 'last-message'
          : ''}"
      >
        <p>{message.text}</p>
      </div>
    {/each}
    <div class="spacer"></div>
  {/if}
</div>

<style>
  .content-container {
    flex: 1;
    width: 100%;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background-color: #f9f9f9;
    height: calc(100vh - 130px);
  }

  .empty-state {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #9ca3af;
    min-height: 400px;
  }

  .message {
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    max-width: 80%;
    font-family: "Jost", sans-serif;
  }

  .message.user {
    align-self: flex-end;
    background-color: #666666;
    color: white;
  }

  .message.bot {
    align-self: flex-start;
    background-color: white;
    color: #4a4a4a;
    border: 1px solid #e0e0e0;
  }

  .last-message {
    margin-bottom: 1rem;
  }

  .spacer {
    height: 4rem;
    width: 100%;
    flex-shrink: 0;
  }

  p {
    margin: 0;
  }
</style>
