export async function loadData(){
  const files = ["profile","shows","movies","franchises","platforms"];
  const entries = await Promise.all(files.map(async name=>{
    const response = await fetch(`./data/${name}.json`);
    if(!response.ok) throw new Error(`Unable to load ${name}.json`);
    return [name, await response.json()];
  }));
  return Object.fromEntries(entries);
}
