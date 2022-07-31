<script lang="ts">
  import type { INode } from "../types";
  import { getGridColumn } from "./utils";

  export let node: INode;

  $: isBlankNode = node.data === "BLANK";
</script>

<span class="track__node" class:track__node--blank={isBlankNode} style="{getGridColumn(node)}">
  {isBlankNode ? "" : node.data}
</span>

<style lang="scss">
span {
  background-color: goldenrod;
}

.track__node--blank {
  background-color: transparent;

  &:hover {
    background-color: #fff;
  }
}
</style>