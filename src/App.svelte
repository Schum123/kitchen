<script>
  import CInput from "./components/CInput.svelte";
  import Chip from "./components/Chip.svelte"
  import FoodCard from "./components/FoodCard.svelte"
  import { customIngridients } from "./store"

  let fetchedRecipes = [];


  const getRecipes = async () => {
    let searchIng = Array.prototype.map.call($customIngridients, function(item) { return item.name; }).join(",");
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
    <div style="max-width: 280px;">
      <CInput />
    </div>
    <button on:click="{getRecipes}">>Fetcxh</button>
  </section>
  <section id="recipes">
{#each fetchedRecipes as {title, thumbnail, href}}
  <FoodCard title={title} thumbnail={thumbnail} href={href} />
{/each}
  </section>
</main>

<style>
  main {
    text-align: center;
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

#recipes {
  display: grid;
    grid-template-columns: repeat(3,1fr);
    grid-gap: 10px;
    grid-auto-rows: auto;
    padding: 20px;
    overflow-y: scroll;
    height: calc(100vh - 40px);
}
</style>
