<script>
  import Radio from "./components/Radio.svelte";
  import CInput from "./components/CInput.svelte";
  import Chip from "./components/Chip.svelte";
  import Spinner from "./components/Spinner.svelte";
  import FoodCard from "./components/FoodCard.svelte";
  import SkeletonFoodCard from "./components/SkeletonFoodCard.svelte";
  import Modal from "./components/Modal.svelte";

  import { customIngridients, customMainIngridients } from "./store";
  import mockData from "../mockData";
  if ("serviceWorker" in navigator) {
    console.log(navigator);
    navigator.serviceWorker.register("/service-worker.js");
  }
  const isInWebAppiOS = window.navigator.standalone == true;
  isInWebAppiOS ? (document.body.className = "standalone") : "";

  let showModal = true;
  let loading = false;
  let searched = false;
  let recipesStepsLoading = true;
  let modalRecipe = [];
  let fetchedRecipes = [];
  let removedStringArray = [];
  let instructions = [];
  let group = "";
  let href = "";
  let title = "";
  let mealOptions = [
    {
      value: "865150284",
      text: "Huvudrätt",
    },
    {
      value: "1089312893",
      text: "förrätt",
    },
    {
      value: "3247760446",
      text: "frukost",
    },
    {
      value: "4278008420",
      text: "efterrätt",
    },
  ];

  function getRecipeId(event) {
    const id = event.detail.id;
    showModal = event.detail.showModal;
    modalRecipe = mockData.filter((e) => e.Id === id);
    removedStringArray = event.detail.removedStringArray;
    href = event.detail.href;
    title = event.detail.title;
    getRecipesSteps(href);
  }
  const getRecipes = async () => {
    loading = true;
    searched = true;
    let searchIng = $customIngridients
      .map((item) => item.ingredientId)
      .join(",");
    let mainIngridient = $customMainIngridients.map(
      (item) => item.ingredientId
    );
    var proxyUrl = process.env.PROXY_URL,
      url = `${process.env.API_URL}${mainIngridient}/${searchIng}?categoryid=${group}&skip=0&take=20`;

    try {
      let response = await fetch(proxyUrl + url, { mode: "cors" });
      let data = await response.json();
      if (Object.keys(data).length === 0) {
        fetchedRecipes = [];
      } else {
        fetchedRecipes = data;
      }
    } catch (e) {
      console.log(e);
      searched = false;
    }
    loading = false;
  };

  const getRecipesSteps = async (href) => {
    showModal = true;
    var proxyUrl = process.env.PROXY_URL,
      url = href;
    try {
      recipesStepsLoading = true;
      let response = await fetch(proxyUrl + url);
      let data = await response.text();
      var parser = new DOMParser();
      var doc = parser.parseFromString(data, "text/html");
      let node = doc.querySelector(".c-recipe__instructions-steps");
      let text = node.firstChild.nextSibling.dataset.model;
      let parseResult = JSON.parse(text);
      instructions = parseResult.sections[0].steps;
    } catch (e) {
      throw e;
    }
    recipesStepsLoading = false;
  };
</script>
<main>
  <section id="left">
    <div class="wrapper">
      {#if !searched}
      <h2 class="mobile-only">Vad vill du laga?</h2>
      {/if}
      <h2 class="desktop-only">Vad vill du laga?</h2>
      <div
        class="radio-group {searched ? 'searched' : ''}"
        style="--color: var(--primary-4);"
      >
        <Radio { mealOptions } bind:group></Radio>
      </div>
      {#if group !== "" && $customMainIngridients.length < 1}
      <h3>Välj huvudingrediens</h3>
      <CInput mainIngridients></CInput>
      {/if} {#if group !== "" && $customMainIngridients.length > 0}
      <h3>Lägg till fler ingredienser</h3>
      <CInput></CInput>
      <button
        class="btn"
        on:click="{getRecipes}"
        style="
          align-self: flex-start;
          margin: 0 auto;
          display: block;
          margin-bottom: 15px;
        "
      >
        Hitta recept
      </button>
      <div class="chip-wrapper">
        {#each $customMainIngridients as {name,id} (id)}
        <Chip {name} {id} color="#f44336"></Chip>
        {/each} {#each $customIngridients as {name,id} (id)}
        <Chip {name} {id} color="#23c4f8"></Chip>
        {/each}
      </div>
      {/if}
    </div>
  </section>

  {#if !searched}
  <section id="start">
    <h1>Välj vilken typ av rätt du vill laga och lägg till ingredienser</h1>
  </section>
  {:else}
  <section id="recipes" class="{showModal ? 'modal-open' : ''}">
    {#if loading}
    <SkeletonFoodCard></SkeletonFoodCard>
    <SkeletonFoodCard></SkeletonFoodCard>
    <SkeletonFoodCard></SkeletonFoodCard>
    <SkeletonFoodCard></SkeletonFoodCard>
    <SkeletonFoodCard></SkeletonFoodCard>
    {:else} {#each fetchedRecipes as {Name, ImageUrl, Url, Ingredients, Id}}
    <FoodCard
      title="{Name}"
      thumbnail="{ImageUrl}"
      href="{Url}"
      ingredients="{Ingredients}"
      id="{Id}"
      on:recipeId="{getRecipeId}"
    ></FoodCard>
    {/each} {/if} {#if !isInWebAppiOS}
    <div style="height: 100px;"></div>
    {/if}
  </section>

  {/if} {#if showModal}
  <Modal on:close="{() => showModal = false}">
    <h3 class="recipe-title {isInWebAppiOS ? 'standalone' : ''}">{title}</h3>
    <ul class="ingredients">
      {#each removedStringArray as {Name, Amount}}
      <li>
        <span>{Name}</span>
        <span>{Amount}</span>
      </li>
      {/each}
    </ul>
    {#if recipesStepsLoading}
    <h3 class="loading-title" style="text-align: center;">
      Laddar recept steg...
    </h3>
    <Spinner></Spinner>
    {:else}
    <h3 class="instructions-title" style="text-align: left;">Gör så här</h3>
    <ol class="instructions">
      {#each instructions as {text}}
      <li>
        <span class="instructions">
          {text}
        </span>
      </li>
      {/each}
    </ol>
    {/if}
    <ol class="instructions">
      <li>
        <span class="instructions">
          asdf
        </span>
      </li>
    </ol>
  </Modal>
  {/if}
</main>

<style>
  .instructions-title {
    color: var(--instructions-color);
  }
  .loading-title {
    color: var(--instructions-color);
  }
  .recipe-title {
    color: var(--instructions-color);
  }
  h3.standalone {
    margin-top: 45px;
  }
  .desktop-only {
    display: none;
  }
  @media only screen and (min-width: 1280px) {
    .desktop-only {
      display: block;
      text-align: center;
    }
  }
  .mobile-only {
    text-align: center;
  }
  @media only screen and (min-width: 1280px) {
    .mobile-only {
      display: none;
    }
  }
  .instructions {
    margin: 0;
    text-indent: -20px;
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
    color: inherit;
  }

  .instructions li {
    margin-top: 10px;
    color: var(--instructions-color);
  }

  .instructions li span {
    font-size: 18px;
    line-height: 1.5;
    color: var(--instructions-color);
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
    background-color: var(--color-odd);
    color: var(--instructions-color);
  }
  .ingredients > li:nth-child(even) {
    background-color: var(--color-even);
  }
  .wrapper {
    max-width: 380px;
    margin: 0 auto;
  }

  .chip-wrapper {
    max-height: 105px;
    overflow: scroll;
  }
  @media (min-width: 1281px) {
    .chip-wrapper {
      max-height: none;
      min-height: unset;
      overflow: unset;
    }
  }
  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 0 15px;
  }
  @media (min-width: 1281px) {
    main {
      padding: 0;
      flex-direction: row;
    }
  }

  h1 {
    font-size: 1.5em;
    text-align: center;
    line-height: 30px;
  }

  @media (min-width: 1281px) {
    h1 {
      font-size: 35px;
      text-align: center;
    }
  }

  .radio-group {
    --color: var(--primary-1);
    --border-width: 2px;
    display: -webkit-box;
    display: flex;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 20px;
  }
  .radio-group.searched {
    margin-top: 20px;
  }
  #start {
    order: -1;
  }
  @media (min-width: 1281px) {
    #start {
      margin-top: 30vh;
      width: 60%;
      order: 0;
    }
  }
  #recipes {
    margin-top: 0;
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 10px;
    grid-auto-rows: minmax(min-content, max-content);
    padding: 20px;
    overflow-y: scroll;
    height: auto;
    -webkit-overflow-scrolling: touch;
    margin-bottom: env(safe-area-inset-bottom);
  }
  #recipes.modal-open {
    overflow: hidden;
  }
  @media only screen and (min-device-width: 768px) and (max-device-width: 1024px) and (orientation: landscape) {
    #recipes {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  @media only screen and (min-device-width: 768px) and (max-device-width: 1024px) and (orientation: portrait) {
    #recipes {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (min-width: 1281px) {
    #recipes {
      width: calc(60% - 40px);
      grid-template-columns: repeat(3, 1fr);
      height: calc(100vh - 40px);
    }
  }

  #left {
    margin-bottom: 20px;
    position: relative;
  }
  #left:after {
    content: "";
    height: 30px;
    width: 100%;
    position: absolute;
    bottom: -37px;
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    z-index: 9;
  }
  @media (min-width: 1081px) {
    #left {
      padding-top: 30vh;
      width: 40%;
      height: 100vh;
      border-right: 1px solid var(--border);
    }
  }
  .btn {
    --color: var(--primary-3);
    --text: #fff;
    display: inline-block;
    text-align: center;
    vertical-align: middle;
    touch-action: manipulation;
    position: relative;
    white-space: nowrap;
    border: none;
    color: var(--text);
    padding: 9px 24px;
    font-size: 14px;
    line-height: 22px;
    font-weight: 600;
    background: var(--color);
    border-radius: 6px;
    text-decoration: none;
    transition: all 0.3s ease;
  }
</style>
