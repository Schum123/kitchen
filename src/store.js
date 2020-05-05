import { writable } from "svelte/store";
import uuid from "uuid/v4";

const ingridients_ = writable([]);
const mainIngridients_ = writable([]);

const customIngridients = {
  subscribe: ingridients_.subscribe,
  addIngridients: (name, ingredientId) =>
    ingridients_.update((ingridients) => [
      ...ingridients,
      { name, ingredientId, id: uuid() },
    ]),
  deleteIngridients: (id) =>
    ingridients_.update((ingridients) =>
      ingridients.filter((ingridient) => ingridient.id !== id)
    ),
};
const customMainIngridients = {
  subscribe: mainIngridients_.subscribe,
  addMainIngridient: (name, ingredientId) =>
    mainIngridients_.update((mainIngridients) => [
      ...mainIngridients,
      { name, ingredientId, id: uuid() },
    ]),
  deleteMainIngridient: (id) =>
    mainIngridients_.update((mainIngridients) =>
      mainIngridients.filter((mainIngridient) => mainIngridient.id !== id)
    ),
};

export { customIngridients, customMainIngridients };
