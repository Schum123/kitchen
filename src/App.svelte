<script>
  import ComponentIngredients from "./components/Ingredients.svelte";
  import Radio from "./components/Radio.svelte";
  import CInput from "./components/CInput.svelte";
  import Chip from "./components/Chip.svelte";
  import Spinner from "./components/Spinner.svelte";
  import FoodCard from "./components/FoodCard.svelte";
  import SkeletonFoodCard from "./components/SkeletonFoodCard.svelte";
  import Modal from "./components/Modal.svelte";
  import FavoriteList from "./components/FavoritesList.svelte";

  import {
    customIngridients,
    customMainIngridients,
    fetchedRecepies,
  } from "./store";
  import mockData from "../mockData";
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js");
  }
  const isInWebAppiOS = window.navigator.standalone == true;
  isInWebAppiOS ? (document.body.className = "standalone") : "";
  let ShowFavoriteList = false;
  let showModal = false;
  let loading = false;
  let searched = false;
  let recipesStepsLoading = true;
  let modalRecipe = [];
  let fetchedRecipes = [];
  let removedStringArray = [];
  let instructions = [];
  let href = "";
  let title = "";

  function getRecipeId(event) {
    const id = event.detail.id;
    showModal = event.detail.showModal;
    removedStringArray = event.detail.removedStringArray;
    href = event.detail.href;
    title = event.detail.title;
    getRecipesSteps(href);
    modalRecipe = {
      id: event.detail.id,
      title: event.detail.title,
      href: event.detail.href,
      removedStringArray: event.detail.removedStringArray,
    };
  }

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

  const addToFavorites = () => {
    var request = self.indexedDB.open("FAVORITES_DB", 1);
    const product = modalRecipe;
    product.instructions = instructions;
    console.log(product);
    request.onsuccess = function (event) {
      var db = event.target.result;

      var transaction = db.transaction("products", "readwrite");
      alert(transaction);

      // add success event handleer for transaction
      // you should also add onerror, onabort event handlers
      transaction.onsuccess = function (event) {
        alert("success")
        console.log("[Transaction] ALL DONE!");
      };
      var productsStore = transaction.objectStore("products");
      //Add recipe to favorites

      // products.forEach(function (product) {
      var db_op_req = productsStore.add(product);
      alert(product);
      db_op_req.onsuccess = function (event) {
        console.log(event.target.result == product.id); // true
      };
      // });
    };
    request.onerror = function (event) {
      console.log("[onerror]", request.error);
      alert(request.error);
    };

    request.onupgradeneeded = function (event) {
      var db = event.target.result;
      var productsStore = db.createObjectStore("products", { keyPath: "id" });
    };
  };
</script>
<main>
  <ComponentIngredients
    bind:loadingRecepies="{loading}"
    bind:searchedRecepies="{searched}"
    on:openfav="{() => ShowFavoriteList = true}"
  ></ComponentIngredients>
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
    {:else} {#each $fetchedRecepies as {Name, ImageUrl, Url, Ingredients, Id}}
    <FoodCard
      title="{Name}"
      thumbnail="{ImageUrl}"
      href="{Url}"
      ingredients="{Ingredients}"
      id="{Id}"
      instructions="{instructions}"
      on:recipeId="{getRecipeId}"
    ></FoodCard>
    {/each} {/if} {#if !isInWebAppiOS}
    <div style="height: 100px;"></div>
    {/if}
  </section>

  {/if} {#if showModal}
  <Modal on:close="{() => showModal = false}">
    <h3 class="recipe-title {isInWebAppiOS ? 'standalone' : ''}">{title}</h3>
    {#if instructions.length > 0}
    <button class="addtofav" on:click="{addToFavorites}">
      <svg
        height="25"
        viewBox="0 -11 511.99817 511"
        width="25"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="m510.640625 185.507812c-3.875-11.933593-15.425781-20.132812-31.683594-22.496093l-132.511719-19.257813-59.261718-120.070312c-7.269532-14.734375-18.636719-23.183594-31.183594-23.183594s-23.914062 8.449219-31.1875 23.183594l-59.253906 120.070312-132.519532 19.257813c-16.257812 2.363281-27.808593 10.5625-31.683593 22.496093-3.875 11.933594.648437 25.355469 12.414062 36.820313l95.890625 93.464844-22.640625 131.980469c-2.894531 16.878906 2.039063 26.996093 6.6875 32.507812 5.457031 6.46875 13.40625 10.03125 22.390625 10.03125 6.765625 0 13.957032-1.976562 21.378906-5.878906l118.523438-62.3125 118.527344 62.3125c7.421875 3.902344 14.613281 5.878906 21.375 5.882812h.003906c8.984375 0 16.9375-3.566406 22.390625-10.035156 4.648437-5.511719 9.582031-15.628906 6.683594-32.507812l-22.632813-131.980469 95.882813-93.460938c11.765625-11.46875 16.289062-24.890625 12.410156-36.824219zm-33.347656 15.339844-101.53125 98.96875c-3.535157 3.445313-5.148438 8.414063-4.3125 13.277344l23.964843 139.753906c.699219 4.066406.398438 6.375.121094 7.453125-1.070312-.070312-3.367187-.484375-7.046875-2.417969l-125.507812-65.984374c-2.1875-1.148438-4.582031-1.722657-6.980469-1.722657s-4.796875.574219-6.980469 1.722657l-125.5 65.980468c-3.679687 1.933594-5.980469 2.351563-7.050781 2.421875-.273438-1.078125-.578125-3.386719.121094-7.453125l23.972656-139.75c.832031-4.867187-.78125-9.835937-4.316406-13.277344l-101.535156-98.972656c-2.953126-2.878906-4.066407-4.921875-4.480469-5.957031.941406-.59375 3.042969-1.59375 7.125-2.1875l140.324219-20.390625c4.886718-.710938 9.109374-3.78125 11.292968-8.207031l62.746094-127.144531c1.828125-3.699219 3.425781-5.386719 4.285156-6.101563.855469.714844 2.457032 2.402344 4.28125 6.101563l62.75 127.144531c2.1875 4.425781 6.410156 7.496093 11.296875 8.207031l140.3125 20.390625c4.085938.59375 6.183594 1.59375 7.125 2.1875-.414062 1.03125-1.523437 3.078125-4.476562 5.957031zm0 0"
        />
      </svg>
    </button>
    {/if}
    <ul class="ingredients">
      {#each removedStringArray as {Name, Amount, Selected}}
      <li class="{Selected ? 'has-ingridient' : '' }">
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
  </Modal>
  {/if} {#if ShowFavoriteList}
  <Modal on:close="{() => ShowFavoriteList = false}" favoriteModal>
    <FavoriteList></FavoriteList>
  </Modal>
  {/if}
</main>

<style>
  .addtofav {
    border: none;
    background: transparent;
    position: absolute;
    right: 5px;
    top: 5px;
    margin-bottom: 0;
    cursor: pointer;
  }
  .has-ingridient > span {
    text-decoration: line-through;
  }
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
      padding: 20px;
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
      padding: 20px;
    }
  }
</style>
