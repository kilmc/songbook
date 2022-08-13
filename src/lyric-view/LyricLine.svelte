<script lang="ts">
  import type { INode } from "../types";

  export let bar: INode[];

  const renderBarNodes = (nodes: INode[]) => {
    if (nodes === undefined || nodes.length < 1) {
      return "";
    }

    return nodes.map((node) => node.data).join("");
  };
</script>

<p>{renderBarNodes(bar)}</p>
