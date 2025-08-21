<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  let question = '';

  function handleSubmit() {
    if (question.trim()) {
      dispatch('submit', question);
      question = '';
    }
  }
</script>

<div class="question-input-container">
  <input 
    type="text"
    placeholder="Ask a question"
    bind:value={question}
    on:keydown={(e) => e.key === 'Enter' && handleSubmit()}
  />
  <button on:click={handleSubmit}><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FFFFFF"><path d="M630-444H192v-72h438L429-717l51-51 288 288-288 288-51-51 201-201Z"/></svg></button>
</div>

<style>
  .question-input-container {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 600px;
    display: flex;
    border-radius: 2rem;
    border: 1px solid #E0E0E0;
    padding: 0.5rem;
    background-color: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
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
