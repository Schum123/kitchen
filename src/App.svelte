<script>
  import Radio from "./components/Radio.svelte"
  import CInput from "./components/CInput.svelte";
  import Chip from "./components/Chip.svelte"
  import FoodCard from "./components/FoodCard.svelte"
  import SkeletonFoodCard from "./components/SkeletonFoodCard.svelte"
  import { customIngridients, customMainIngridients } from "./store"
  import mockData from "../mockData"

  let loading = false
  let searched = false
  let fetchedRecipes = [];
  let group = '';
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
    }
  ]

  $: console.log('Changed selected:', group)
  $: console.log('Updated options:', mealOptions)
  const getRecipes = async () => {
    loading = true
    searched = true
    let searchIng = $customIngridients.map(item => item.ingredientId).join(",");
    let mainIngridient = $customMainIngridients.map(item => item.ingredientId)
    var proxyUrl = "https://cors-anywhere.herokuapp.com/",
      url = `https://www.arla.se/webappsfoodclub/demo/foodclubrecipes/byingredients/${mainIngridient}/${searchIng}?categoryid=${group}&skip=0&take=20`

      try {
    let response = await fetch(proxyUrl + url, {mode: 'cors'});

    let data = await response.json();

    if(Object.keys(data).length === 0) {
      fetchedRecipes = []
    }else {
      fetchedRecipes = data;
    }
      }
    catch(e) {
      console.log(e)
      searched = false
    }
    loading = false
  };

</script>

<main>
  <section id="right">
    <div class="wrapper">
      <h2 style="text-align: center;">Vad vill du laga?</h2>
      <div class="radio-group" style="--color:var(--primary-4);">
      <Radio { mealOptions } bind:group/>
    </div>
    {#if group !== "" && $customMainIngridients.length < 1}
    <h3>Välj huvudingrediens</h3>
      <CInput mainIngridients/>
    {/if}

      {#if group !== "" && $customMainIngridients.length > 0}
      <h3>Lägg till fler ingredienser</h3>
        <CInput />
      <button class="btn" on:click="{getRecipes}" style="align-self: flex-start; margin: 0 auto; display: block; margin-bottom: 15px;">Hitta recept</button>
      <div class="chip-wrapper">
        {#each $customMainIngridients as {name,id} (id)}
          <Chip {name} {id} color="#f44336"/>
        {/each}
        {#each $customIngridients as {name,id} (id)}
          <Chip {name} {id} color="#23c4f8"/>
        {/each}
    </div>
    {/if}
  </section>

  {#if !searched}
  <section id="start">
    <h1>Välj vilken typ av rätt du vill laga och lägg till ingredienser</h1>
  </section>
  {:else}

  <section id="recipes">
{#if loading}
    <SkeletonFoodCard />
    <SkeletonFoodCard />
    <SkeletonFoodCard />
    <SkeletonFoodCard />
    <SkeletonFoodCard />
{:else}
    {#each fetchedRecipes as {Name, ImageUrl, Url, Ingredients}}
      <FoodCard title={Name} thumbnail={ImageUrl} href={Url} ingredients={Ingredients} />
    {/each}
{/if}

  </section>
  {/if}

</main>

<style>
  .wrapper {
    max-width: 380px;
    margin: 0 auto;
  }

  .chip-wrapper {
    max-height: 105px;
    min-height: 105px;
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
    justify-content: space-around;
    flex-direction: column;
  }
  @media (min-width: 1281px) {
    main {
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
    height: 40vh;
    -webkit-overflow-scrolling: touch;
}
@media (min-width: 1281px){
  #recipes {
    width: calc(60% - 40px);
    grid-template-columns: repeat(3,1fr);
    height: calc(100vh - 40px);
  }
}

#right {
  margin-bottom: 20px;
  position: relative;
}
#right:after {
  content: '';
    height: 30px;
    width: 100%;
    position: absolute;
    bottom: -37px;
    z-index: 1;
    backdrop-filter: blur(2px);
}
@media (min-width: 1081px){
#right {
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
    transition: all .3s ease;
}
</style>
