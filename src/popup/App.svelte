<script>
  import Header from "@/components/Header.svelte";
  import Content from "@/components/Content.svelte";
  import QuestionInput from "@/components/QuestionInput.svelte";

  let messages = [];

  function handleQuestionSubmit(event) {
    const question = event.detail;
    messages = [...messages, { type: "user", text: question }];

    // TODO: Implement the API call
    setTimeout(() => {
      messages = [...messages, { type: "bot", text: `You asked: ${question}` }];
    }, 1000);
  }
</script>

<div class="app-container">
  <Header />
  <Content {messages} />
  <QuestionInput on:submit={handleQuestionSubmit} />
</div>

<style>
  .app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    min-height: 700px;
    width: 100%;
    max-width: 100%;
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
    min-width: 320px;
    min-height: 100vh;
    background-color: #f9f9f9;
  }

  :global(#app) {
    width: 100%;
    height: 100vh;
    min-height: 700px;
    margin: 0;
    padding: 0;
    max-width: 100%;
    text-align: left;
  }
</style>
