const db = require("../config/db");

module.exports = {
  listByRestaurant(restaurantId) {
    return db("categorias")
      .where({ restaurant_id: Number(restaurantId) })
      .orderBy("nombre");
  },

  async create({ restaurantId, nombre }) {
    const [row] = await db("categorias")
      .insert({ restaurant_id: Number(restaurantId), nombre })
      .returning("*");
    return row;
  },

  async update(id, { nombre }) {
    const [row] = await db("categorias")
      .where({ id: Number(id) })
      .update({ nombre })
      .returning("*");
    return row;
  },

  async remove(id) {
    await db("categorias").where({ id: Number(id) }).del();
  },
};
