<script>
  import Modal from "./Modal.svelte";
  import { fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { onMount } from "svelte";

  onMount(async () => {
    await getFavoritesList();
  });

  let recepieList = [];
  let isRecepieVisible = false;
  let fullRecepie = [];
  const getFavoritesList = () => {
    var request = self.indexedDB.open("FAVORITES_DB", 1);
    request.onsuccess = function (event) {
      var db = event.target.result;
      var transaction = db.transaction("products", "readwrite");
      var objectStore = transaction.objectStore("products");
      var objectStoreRequest = objectStore.getAll();
      transaction.oncomplete = function (event) {
        console.log("[Transaction] COMPLETED!");
        recepieList = objectStoreRequest.result;
      };
      transaction.onerror = function (event) {
        console.log("[Transaction] ERROR!");
      };
    };
  };
  const openFavoriteRecipe = (e) => {
    let id = e.target.dataset.id;
    isRecepieVisible = true;
    var request = self.indexedDB.open("FAVORITES_DB", 1);
    request.onsuccess = function (event) {
      var db = event.target.result;
      var transaction = db.transaction("products", "readwrite");
      var objectStore = transaction.objectStore("products");
      var objectStoreRequest = objectStore.get(Number(id));
      transaction.oncomplete = function (event) {
        console.log("[Transaction] COMPLETED!");
        fullRecepie[0] = objectStoreRequest.result;
      };
      transaction.onerror = function (event) {
        console.log("[Transaction] ERROR!");
      };
    };
  };
</script>
<h3>Dina sparade recept</h3>
<ul>
  {#each recepieList as {title, id}}

  <li class="list" on:click="{openFavoriteRecipe}" data-id="{id}">
    {title}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      class="eva eva-chevron-right-outline"
    >
      <g data-name="Layer 2">
        <g data-name="chevron-right">
          <rect
            width="24"
            height="24"
            transform="rotate(-90 12 12)"
            opacity="0"
          ></rect>
          <path
            d="M10.5 17a1 1 0 0 1-.71-.29 1 1 0 0 1 0-1.42L13.1 12 9.92 8.69a1 1 0 0 1 0-1.41 1 1 0 0 1 1.42 0l3.86 4a1 1 0 0 1 0 1.4l-4 4a1 1 0 0 1-.7.32z"
          ></path>
        </g>
      </g>
    </svg>
  </li>
  {/each}
</ul>
{#if isRecepieVisible}
<div
  class="test"
  in:fly="{{x: -900, duration: 300, easing: quintOut }}"
  out:fly="{{x: -900, duration: 300, easing: quintOut }}"
>
  <i class="arrow left" on:click="{() => isRecepieVisible = false}"></i>
  <div class="inner">
    {#each fullRecepie as recepie}
    <h3 class="recipe-title">{recepie.title}</h3>
    <ul class="ingredients">
      {#each recepie.removedStringArray as {Name, Amount, Selected}}
      <li class="{Selected ? 'has-ingridient' : '' }">
        <span>{Name}</span>
        <span>{Amount}</span>
      </li>
      {/each}
    </ul>
    <ol class="instructions">
      {#each recepie.instructions as {text}}
      <li>
        <span class="instructions">
          {text}
        </span>
      </li>
      {/each}
    </ol>
    {/each}
  </div>
</div>
{/if}

<style>
  .test {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 1;
    overflow: auto;
    background-color: #fff;
  }
  h3 {
    color: var(--instructions-color);
  }
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .list {
    --color: var(--primary-1);
    margin: 0 0 8px 0;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 12px;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    position: relative;
    text-decoration: none;
    color: var(--text-color-headline);
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
  }
  .list > svg {
    position: absolute;
    display: block;
    right: 0;
    top: 50%;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
    -webkit-transition: -webkit-transform 0.3s ease;
    transition: -webkit-transform 0.3s ease;
    transition: transform 0.3s ease;
    transition: transform 0.3s ease, -webkit-transform 0.3s ease;
    fill: var(--border-hover);
  }
  .inner {
    padding: 24px;
  }
  .recipe-title {
    margin-top: 0;
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
  .arrow {
    border: solid black;
    border-width: 0 3px 3px 0;
    display: inline-block;
    padding: 3px;
    position: fixed;
    top: 18px;
    left: 18px;
    cursor: pointer;
  }
  @media (min-width: 1281px) {
    .arrow {
      top: 10px;
      left: 10px;
    }
  }
  .left {
    transform: rotate(135deg);
    -webkit-transform: rotate(135deg);
  }
</style>
