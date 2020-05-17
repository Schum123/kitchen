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
  <div class="wrapper">
    {#if !searchedRecepies}
    <h2 class="mobile-only">Vad vill du laga?</h2>
    {/if}
    <h2 class="desktop-only">Vad vill du laga?</h2>
    <button
      class="open-fav {searchedRecepies ? 'searched' : ''}"
      on:click="{openFav}"
    >
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
    top: 15px;
    right: 5px;
    border: none;
    background-color: transparent;
  }
  .open-fav.searched {
    position: relative;
    margin-left: auto;
    display: block;
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
