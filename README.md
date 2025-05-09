# psd-data-exporter

To install dependencies:

```bash
bun install
```

To run:

```bash
file="<filename>.psd" bun run test
```

## Example

```bash
{ echo 'export const ASSETS_DATA =('; pde --filePath $file; echo ')as const;'; } > temp && mv temp ./src/local/assetsData.ts && prettier --check ./src/local/assetsData.ts --write && cp -pR ${file%%.*}-assets/* public/img/

file="<ファイル名>.psd" npm run psd
```
