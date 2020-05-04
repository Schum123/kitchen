<script>
  import Radio from "./components/Radio.svelte"
  import CInput from "./components/CInput.svelte";
  import Chip from "./components/Chip.svelte"
  import FoodCard from "./components/FoodCard.svelte"
  import SkeletonFoodCard from "./components/SkeletonFoodCard.svelte"
  import { customIngridients } from "./store"
  import mockData from "../mockData"

  let loading = false

  const mockedData = mockData;

  let fetchedRecipes = [];
  let group = '865150284';
  let mealOptions = [
    {
      value: "865150284",
      text: "Huvudrätt",
      checked: true
    },
    {
      value: "1089312893",
      text: "förrätt",
      checked: false
    },
    {
      value: "3247760446",
      text: "frukost",
      checked: false
    },
    {
      value: "4278008420",
      text: "efterrätt",
      checked: false
    }
  ]

  $: console.log('Changed selected:', group)
  $: console.log('Updated options:', mealOptions)

  const getRecipes = async () => {
    loading = true
    let searchIng = $customIngridients.map(item => item.ingredientId).join(",");
    var proxyUrl = "https://cors-anywhere.herokuapp.com/",
      url = `https://www.arla.se/webappsfoodclub/demo/foodclubrecipes/byingredients/${searchIng}?categoryid=${group}&skip=0&take=20`

    let response = await fetch(proxyUrl + url);

    let data = await response.json();

    fetchedRecipes = data;
    loading = false
    console.log(data)
  };

  console.log(mockData)
</script>

<main>
  <section id="right">
    <div style="max-width: 280px; align-self: flex-end;">
      <h2>Vad vill du laga?</h2>
      <Radio { mealOptions } bind:group/>
      <CInput />
    </div>
    <button class="btn" on:click="{getRecipes}" style="align-self: flex-start;">Hitta recept</button>
  </section>
  <section id="recipes">
    {#if loading}
    <SkeletonFoodCard />
    <SkeletonFoodCard />
    <SkeletonFoodCard />
    <SkeletonFoodCard />
    <SkeletonFoodCard />
    {:else}
    {#each mockedData as {Name, ImageUrl, Url, Ingredients}}
      <FoodCard title={Name} thumbnail={ImageUrl} href={Url} ingredients={Ingredients} />
    {/each}
{/if}
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
    grid-auto-rows: minmax(min-content, max-content);
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
