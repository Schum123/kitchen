<script>
  import Modal from "./Modal.svelte";
  import { customIngridients } from "../store";

  export let title;
  export let thumbnail;
  export let ingredients;
  export let href;
  let instructions = [];
  let showModal = false;
  let availableIngredients = ingredients.filter((e) => e.Selected);
  let removedStringArray = ingredients.map(function (d) {
    return { Name: d.Name.replace(/Arla Köket|Arla/g, ""), Amount: d.Amount };
  });

  const getRecipes = async () => {
    showModal = true;
    let searchIng = $customIngridients
      .map((item) => item.ingredientId)
      .join(",");
    var proxyUrl = "https://cors-anywhere.herokuapp.com/",
      url = href;

    let response = await fetch(proxyUrl + url);

    let data = await response.text();
    var parser = new DOMParser();
    var doc = parser.parseFromString(data, "text/html");
    let node = doc.querySelector(".c-recipe__instructions-steps");
    let text = node.firstChild.nextSibling.dataset.model;
    let parseResult = JSON.parse(text);
    instructions = parseResult.sections[0].steps;
  };
</script>

<article data-url="{href}">
  <span class="available">
    du har { availableIngredients.length } av {ingredients.length} ingredienser
  </span>
  <h2>{title}</h2>
  <div class="img-wrapper">
    <img src="{thumbnail}" height="190" />
  </div>
  <span on:click="{getRecipes}">Visa alla ingredienser</span>
  <!-- <small><a href="{href}" target="_blank">Länk till recept</a></small> -->
</article>

{#if showModal}
<Modal on:close="{() => showModal = false}">
  <h3>{title}</h3>
  <ul class="ingredients">
    {#each removedStringArray as {Name, Amount}}
    <li>
      <span>{Name}</span>
      <span>{Amount}</span>
    </li>
    {/each}
  </ul>
  <h3 style="text-align: left;">Gör så här</h3>
  <ol class="instructions">
    {#each instructions as {text}}
    <li>
      <span class="instructions">
        {text}
      </span>
    </li>
    {/each}
  </ol>
</Modal>
{/if}

<style>
  .modal {
  }
  .instructions {
    margin: 0;
    text-indent: -24px;
    list-style-type: none;
    counter-increment: item;
    text-align: left;
  }
  .instructions li:before {
    display: inline-block;
    width: 1em;
    padding-right: 0.5em;
    font-weight: bold;
    text-align: right;
    content: counter(item) ".";
  }

  .instructions li {
    margin-top: 10px;
  }

  .instructions li span {
    font-size: 18px;
    line-height: 1.5;
  }
  .available {
    margin-bottom: 8px;
  }
  article {
    padding: 24px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--shadow);
    border: 1px solid var(--border);
    display: flex;
    flex-direction: column;
  }
  .img-wrapper {
    position: relative;
    height: 0;
    padding-top: 61%;
    overflow: hidden;
    margin-bottom: 8px;
  }
  img {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
  h2 {
    font-family: "Encode Sans";
    font-weight: 700;
    font-size: 18px;
    color: var(--text-color-headline);
    margin: 0 0 16px 0;
  }

  small {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-color);
    text-decoration: none;
  }
  a {
    text-decoration: none;
    display: flex;
    flex-direction: column;
  }
  article:last-child {
    margin-bottom: 20px;
  }
  ol,
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    margin-bottom: 10px;
  }
  ol {
    margin-left: 20px !important;
    margin-bottom: 20px !important;
  }
  .ingredients > li {
    padding: 0.5rem;
    text-align: left;
  }
  .ingredients > li:nth-child(odd) {
    background-color: #f5f9ff;
  }
  .ingredients > li:nth-child(even) {
    background-color: var(--border);
  }
</style>
