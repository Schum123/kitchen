<script>
  import { onMount } from "svelte";
  import { customIngridients } from "../store"
  import Chip from "./Chip.svelte";
  import Autocomplete from "./Autocomplete.svelte"
  import * as ingredientsList from '../../ingridients.json';
</script>

<Autocomplete class="input" name="fruits"  items="{ingredientsList.default}" minChar="2"/>

{#each $customIngridients as {name,id} (id)}
<Chip {name} {id}/>
{/each}


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
