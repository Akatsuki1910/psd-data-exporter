import PSD from "psd";
import { CONFIG } from "./CONFIG";

async function pde(opts: { filePath: string }) {
  const psd = await PSD.open(opts.filePath);
  const tree = psd.tree().export();
  const layers = filterLayers(tree);
  return {
    type: "layers",
    layers,
    meta: {
      cols: psd.header!.cols,
      rows: psd.header!.rows,
    },
  };
}

function filterLayers(
  layer: PSD.Node.GroupExport | PSD.Node.RootExport | PSD.ChildrenExport
): any[] {
  const array = [];
  if ("name" in layer && CONFIG.IMAGE_EXT.test(layer.name)) {
    const params = Object.assign({}, layer, "mask" in layer ? layer.mask : {});
    let width: number | undefined;
    let height: number | undefined;
    let top: number | undefined;
    let left: number | undefined;
    let right: number | undefined;
    let bottom: number | undefined;

    if ("children" in layer) {
      layer.children.forEach((child) => {
        if (!child.visible) return;
        let c: PSD.ChildrenExport | PSD.MaskExport = child;

        if ("mask" in child) {
          c = child.mask;
        }

        if (top === undefined || top > c.top) top = c.top;
        if (left === undefined || left > c.left) left = c.left;
        if (right === undefined || right < c.right) right = c.right;
        if (bottom === undefined || bottom < c.bottom) bottom = c.bottom;
      });

      width = right! - left!;
      height = bottom! - top!;
    } else {
      width = params.width;
      height = params.height;
      top = params.top;
      left = params.left;
      right = params.right;
      bottom = params.bottom;
    }

    array.push({ name: params.name, width, height, top, left, right, bottom });
  }
  if ("children" in layer) {
    layer.children.forEach((child) => {
      array.push(filterLayers(child));
    });
  }
  return array.flat();
}

export default pde;
