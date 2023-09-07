const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const javaocr = require("./public/javaocr");

const app = express();
app.use(express.static("public"));

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const base64Data = req.file.buffer.toString("base64");
    const dataUri = `data:image/jpeg;base64,${base64Data}`;

    const isValid = await isImageValid(dataUri);
    if (isValid) {
      await saveImage(base64Data);
      javaocr();
      res.send("success");
    } else {
      res.status(400).send("Invalid image data");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/menu", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index2.html"));
});

app.get("/detail", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "detail.html"));
});

// app.get('/details', async (req, res) => {
//   const menuKey = req.query.key;
//   const menuData = JSON.parse(await fs.promises.readFile('./public/example_menu.json', 'utf8'));
//   const matchedMenu = menuData.find(menu => menu['menu_name(eng)'] === menuKey);

//   if (matchedMenu) {
//     res.send(`
//       <h1>${matchedMenu['menu_name(eng)']}</h1>
//       <img src="${matchedMenu['menu_img_url']}" alt="${matchedMenu['menu_name(kor)']} 이미지" style="max-width: 100%;" />
//       <p><strong>Ingredients:</strong> ${matchedMenu['menu_ingredients']}</p>
//       <p><strong>Spicy:</strong> ${matchedMenu['menu_spicy']}</p>
//       <p><strong>Details:</strong> ${matchedMenu['menu_details']}</p>
//     `);
//   } else {
//     res.status(404).send('Menu not found');
//   }
// });

app.get("/details", async (req, res) => {
  const menuKey = req.query.key;
  const menuData = JSON.parse(
    await fs.promises.readFile("./public/example_menu.json", "utf8")
  );
  const matchedMenu = menuData.find(
    (menu) => menu["menu_name(eng)"] === menuKey
  );

  if (matchedMenu) {
    res.json({
      menu_name: matchedMenu["menu_name(eng)"],
      menu_img_url: matchedMenu["menu_img_url"],
      menu_ingredients: matchedMenu["menu_ingredients"],
      menu_spicy: matchedMenu["menu_spicy"],
      menu_details: matchedMenu["menu_details"],
    });
  } else {
    res.status(404).json({ error: "Menu not found" });
  }
});

async function isImageValid(base64Data) {
  try {
    const data = base64Data.replace(/^data:image\/jpeg;base64,/, "");
    const buffer = Buffer.from(data, "base64");
    const metadata = await sharp(buffer).metadata();
    return metadata.hasOwnProperty("format");
  } catch (error) {
    console.error("Error validating image:", error);
    return false;
  }
}

async function saveImage(base64Data) {
  try {
    const fileName = "menu.jpg";
    const filePath = path.join(__dirname, "./public", fileName);
    const data = base64Data.replace(/^data:image\/jpeg;base64,/, "");

    await fs.promises.writeFile(filePath, data, { encoding: "base64" });
    console.log("Image saved:", filePath);
  } catch (error) {
    console.error("Error saving image:", error);
  }
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
