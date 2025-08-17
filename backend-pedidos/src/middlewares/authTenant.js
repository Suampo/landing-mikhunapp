import jwt from "jsonwebtoken";

export const authTenant = (req, res, next) => {
  const header = req.headers.authorization || req.headers.Authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : header;

  if (!token) return res.status(401).json({ error: "Falta token" });

  try {
    // Solo ADMIN/STAFF (clave de admin)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.restaurantId) {
      return res.status(403).json({ error: "Token sin restaurantId" });
    }

    // (Opcional) restringir roles que pueden usar rutas de admin
    const rol = decoded.rol || "admin";
    if (!["admin", "staff"].includes(rol)) {
      return res.status(403).json({ error: "Rol no autorizado" });
    }

    req.user = {
      id: decoded.userId,
      restaurantId: decoded.restaurantId,
      rol,
    };
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
};
