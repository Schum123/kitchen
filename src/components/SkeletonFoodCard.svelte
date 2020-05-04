<div class="card-skeleton">
  <div class="animated-background">
    <div class="card-skeleton-heading">
      <div class="skel-mask skel-mask-1-heading"></div>
      <div class="skel-mask skel-mask-2-heading"></div>
    </div>
    <div class="card-skeleton-img">
      <div class="skel-mask skel-mask-1"></div>
      <div class="skel-mask skel-mask-2-image"></div>
      <div class="skel-mask skel-mask-3-image"></div>
    </div>
    <div class="skel-mask-container">
      <div class="skel-mask skel-mask-1-container"></div>
      <div class="skel-mask skel-mask-3"></div>
    </div>
  </div>
</div>

<style>
  .skel-mask-1-heading {
    height: 20px;
    width: 40px;
    left: 0;
    top: 0;
  }
  .skel-mask-2-heading {
    height: 20px;
    width: 40px;
    right: 0;
    top: 0;
  }
  .card-skeleton-heading {
    width: 100%;
    height: 20px;
    display: block;
  }
  .skel-mask-2-image {
    width: 31%;
    height: 100px;
    top: 20px;
    right: 0;
  }
  .skel-mask-3-image {
    width: 32%;
    height: 100px;
    top: 20px;
    left: 0;
  }
  .card-skeleton {
    transition: all 0.3s ease-in-out;
    -webkit-backface-visibility: hidden;
    background: #fff;
    z-index: 10;
    padding: 24px;
    opacity: 1;
    box-shadow: 0 2px 4px var(--shadow);
    border: 1px solid var(--border);
    border-radius: 8px;
    min-height: 230px;
  }
  .animated-background {
    will-change: transform;
    animation: placeHolderShimmer 1s linear infinite forwards;
    -webkit-backface-visibility: hidden;
    background: #e6e6e6;
    background: linear-gradient(90deg, #eee 8%, #ddd 18%, #eee 33%);
    background-size: 800px 104px;
    height: 100%;
    position: relative;
  }
  .card-skeleton-img {
    width: 100%;
    height: 80px;
    display: block;
  }
  .skel-mask-container {
    position: relative;
  }
  .skel-mask {
    background: #fff;
    position: absolute;
    z-index: 200;
  }
  .skel-mask-1-container {
    width: 100%;
    height: 10px;
    left: 0;
  }
  .skel-mask-1 {
    width: 100%;
    height: 15px;
    left: 0;
  }
  .skel-mask-2 {
    width: 25%;
    height: 10px;
    top: 15px;
    right: 0;
  }

  .skel-mask-3 {
    top: 20px;
  }

  .skel-mask-3,
  .skel-mask-4 {
    width: 100%;
    height: 20px;
    right: 0;
  }

  .skel-mask-4 {
    top: 40px;
  }

  .skel-mask-5 {
    width: 10%;
    height: 30px;
    top: 65px;
    right: 30%;
  }

  .skel-mask-6 {
    width: 100%;
    height: 15px;
    top: 95px;
    right: 0;
  }
  @keyframes placeHolderShimmer {
    0% {
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
      background-position: -468px 0;
    }
    to {
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
      background-position: 468px 0;
    }
  }
</style>
