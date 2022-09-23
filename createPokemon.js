const fs = require("fs");
const csv = require("csvtojson");

const createPokemon = async () => {
  
  let newData = await csv().fromFile("pokemon.csv"); //convert csv to json array

  newData = newData
    .map((pokemon, index) => { // reshape data objects 

      return {
        id: index + 1,
        name: pokemon.Name,
        types: pokemon.Type2 ? [pokemon.Type1, pokemon.Type2 ] : [pokemon.Type1],
        url: `http://localhost:8000/images/${index + 1}.png`,
      };
    })
    .filter((pokemon) => pokemon.id <= 721);

  // retrieve db.json content
  let data = JSON.parse(fs.readFileSync("db.json"));

  // apped newly created json array
  data.data = newData; 
  data.totalPokemons = newData.length;

  // write updated content into db.json
  fs.writeFileSync("db.json", JSON.stringify(data));
};
createPokemon();
