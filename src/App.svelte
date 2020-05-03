<script>
  import CInput from "./components/CInput.svelte";
  import Chip from "./components/Chip.svelte"
  import FoodCard from "./components/FoodCard.svelte"
  import SkeletonFoodCard from "./components/SkeletonFoodCard.svelte"
  import { customIngridients } from "./store"
  import mockData from "../mockData"

  const mockedData = mockData;

  let fetchedRecipes = [];


  const getRecipes = async () => {
    let searchIng = $customIngridients.map(item => item.ingredientId).join(",");
    var proxyUrl = "https://cors-anywhere.herokuapp.com/",
      url = `https://www.arla.se/webappsfoodclub/demo/foodclubrecipes/byingredients/2092030536_186612795/${searchIng}?categoryid=865150284&skip=0&take=20`

    let response = await fetch(proxyUrl + url);

    let data = await response.json();

    fetchedRecipes = data;

    console.log(data)
  };

  console.log(mockData)
</script>

<main>
  <section id="right">
    <div style="max-width: 280px; align-self: flex-end;">
      <CInput />
    </div>
    <button class="btn" on:click="{getRecipes}" style="align-self: flex-start ;">>Fetcxh</button>
  </section>
  <section id="recipes">
    <SkeletonFoodCard />
{#each fetchedRecipes as {Name, ImageUrl, Url, Ingredients}}
  <FoodCard title={Name} thumbnail={ImageUrl} href={Url} ingredients={Ingredients} />
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
    grid-auto-rows: minmax(350px, 230px);
    padding: 20px;
    overflow-y: scroll;
    height: calc(100vh - 40px);
}
#right {
  display: grid;
    justify-content: center;
}
.btn {
--color: var(--primary-1);
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
    transition: all .3s ease;
}
</style>
