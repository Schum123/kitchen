<script>
  import Modal from "./Modal.svelte";
  import { customIngridients } from "../store";
  import { createEventDispatcher } from "svelte";

  export let title;
  export let thumbnail;
  export let ingredients;
  export let href;
  export let id;
  export let instructions;
  let showModal = false;
  let availableIngredients = ingredients.filter((e) => e.Selected);
  let removedStringArray = ingredients.map(function (d) {
    return {
      Name: d.Name.replace(/Arla Köket|Arla/g, ""),
      Amount: d.Amount,
      Selected: d.Selected,
    };
  });

  const dispatch = createEventDispatcher();

  function openModal(id) {
    dispatch("recipeId", {
      id: id,
      showModal: true,
      removedStringArray: removedStringArray,
      href: href,
      title: title,
      instructions: instructions,
    });
  }
</script>

<article data-url="{href}">
  <span class="available">
    du har { availableIngredients.length } av {ingredients.length} ingredienser
  </span>
  <h2>{title}</h2>
  <div class="img-wrapper">
    <img src="{thumbnail}" height="190" />
  </div>
  <span on:click="{openModal(id)}">Visa alla ingredienser</span>
</article>

<style>
  .available {
    margin-bottom: 8px;
    text-align: center;
  }
  article {
    padding: 24px;
    background: var(--card-background);
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--shadow);
    border: 1px solid var(--border);
    display: flex;
    flex-direction: column;
  }
  .img-wrapper {
    position: relative;
    height: 0;
    padding-top: 61%;
    overflow: hidden;
    margin-bottom: 8px;
  }
  img {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    object-fit: fill;
  }
  h2 {
    font-family: "Encode Sans";
    font-weight: 700;
    font-size: 18px;
    color: var(--text-color-headline);
    margin: 0 0 16px 0;
    text-align: center;
  }

  small {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-color);
    text-decoration: none;
  }
  a {
    text-decoration: none;
    display: flex;
    flex-direction: column;
  }
  article:last-child {
    margin-bottom: 20px;
  }
  span {
    text-align: center;
  }
</style>
