<script>
  import { onMount } from "svelte";
  import { ingridients } from "../store"
  import Chip from "./Chip.svelte";
  import * as ingredientsList from '../../ingridients.json';

  let searchInput;
  let value = "";
  let isFocused = false;
  let addedIngredients = [];
  let nextId = 2;
  const onFocus = () => (isFocused = true);
  const onBlur = () => (isFocused = false);
  onMount(() => searchInput.focus());
  function addIngridient(event) {
    if (event.key === "Enter") {
      addedIngredients = [
        ...addedIngredients,
        {
          id: nextId,
          name: value,
        },
      ];
      nextId = nextId + 1;
      value = "";
      
      ingridients.update(n => [...addedIngredients])
    }
  }
  function deleteIngredient(event) {
    addedIngredients = addedIngredients.filter(todo => todo.id !== event.detail.id);
    ingridients.update(fn => [...addedIngredients])
  }
  const word = ingredientsList.default;
  console.log(word); // output 'testing'



 /*list of available options*/ 
 var n= word.length; //length of datalist tags     
  
  function ac(value) { 
     document.getElementById('datalist').innerHTML = ''; 
      //setting datalist empty at the start of function 
      //if we skip this step, same name will be repeated 
        
      l=value.length; 
      //input query length 
  for (var i = 0; i<n; i++) { 
      if(((word[i].toLowerCase()).indexOf(value.toLowerCase()))>-1) 
      { 
          //comparing if input string is existing in tags[i] string 

          var node = document.createElement("option"); 
          var val = document.createTextNode(word[i]); 
           node.appendChild(val); 

            document.getElementById("datalist").appendChild(node); 
                //creating and appending new elements in data list 
          } 
      } 
  } 



</script>
<h2>Add ingredients</h2>

<div class="form-row has-focus">
  <input
    id="firstname"
    name="firstname"
    type="text"
    placeholder="Jane"
    required=""
    class="{value.length > 0 ? 'has-value': ''} {isFocused ? 'has-focus' : ''}"
    bind:value="{value}"
    bind:this="{searchInput}"
    on:focus="{onFocus}"
    on:blur="{onBlur}"
    on:keydown="{addIngridient}"
    list="datalist"
    onkeyup="ac(this.value)"
  />

  <datalist id="datalist">
    {#each ingredientsList.default as {name}}
    <option>{name}</option>
    {/each}
  </datalist>
</div>
{#each $ingridients as ingredients}
<Chip {...ingredients} on:deleteIngredient={deleteIngredient}/>
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
