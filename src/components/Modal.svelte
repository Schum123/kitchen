<script>
  import { createEventDispatcher, onDestroy } from "svelte";
  const dispatch = createEventDispatcher();
  const close = () => dispatch("close");
  let modal;
  const handle_keydown = (e) => {
    if (e.key === "Escape") {
      close();
      return;
    }
    if (e.key === "Tab") {
      // trap focus
      const nodes = modal.querySelectorAll("*");
      const tabbable = Array.from(nodes).filter((n) => n.tabIndex >= 0);
      let index = tabbable.indexOf(document.activeElement);
      if (index === -1 && e.shiftKey) index = 0;
      index += tabbable.length + (e.shiftKey ? -1 : 1);
      index %= tabbable.length;
      tabbable[index].focus();
      e.preventDefault();
    }
  };
  const previously_focused =
    typeof document !== "undefined" && document.activeElement;
  if (previously_focused) {
    onDestroy(() => {
      previously_focused.focus();
    });
  }
</script>

<svelte:window on:keydown="{handle_keydown}" />

<div class="modal-background" on:click="{close}"></div>

<div class="modal" role="dialog" aria-modal="true" bind:this="{modal}">
  <div class="close" on:click="{close}">X</div>
  <slot name="header"></slot>
  <slot></slot>
  <!-- svelte-ignore a11y-autofocus -->
  <div style="align-self: flex-start; margin-top: auto;">
    <button class="btn" on:click="{close}">Stäng</button>
  </div>
</div>

<style>
  .modal-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    z-index: 99;
  }
  .modal {
    display: flex;
    flex-direction: column;
    position: absolute;
    left: 8px;
    top: 8px;
    width: calc(100vw - 4em);
    max-width: 32em;
    overflow: auto;
    max-height: calc(100vh - 4em);
    height: calc(100vh - 180px);
    padding: 24px;
    border-radius: 0.2em;
    background: white;
    z-index: 100;
  }

  @media (min-width: 1281px) {
    .modal {
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      height: auto;
    }
  }
  button {
    align-self: flex-start;
    margin-top: auto;
    --color: var(--primary-2);
    display: block;
    --text: #fff;
    text-align: center;
    vertical-align: middle;
    touch-action: manipulation;
    position: relative;
    white-space: nowrap;
    border: none;
    color: var(--text);
    padding: 9px 24px;
    font-size: 14px;
    line-height: 22px;
    font-weight: 600;
    background: var(--color);
    border-radius: 6px;
    text-decoration: none;
    -webkit-transition: all 0.3s ease;
    transition: all 0.3s ease;
  }
  .close {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 20px;
    height: 20px;
    font-weight: bold;
    text-align: center;
  }
</style>
