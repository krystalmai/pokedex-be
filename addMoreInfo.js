const fs = require("fs");

const addMoreInfo = async () => {
  let data = JSON.parse(fs.readFileSync("db.json"));
  let pokemons = data.data;
  let newData = JSON.parse(fs.readFileSync("pokemon_full.json"));
  let newInfoById = {};

  newData.map((pokemon) => (newInfoById[Number(pokemon.id)] = pokemon));

  pokemons.map((pokemon) => {
    pokemon.height = newInfoById[pokemon.id].height;
    pokemon.weight = newInfoById[pokemon.id].weight;
    pokemon.description = newInfoById[pokemon.id].description;
    pokemon.abilities = newInfoById[pokemon.id].abilities;
    pokemon.category = newInfoById[pokemon.id].species;
  });
 
  data.data = pokemons;

  

  fs.writeFileSync("db.json", JSON.stringify(data))
};

addMoreInfo();
