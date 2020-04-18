<script>
  import { customIngridients } from "../store";
  export let id;
  export let name;
  const remove = (id) => {
    customIngridients.deleteTodo(id);
  };
</script>
<div class="todo-item">
  <div>{name}</div>
  <div class="remove-item" on:click="{()=>remove(id)}">
    x
  </div>
</div>
