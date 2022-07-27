<div class="lines">
  <div class="line lyrics">
    <span>Her</span>
    <span>name</span>
    <span>is</span>
    <span>No</span>
    <span>elle</span>
  </div>
  <div class="line chords">
    <span>E</span>
    <span>B</span>
  </div>
  <div class="line vocal-melody">
    <span>G#3</span>
    <span>G#3</span>
    <span>A3</span>
    <span>B3</span>
    <span>D#4</span>
  </div>
  
</div>

<style lang="scss">
  .lines {
    display: flex;
    flex-direction: column;
  }

  .line {
    display: grid;
    grid-template-columns: repeat(8,1fr);
    margin-bottom: 1rem;
    background-color: #BBBBBB;

    &.chords {
      span:nth-of-type(1) {
       
        grid-column: 2 / span 1;
      }

      span:nth-of-type(2) {
       
        grid-column: 5 / span 1;
      }
    }

    &.vocal-melody {
      grid-template-rows: repeat(4, auto);

      span:nth-of-type(1) {
        grid-row: 4;
        grid-column: 1 / span 1;
      }

      span:nth-of-type(2) {
        grid-row: 4;
        grid-column: 2 / span 1;
      }
      span:nth-of-type(3) {
        grid-column: 3 / span 1;
        grid-row: 3;
      }
      span:nth-of-type(4) {
        grid-column: 4 / span 1;
        grid-row: 2;
      }
      span:nth-of-type(5) {
        grid-column: 5 / span 1;
        grid-row: 1;
      }
    }
  }

</style>