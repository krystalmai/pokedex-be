# Pokemons API
Get pokemon information like name, types, image, description, height, weight, abilities,...

## Endpoint

### Create 

```js
/**
 * @route POST /pokemons
 * @description Create a pokemon
 * @access public
 * @body { name, id, types, url,}
 */
```

### Read

```js
/**
 * @route GET /pokemons
 * @description Get all pokemons
 * @access public
 * @parameters "page", "limit", "type", "search"
 */
```
```js
/**
 * @route GET pokemons/:id
 * @description Get a pokemon by id
 * @access public
 */
```
### Update
```js
/**
 * @route PUT pokemons/:id
 * @description Update a pokemon info
 * @access public
 * @body { name,id, types, url,}
 */
```

### Delete
```js
/**
 * @route DELETE /:id
 * @description Delete a pokemon by id
 * @access public

 */
```