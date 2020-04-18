<script>
  import { createEventDispatcher } from "svelte";
  export let id;
  export let name;
  const dispatch = createEventDispatcher();
  function deleteIngredient() {
    dispatch("deleteIngredient", {
      id: id,
    });
  }
</script>
<div class="todo-item">
  <div>{name}</div>
  <div class="remove-item" on:click="{deleteIngredient}">
    x
  </div>
</div>
