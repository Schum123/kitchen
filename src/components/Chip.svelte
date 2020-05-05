<script>
  import { customIngridients, customMainIngridients } from "../store";
  export let id;
  export let name;
  export let color;
  const remove = (id) => {
    customIngridients.deleteIngridients(id);
    customMainIngridients.deleteMainIngridient(id);
  };
</script>
<div class="todo-item" style="background: {color}">
  <div style="font-weight: 600;">{name}</div>
  <div class="remove-item" on:click="{()=>remove(id)}">
    x
  </div>
</div>

<style>
  .todo-item {
    display: inline-flex;
    border-radius: 6px;
    padding: 5px;
    color: #fff;
    margin-top: 8px;
    margin-right: 8px;
  }
  .remove-item {
    padding-left: 10px;
  }
</style>
