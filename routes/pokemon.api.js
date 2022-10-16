const express = require("express");
const router = express.Router();
const fs = require("fs");

//READ
/**
 * @route GET /
 * @description Get all pokemons
 * @access public
 * @parameters "page", "limit", "type", "search"
 */

router.get("/", (req, res, next) => {
  // 1. input validation
  const allowedQueries = ["page", "limit", "type", "search"];
  try {
    let { page, limit, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const filterKeys = Object.keys(filterQuery); //unpack query keys in request
    filterKeys.forEach((key) => {
      //check if filterKeys contains valid keys
      if (!allowedQueries.includes(key)) {
        const exception = new Error(`Query ${key} is not allowed`);
        exception.statusCode = 401;
        throw exception;
      }
      if (!filterQuery[key]) delete filterQuery[key]; //handle query without a value
    });

    // 2. processing logic

    let offset = limit * (page - 1); // number of items to skip for selection

    // read data from db.json then parse to JS object

    let { data } = readDatabase();

    // filter by name
    let result = [];
    if (filterKeys.length) {
      if (filterKeys.includes("search")) {
        result = result.length
          ? result.filter((pokemon) =>
              pokemon.name.includes(filterQuery.search.toLowerCase())
            )
          : data.filter((pokemon) =>
              pokemon.name.includes(filterQuery.search.toLowerCase())
            );
      }
      //filter by types
      if (filterKeys.includes("type")) {
        result = result.length
          ? result.filter((pokemon) =>
              pokemon.types.some(
                (el) => el.toLowerCase() === filterQuery.type.toLowerCase() // case insensitive search
              )
            )
          : data.filter((pokemon) =>
              pokemon.types.some(
                (el) => el.toLowerCase() === filterQuery.type.toLowerCase()
              )
            );
      }
    } else {
      result = data;
    }
    result = result.slice(offset, offset + limit);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /:id
 * @description Get a pokemon by id
 * @access public
 */
router.get("/:id", (req, res, next) => {
  try {
    let { id } = req.params;

    // read data from db.json then parse t JS object

    let { data, totalPokemons } = readDatabase();

    let index = data.indexOf(
      data.find((pokemon) => pokemon.id === parseInt(id))
    ); //find index

    let result;

    switch (index) {
      case 0:
        result = {
          pokemon: data[0],
          previousPokemon: data[totalPokemons - 1],
          nextPokemon: data[1],
        };
        break;
      case totalPokemons - 1:
        result = {
          pokemon: data[totalPokemons - 1],
          previousPokemon: data[totalPokemons - 2],
          nextPokemon: data[0],
        };
        break;
      default:
        result = {
          pokemon: data[index],
          previousPokemon: data[index - 1],
          nextPokemon: data[index + 1],
        };
    }

    res.send(result);
  } catch (error) {
    error.statusCode = 500;
    next(error);
  }
});

//CREATE
/**
 * @route POST /
 * @description Create a pokemon
 * @access public
 * @body { name, id, types, url,}
 */
router.post("/", (req, res, next) => {
  try {
    // read data from db.json then parse t JS object

    let { db, data, totalPokemons } = readDatabase();

    //input validation

    const pokemonTypes = [
      "bug",
      "dragon",
      "fairy",
      "fire",
      "ghost",
      "ground",
      "normal",
      "psychic",
      "steel",
      "dark",
      "electric",
      "fighting",
      "flyingText",
      "grass",
      "ice",
      "poison",
      "rock",
      "water",
    ];

    const { name, id, types, url } = req.body;
    if (!name || !id || !types || !url) {
      throwException(400, "Missing required data");
    }

    if (types.length > 2) {
      throwException(400, "Pokémon can only have one or two types.");
    }

    types.forEach(
      (type) =>
        !pokemonTypes.includes(type) &&
        throwException(400, "Pokemon's type is invalid")
    );

    if (data.find((pokemon) => pokemon.id === id || pokemon.name === name)) {
      throwException(400, "This Pokemon already exists.");
    }

    // processing
    let newPokemon = {
      name,
      id,
      types,
      url,
    };
    data.push(newPokemon);

    totalPokemons = data.length;
    db.data = data;
    db.totalPokemons = totalPokemons;

    db = JSON.stringify(db);
    fs.writeFileSync("db.json", db);
    res.status(200).send(newPokemon);
  } catch (error) {
    next(error);
  }
});

//UPDATE
/**
 * @route PUT /:id
 * @description Update a pokemon info
 * @access public
 * @body { name,id, types, url,}
 */
router.put("/:id", (req, res, next) => {
  try {
    //input validation
    const allowedUpdate = ["name", "id", "types", "url"];
    const { id } = req.params;

    const updates = req.body;
    const updateKeys = Object.keys(updates);
    const notAllowed = updateKeys.filter((key) => !allowedUpdate.includes(key));
    if (notAllowed.length) {
      throwException(400, "Update field(s) not allowed");
    }

    // processing
    // read data from db.json then parse t JS object

    let { db, data } = readDatabase();
    const targetIndex = data.findIndex(
      (pokemon) => pokemon.id === parseInt(id)
    );
    if (targetIndex < 0) throwException(404, "Pokemon not found");
    const updatedPokemon = { ...data[targetIndex], ...updates };
    db.data[targetIndex] = updatedPokemon;

    // write to db.json
    db = JSON.stringify(db);
    fs.writeFileSync("db.json", db);
    res.status(200).send(updatedPokemon);
  } catch (error) {
    next(error);
  }
});

//DELETE
/**
 * @route DELETE /:id
 * @description Delete a pokemon by id
 * @access public

 */
router.delete("/:id", (req, res, next) => {
  try {
    const { id } = req.params;

    let { db, data } = readDatabase();
    const targetIndex = data.findIndex(
      (pokemon) => pokemon.id === parseInt(id)
    );
    if (targetIndex < 0) throwException(404, "Pokemon not found");
    db.data = data.filter((pokemon) => pokemon.id !== parseInt(id));
    db = JSON.stringify(db);
    fs.writeFileSync("db.json", db);
    res.status(200).send({});
  } catch (error) {
    next(error);
  }
});
module.exports = router;

//utilities
const throwException = (code, message) => {
  const exception = new Error(message);
  exception.statusCode = code;
  throw exception;
};

const readDatabase = () => {
  // read data from db.json then parse t JS object
  let db = fs.readFileSync("db.json", "utf-8");
  db = JSON.parse(db);
  const { data, totalPokemons } = db;
  return { db, data, totalPokemons };
};
