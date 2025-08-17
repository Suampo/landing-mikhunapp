import jwt from "jsonwebtoken";

export const authKitchen = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7)
    : header;

  if (!token) return res.status(401).json({ error: "Falta token" });

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SERVICE_SECRET || "dev_service_secret"
    );

    if (payload.rol !== "kitchen")
      return res.status(403).json({ error: "Token no autorizado para cocina" });

    if (!payload.restaurantId)
      return res.status(403).json({ error: "Token sin restaurantId" });

    req.user = {
      restaurantId: payload.restaurantId,
      rol: payload.rol,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
};
