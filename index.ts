import PSD from "psd";
import { CONFIG } from "./CONFIG";

async function pde(opts: { filePath: string }) {
  const psd = await PSD.open(opts.filePath);
  const tree = psd.tree().export();
  const layers = filterLayers(tree);

  const { width: w, height: h } = tree.document;

  layers.forEach((layer, i) => {
    layers[i].top = Math.min(Math.max(0, layer.top!), h);
    layers[i].left = Math.min(Math.max(0, layer.left!), w);
    layers[i].right = Math.min(Math.max(0, layer.right!), w);
    layers[i].bottom = Math.min(Math.max(0, layer.bottom!), h);

    layers[i].height = layers[i].bottom - layers[i].top;
    layers[i].width = layers[i].right - layers[i].left;
  });

  return {
    type: "layers",
    layers,
    meta: {
      cols: psd.header!.cols,
      rows: psd.header!.rows,
    },
  };
}

interface Size {
  top: number | undefined;
  left: number | undefined;
  right: number | undefined;
  bottom: number | undefined;
}

function pickSize(layer: PSD.Node.LayerExport | PSD.ChildrenExport, s: Size) {
  const size = s;

  let c: PSD.MaskExport | PSD.Node.LayerExport | PSD.ChildrenExport = layer;

  if ("mask" in layer && Object.keys(layer.mask).length !== 0) {
    c = layer.mask;

    if (c.defaultColor === 255) return size;
  }

  if (s.top === undefined || s.top > c.top) size.top = c.top;
  if (s.left === undefined || s.left > c.left) size.left = c.left;
  if (s.right === undefined || s.right < c.right) size.right = c.right;
  if (s.bottom === undefined || s.bottom < c.bottom) size.bottom = c.bottom;

  return size;
}

function getSize(layer: PSD.ChildrenExport, s: Size) {
  let size = s;

  if ("children" in layer) {
    layer.children.forEach((child) => {
      if (!child.visible) return;

      if ("children" in layer) {
        layer.children.forEach((child) => {
          if (!child.visible) return;

          size = getSize(child, size);
        });
      }

      if (child.type === "group") return size;

      size = pickSize(child, size);
    });
  } else {
    size = pickSize(layer, size);
  }

  return size;
}

function filterLayers(
  layer: PSD.Node.GroupExport | PSD.Node.RootExport | PSD.ChildrenExport
) {
  const array: ({ name: string } & Size & { height: number; width: number })[] =
    [];

  if ("name" in layer && CONFIG.IMAGE_EXT.test(layer.name)) {
    const { top, left, right, bottom } = getSize(layer, {
      top: undefined,
      left: undefined,
      right: undefined,
      bottom: undefined,
    });

    array.push({
      name: layer.name,
      top,
      left,
      right,
      bottom,
      width: 0,
      height: 0,
    });
  }

  if ("children" in layer) {
    layer.children.forEach((child) => array.push(...filterLayers(child)));
  }
  return array.flat();
}

export default pde;
