<script>
  import Logo from "@/assets/crx.svg";
  import SelectionHandler from "./SelectionHandler.svelte";

  let show = $state(false);
</script>

<SelectionHandler />

<div class="popup-container">
  <div
    class="popup-content"
    class:opacity-100={show}
    class:opacity-0={!show}
    style="display: {show ? 'block' : 'none'}"
  >
    <h1>AskOnWeb</h1>
    <p>Highlight text on any webpage to ask questions!</p>
  </div>
  <button
    class="toggle-button"
    onclick={() => (show = !show)}
    aria-label="Toggle AskOnWeb"
  >
    <img src={Logo} alt="AskOnWeb logo" class="button-icon" />
  </button>
</div>

<style>
  .popup-container {
    position: fixed;
    right: 0;
    bottom: 0;
    margin: 1.25rem;
    z-index: 100;
    display: flex;
    align-items: flex-end;
    font-family: "Jost", system-ui, sans-serif;
    user-select: none;
    line-height: 1em;
  }

  .popup-content {
    background-color: white;
    color: #4a4a4a;
    border-radius: 0.5rem;
    box-shadow:
      0 4px 6px -1px rgb(0 0 0 / 0.1),
      0 2px 4px -2px rgb(0 0 0 / 0.1);
    width: max-content;
    height: min-content;
    padding: 0.5rem 1rem;
    margin: auto 0.5rem 0 0;
    transition: opacity 300ms;
  }

  .opacity-100 {
    opacity: 1;
  }

  .opacity-0 {
    opacity: 0;
  }

  .toggle-button {
    display: flex;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 9999px;
    box-shadow:
      0 1px 3px 0 rgb(0 0 0 / 0.1),
      0 1px 2px -1px rgb(0 0 0 / 0.1);
    cursor: pointer;
    border: none;
    background-color: #666666;
  }

  .toggle-button:hover {
    background-color: #4a4a4a;
  }

  .button-icon {
    padding: 4px;
  }

  h1 {
    font-size: 1.2rem;
    margin: 0.5rem 0;
  }

  p {
    font-size: 0.9rem;
    margin: 0.5rem 0;
  }

  :global(.askonweb-highlight) {
    background-color: #3b82f6 !important;
    color: inherit !important;
    border-radius: 2px !important;
    padding: 1px 2px !important;
    margin: 0 1px !important;
    display: inline !important;
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2) !important;
    transition: background-color 0.2s ease !important;
  }

  :global(.askonweb-highlight:hover) {
    background-color: #2563eb !important;
  }
</style>
