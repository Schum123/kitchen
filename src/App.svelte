<script>
  import CInput from "./components/CInput.svelte";
  import Chip from "./components/Chip.svelte"
  import FoodCard from "./components/FoodCard.svelte"
  import { ingridients } from "./store"

  let fetchedRecipes = [];


  const getRecipes = async () => {
    let searchIng = Array.prototype.map.call($ingridients, function(item) { return item.name; }).join(",");
    var proxyUrl = "https://cors-anywhere.herokuapp.com/",
      url = `http://www.recipepuppy.com/api/?i=${searchIng}&p=2`;

    let response = await fetch(proxyUrl + url);

    let data = await response.json();
    let recipes = data.results
    
    fetchedRecipes = [...recipes];
    console.log(fetchedRecipes)
  };
</script>

<main>
  <section>
    <CInput />
    <button on:click="{getRecipes}">>Fetcxh</button>
  </section>
  <section>
    {#each fetchedRecipes as {title, thumbnail, href}}
<div>{title}</div>
<FoodCard title={title} thumbnail={thumbnail} href={href} />

{/each}
  </section>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 40% 60%;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
