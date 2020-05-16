<script>
  import CInput from "../components/CInput.svelte";
  import Chip from "../components/Chip.svelte";
  import Radio from "../components/Radio.svelte";
  import { createEventDispatcher, onDestroy } from "svelte";
  import { writable } from "svelte/store";

  import {
    customIngridients,
    customMainIngridients,
    fetchedRecepies,
  } from "../store";

  export let loadingRecepies = false;
  export let searchedRecepies = false;
  let group = "";
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
  const dispatch = createEventDispatcher();
  const openFav = () => dispatch("openfav");

  const getRecipes = async () => {
    loadingRecepies = true;
    searchedRecepies = true;
    let addedIngridients = $customIngridients
      .map((item) => item.ingredientId)
      .join(",");
    let mainIngridient = $customMainIngridients.map(
      (item) => item.ingredientId
    );
    var proxyUrl = process.env.PROXY_URL,
      url = `${process.env.API_URL}${mainIngridient}/${addedIngridients}?categoryid=${group}&skip=0&take=20`;

    try {
      let response = await fetch(proxyUrl + url, { mode: "cors" });
      let data = await response.json();
      if (Object.keys(data).length === 0) {
        fetchedRecipes = [];
      } else {
        fetchedRecepies.setFetchedRecepies(data);
      }
    } catch (e) {
      console.log(e);
      searchedRecepies = false;
    }
    loadingRecepies = false;
  };
</script>
<section>
  <button class="open-fav" on:click="{openFav}">Favoriter</button>
  <div class="wrapper">
    {#if !searchedRecepies}
    <h2 class="mobile-only">Vad vill du laga?</h2>
    {/if}
    <h2 class="desktop-only">Vad vill du laga?</h2>
    <div
      class="radio-group {searchedRecepies ? 'searched' : ''}"
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

<style>
  .open-fav {
    position: absolute;
    top: 5px;
    right: 5px;
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
  section {
    margin-bottom: 20px;
    position: relative;
  }
  section:after {
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
    section {
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
</style>
