<script>
  export let name;
  export let value;
  export let text;

  export let mealOptions = [];
  export let group = [];
</script>

{ #each mealOptions as radio }
<label class="radio">
  <input type="radio" name="{radio.name}" value="{radio.value}" bind:group />
  <span>{radio.text}</span>
</label>
{/each}

<style>
  span {
    position: relative;
    border: var(--border-width) solid var(--border);
    transition: background 0.3s ease, border-color 0.3s ease;
    flex: 1;
    line-height: 35px;
  }
  @media (min-width: 768px) {
    .span {
      padding: 7px 20px;
    }
  }
  input {
    display: none;
  }
  label {
    cursor: pointer;
    display: flex;
    flex: 1;
    text-align: center;
    height: 40px;
  }
  label:not(:first-child) {
    margin-left: calc(var(--border-width) * -1);
  }
  label input:checked + span {
    z-index: 2;
    background: var(--color);
    border-color: var(--color);
    color: #fff;
  }
  label:first-child input + span {
    border-radius: 6px 0 0 6px;
  }
  label:last-child input + span {
    border-radius: 0 6px 6px 0;
  }
  /* .radio {
    --color: var(--primary-1);
    --border-hover: var(--primary-1);
    --border-width: 2px;
    margin: 0 0 12px 0;
    display: table;
    cursor: pointer;
    margin: 12px auto 12px auto;
    min-width: 110px;
  }
  .radio.inline {
    margin: 0 12px 0 0;
    display: inline-block;
  }
  .radio input {
    display: none;
  }
  .radio input + span {
    color: var(--text-color);
    height: 22px;
    font-size: 14px;
    font-weight: 500;
    position: relative;
    display: block;
    text-align: left;
  }
  .radio input + span:before,
  .radio input + span:after {
    content: "";
    display: block;
    left: 0;
    top: 0;
    position: absolute;
  }
  .radio input + span:before {
    height: 18px;
    border: var(--border-width) solid var(--border);
    background: #fff;
    transition: background 0.3s ease, border-color 0.3s ease;
  }
  .radio input + span:after {
    -webkit-transition: opacity 0.2s ease, background 0.2s ease,
      -webkit-transform 0.3s ease;
    transition: opacity 0.2s ease, background 0.2s ease,
      -webkit-transform 0.3s ease;
    transition: transform 0.3s ease, opacity 0.2s ease, background 0.2s ease;
    transition: transform 0.3s ease, opacity 0.2s ease, background 0.2s ease,
      -webkit-transform 0.3s ease;
  }
  .radio input:checked + span:before {
    background: var(--color);
    border-color: var(--color);
  }
  .radio input:checked + span:after {
    -webkit-transition: opacity 0.3s ease, background 0.3s ease,
      -webkit-transform 0.6s cubic-bezier(0.175, 0.88, 0.32, 1.2);
    transition: opacity 0.3s ease, background 0.3s ease,
      -webkit-transform 0.6s cubic-bezier(0.175, 0.88, 0.32, 1.2);
    transition: opacity 0.3s ease, background 0.3s ease,
      transform 0.6s cubic-bezier(0.175, 0.88, 0.32, 1.2);
    transition: opacity 0.3s ease, background 0.3s ease,
      transform 0.6s cubic-bezier(0.175, 0.88, 0.32, 1.2),
      -webkit-transform 0.6s cubic-bezier(0.175, 0.88, 0.32, 1.2);
  }
  .radio:hover input:not(:checked) + span:before {
    border-color: var(--border-hover);
  }

  .radio input + span {
    padding-left: 22px;
  }
  .radio input + span:not(:empty) {
    padding-left: 30px;
  }
  .radio input + span:before {
    width: 18px;
  }
  .radio input + span:after {
    opacity: 0;
  }
  .radio input:checked + span:after {
    opacity: 1;
  }

  .radio input + span:before,
  .radio input + span:after {
    border-radius: 50%;
  }
  .radio input + span:after {
    width: 22px;
    height: 22px;
    background: #fff;
    opacity: 0;
    -webkit-transform: scale(0.6);
    transform: scale(0.6);
  }
  .radio input:checked + span:after {
    background: #fff;
    -webkit-transform: scale(0.4);
    transform: scale(0.4);
  } */
  *:before,
  *:after {
    box-sizing: inherit;
  }
</style>
