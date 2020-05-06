<div class="spinner">
  <div></div>
  <div></div>
  <div></div>
</div>

<style>
  .spinner {
    height: 60px;
    width: 60px;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-align-items: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    margin: 0 auto;
  }
  .spinner > div {
    height: 15px;
    width: 15px;
    background-color: var(--primary-1);
    margin: 1px;
    display: inline-block;
    border-radius: 100%;
  }
  .spinner > div:first-child {
    animation: 0.6s ease-in-out 0.07s infinite normal both running jump;
  }
  .spinner > div:nth-child(2) {
    animation: 0.6s ease-in-out 0.14s infinite normal both running jump;
  }
  .spinner > div:last-child {
    animation: 0.6s ease-in-out 0.21s infinite normal both running jump;
  }
  @keyframes jump {
    33% {
      -webkit-transform: translateY(10px);
      -ms-transform: translateY(10px);
      transform: translateY(10px);
    }
    66% {
      -webkit-transform: translateY(-10px);
      -ms-transform: translateY(-10px);
      transform: translateY(-10px);
    }
    100% {
      -webkit-transform: translateY(0);
      -ms-transform: translateY(0);
      transform: translateY(0);
    }
  }
</style>
