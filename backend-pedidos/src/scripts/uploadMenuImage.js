export const uploadMenuImage = async (req, res) => {
  const { id } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No se subió ninguna imagen" });
  }

  const filename = `${Date.now()}_${file.originalname}`;

  const { error: uploadError } = await supabase
    .storage
    .from("menu-images")
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: true
    });

  if (uploadError) {
    return res.status(500).json({ error: uploadError.message });
  }

  const { data } = supabase
    .storage
    .from("menu-images")
    .getPublicUrl(filename);

  try {
    await pool.query(
      `UPDATE menu_items SET imagen_url = $1 WHERE id = $2`,
      [data.publicUrl, id]
    );

    res.json({ message: "Imagen subida correctamente", imageUrl: data.publicUrl });
  } catch (err) {
    console.error("❌ Error al guardar imagen en DB:", err.message);
    res.status(500).json({ error: "Error al guardar imagen en base de datos" });
  }
};