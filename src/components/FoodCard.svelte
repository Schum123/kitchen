<script>
  export let title;
  export let thumbnail;
  export let ingredients;
  export let href;
</script>

<article>
  {thumbnail} {title} {href}
</article>

<style>
  .container .box {
    max-width: 340px;
    margin: 0 auto;
  }
  @media (min-width: 720px) {
    .container .col .box {
      flex: 0 0 100%;
    }
  }
  .container .box > div {
    padding: 24px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--shadow);
    border: 1px solid var(--border);
    margin: 0 0 40px 0;
  }
</style>
