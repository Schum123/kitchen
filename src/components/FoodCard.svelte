<script>
  export let title;
  export let thumbnail;
  export let ingredients;
  export let href;
  let showModal = false;
  let availableIngredients = ingredients.filter((e) => e.Selected);
  let removedStringArray = ingredients.map(function (d) {
    return { Name: d.Name.replace(/Arla Köket|Arla/g, ""), Amount: d.Amount };
  });
</script>

<article>
  du har { availableIngredients.length } av {ingredients.length} ingredienser
  <h2>{title}</h2>
  <img src="{thumbnail}" />
  <span on:click="{() => showModal = true}">Visa alla ingredienser</span>
  <small><a href="{href}" target="_blank">Länk till recept</a></small>
</article>

{#if showModal}
<div class="modal">
  <ul>
    {#each removedStringArray as {Name, Amount}}
    <li>
      <span>{Name}</span>
      <span>{Amount}</span>
    </li>
    {/each}
  </ul>
</div>
{/if}

<style>
  .modal {
    
  }
  article {
    padding: 24px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--shadow);
    border: 1px solid var(--border);
    height: 100%;
    justify-content: space-between;
    display: flex;
    flex-direction: column;
  }
  img {
    object-fit: contain;
    max-width: 100%;
    height: auto;
  }
  h2 {
    font-family: "Encode Sans";
    font-weight: 700;
    font-size: 18px;
    color: var(--text-color-headline);
    margin: 0 0 16px 0;
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
</style>
