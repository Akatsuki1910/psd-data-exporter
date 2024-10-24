import pde from "../index";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

async function init() {
  const opts = await parseOptions();
  const res = await pde(opts);
  console.log(JSON.stringify(res.layers));
}

async function parseOptions() {
  const args = await yargs(hideBin(process.argv)).argv;
  const filePath = args.filePath as string;
  if (!filePath) {
    throw new Error("no file path.");
  }

  return {
    filePath,
  };
}

init();
