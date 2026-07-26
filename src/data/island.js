// Procedurally generated island map. The grid, walkable cells, and starting chunks
// are all computed once at module load -- deterministic, no React dependency.

// Procedurally generate a large island grid
export const ISLAND_COLS=48,ISLAND_ROWS=36,ISLAND_TILE=44;
export const TILE_COLORS={W:"#3a9fd4",S:"#e8d59a",G:"#5aaa35"};
export const ISLAND_GRID=(()=>{
  const cx=ISLAND_COLS/2-0.5,cy=ISLAND_ROWS/2-0.5;
  const rx=ISLAND_COLS*0.38,ry=ISLAND_ROWS*0.38;
  const grid=[];
  for(let r=0;r<ISLAND_ROWS;r++){
    const row=[];
    for(let c=0;c<ISLAND_COLS;c++){
      const nx=(c-cx)/rx,ny=(r-cy)/ry;
      const d=Math.sqrt(nx*nx+ny*ny);
      if(d>1)row.push("W");
      else if(d>0.82)row.push("S");
      else row.push("G");
    }
    grid.push(row);
  }
  return grid;
})();
export const GRASS_CELLS=[];
for(let r=0;r<ISLAND_ROWS;r++)for(let c=0;c<ISLAND_COLS;c++)if(ISLAND_GRID[r][c]==="G")GRASS_CELLS.push({c,r});

export const CHUNK_SIZE=3;
export const CHUNK_COLS=Math.floor(ISLAND_COLS/CHUNK_SIZE);
export const CHUNK_ROWS_COUNT=Math.floor(ISLAND_ROWS/CHUNK_SIZE);
export const CHUNK_COST=10;

export function chunkKey(cc,cr){return `${cc}_${cr}`;}
export function chunkHasLand(cc,cr){
  for(let tr=0;tr<CHUNK_SIZE;tr++)for(let tc=0;tc<CHUNK_SIZE;tc++){
    const r=cr*CHUNK_SIZE+tr,c=cc*CHUNK_SIZE+tc;
    if(ISLAND_GRID[r]&&ISLAND_GRID[r][c]!=="W")return true;
  }
  return false;
}
export const INITIAL_CHUNK_KEYS=(()=>{
  const midCr=Math.floor(CHUNK_ROWS_COUNT/2);
  for(let cc=0;cc<CHUNK_COLS;cc++){
    if(chunkHasLand(cc,midCr))return[chunkKey(cc,midCr),chunkKey(cc+1,midCr)];
  }
  return[chunkKey(0,midCr),chunkKey(1,midCr)];
})();
