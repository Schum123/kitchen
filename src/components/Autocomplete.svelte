<script>
  import { customIngridients } from "../store";
  const regExpEscape = (s) => {
    return s.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
  };

  export let name = "";
  export let value = "";
  export let placeholder = "";
  export let required = false;
  export let disabled = false;

  // autocomplete props
  export let items = [];
  export let isOpen = false;
  export let results = [];
  export let search = "";
  export let arrowCounter = 0;

  let className = "";
  let isAsync = false;
  let minChar = 2;
  let maxItems = 5;
  let fromStart = true; // Default type ahead
  let list;
  let input;
  let addedIngredients = [];
  let nextId = 2;

  async function onChange(event) {
    search.length >= Number(minChar);
    filterResults();
    isOpen = true;
  }
  function filterResults() {
    results = items
      .filter((item) => {
        return fromStart
          ? item.name.toUpperCase().startsWith(search.toUpperCase())
          : item.name.toUpperCase().includes(search.toUpperCase());
      })
      .map((item) => {
        const text = item.name;
        return {
          key: text,
          value: item.value || item,
          label:
            search.trim() === ""
              ? text
              : text.replace(
                  RegExp(regExpEscape(search.trim()), "i"),
                  "<span>$&</span>"
                ),
        };
      })
      .slice(0, 6);
    const height = results.length > maxItems ? maxItems : results.length;
    list.style.height = `${height * 2.5}rem`;
  }
  function onKeyDown(event) {
    if (event.keyCode === 40 && arrowCounter < results.length) {
      // ArrowDown
      arrowCounter = arrowCounter + 1;
    } else if (event.keyCode === 38 && arrowCounter > 0) {
      // ArrowUp
      arrowCounter = arrowCounter - 1;
    } else if (event.keyCode === 13) {
      // Enter
      event.preventDefault();
      if (arrowCounter === -1) {
        arrowCounter = 0; // Default select first item of list
      }
      close(arrowCounter);
    } else if (event.keyCode === 27) {
      // Escape
      event.preventDefault();
      close();
    }
  }
  function close(index = -1) {
    isOpen = false;
    arrowCounter = -1;
    input.blur();
    if (index > -1) {
      value = results[index].value.name;
      customIngridients.addTodo(value);
      search = "";
    } else if (!value) {
      //search = "";
    }
  }

  function test() {
    console.log("click");
    if (search) {
      isOpen = true;
    }
  }
</script>

<style>
  * {
    box-sizing: border-box;
  }

  input {
    height: 2rem;
    font-size: 1rem;
    padding: 0.25rem 0.5rem;
  }

  .autocomplete {
    position: relative;
  }

  .hide-results {
    display: none;
  }

  .autocomplete-results {
    padding: 0;
    margin: 0;
    border: 1px solid #dbdbdb;
    height: 6rem;
    overflow: auto;
    width: 100%;

    background-color: white;
    box-shadow: 2px 2px 24px rgba(0, 0, 0, 0.1);
    position: absolute;
    z-index: 100;
  }

  .autocomplete-result {
    color: #7a7a7a;
    list-style: none;
    text-align: left;
    height: 2rem;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
  }

  .autocomplete-result > :global(span) {
    background-color: none;
    color: #242424;
    font-weight: bold;
  }

  .autocomplete-result.is-active,
  .autocomplete-result:hover {
    background-color: #dbdbdb;
  }

  .form-field {
    --color: var(--primary-1);
    outline: none;
    display: block;
    width: 100%;
    -webkit-appearance: none;
    background: #fff;
    border: 1px solid var(--border);
    padding: 8px 16px;
    line-height: 22px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-color);
    border-radius: 6px;
    transition: border 0.3s ease;
  }

  .form-field::placeholder {
    color: var(--border-hover);
  }
  .form-field:focus {
    outline: none;
    border-color: var(--color);
  }
</style>
<svelte:window on:click="{()=>close()}" />
<div on:click="{(event)=>event.stopPropagation()}" class="autocomplete">
  <input
    type="text"
    class="form-field {className}"
    {name}
    {placeholder}
    {required}
    {disabled}
    autocomplete="{name}"
    bind:value="{search}"
    on:input="{(event)=>onChange(event)}"
    on:focus="{test}"
    on:blur
    on:keydown="{(event)=>onKeyDown(event)}"
    bind:this="{input}"
  />
  {#if search.length >= 2}
  <ul
    class="autocomplete-results{!isOpen ? ' hide-results' : '' || search.length < 2 ? ' hide-results' : ''}"
    bind:this="{list}"
  >
    {#each results as result, i}
    <li
      on:click="{()=>close(i)}"
      class="autocomplete-result{ i === arrowCounter ? ' is-active' : '' }"
    >
      {@html result.label}
    </li>
    {/each}
  </ul>
  {/if}
</div>
