import { writable } from "svelte/store";
import uuid from "uuid/v4";

const ingridients_ = writable([]);
const customIngridients = {
  subscribe: ingridients_.subscribe,
  addTodo: (name, ingredientId) =>
    ingridients_.update((todos) => [
      ...todos,
      { name, ingredientId, id: uuid() },
    ]),
  deleteTodo: (id) =>
    ingridients_.update((todos) => todos.filter((todo) => todo.id !== id)),
};
console.log(customIngridients);
export { customIngridients };
