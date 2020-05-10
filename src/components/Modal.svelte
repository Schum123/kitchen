<script>
  import { createEventDispatcher, onDestroy } from "svelte";
  const isInWebAppiOS = window.navigator.standalone == true;

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

<div
  class="modal {isInWebAppiOS ? 'standalone' : ''}"
  role="dialog"
  aria-modal="true"
  bind:this="{modal}"
>
  <div class="notch"></div>
  <slot name="header"></slot>
  <div class="modal-inner">
    <slot></slot>
  </div>
  <!-- svelte-ignore a11y-autofocus -->
  <div style="align-self: flex-start; margin-top: auto;">
    <button class="btn" on:click="{close}">Stäng</button>
  </div>
</div>

<style>
  .notch {
    height: 34px;
    background-color: var(--notch);
    width: calc(100vw - 165px);
    margin: 0 auto;
    border-bottom-left-radius: 2em;
    border-bottom-right-radius: 2em;
    position: relative;
    z-index: 10;
    display: none;
  }
  .notch:before {
    content: "";
    width: 7px;
    height: 7px;
    position: absolute;
    background-color: var(--notch);
    left: -2px;
    top: -6px;
    border-radius: 6px;
  }
  .notch:after {
    content: "";
    width: 7px;
    height: 7px;
    position: absolute;
    background-color: var(--notch);
    right: -2px;
    top: -6px;
    border-radius: 6px;
  }
  @media (min-width: 768px) {
    .notch {
      display: none;
    }
  }
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
    overflow: hidden;
    -webkit-overflow-scrolling: touch;
    max-height: calc(100vh - 42px);
    height: calc(100vh - 180px);
    padding: 24px;
    border-radius: 0.2em;
    background: white;
    z-index: 100;
    padding-top: 0;
  }
  .modal-inner {
    overflow: scroll;
    width: 100%;
    margin-bottom: 24px;
    width: calc(100vw - 4em);
    height: 100%;
    margin-top: 0px;
  }
  @media (min-width: 768px) {
    .modal-inner {
      max-width: 32em;
      margin-top: 0;
    }
  }

  .modal-inner::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 0;
    height: 0;
  }
  .modal.standalone {
    --safe-area-inset-top: env(safe-area-inset-top);
    height: calc(100% + var(--safe-area-inset-top));
    border-radius: 2em;
  }
  .modal.standalone .notch {
    display: block;
  }
  .modal.standalone .modal-inner {
    margin-top: -31px;
  }

  @media (min-width: 768px) {
    .modal {
      left: 50%;
      top: 47%;
      transform: translate(-50%, -50%);
      height: auto;
      max-height: calc(100vh - 9em);
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
</style>
