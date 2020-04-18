<script>
  export let title;
  export let thumbnail;
  export let ingredients;
  export let href;
</script>

<article>
  <h2>{title}</h2>
  <img src="{thumbnail}" />
  <a href="{href}">Link to recepie</a>
</article>

<style>
  article {
    padding: 24px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--shadow);
    border: 1px solid var(--border);
  }
</style>
