<script>
  import { onMount } from "svelte";
  import { customIngridients } from "../store"
  import Chip from "./Chip.svelte";
  import Autocomplete from "./Autocomplete.svelte"
  import EmptyFridgeData from '../../testt.js'
  export let mainIngridients

  const arrayOfObj = Object.entries(EmptyFridgeData.Ingredients).map((e) => ( { 'ingredientId': e[0], 'name': e[1] } ));
</script>

<Autocomplete class="input" name="fruits"  items="{arrayOfObj}" minChar="2" mainIngridients={mainIngridients}/>


<style>
  .form-row input {
    display: block;
    background-color: transparent;
    border: none;
    outline: none;
    width: 100%;
    border-radius: 4px;
    color: #32325d;
    font-family: Camphor, Open Sans, Segoe UI, sans-serif;
    font-weight: 400;
    font-size: 17px;
    line-height: 26px;
    background-color: #f6f9fc;
    padding: 5px 20px 8px 13px;
    transition: background-color 0.1s ease-in, color 0.1s ease-in;
  }
  .form-row input.has-value,
  .form-row input.has-focus {
    background: transparent;
    box-shadow: 0 0 0 1px #e4effa;
  }
</style>
