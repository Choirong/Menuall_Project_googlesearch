const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const javaocr = require("./javaocr");
const translation = require("../frontend/frontend");

const app = express();
app.use(express.static(path.join(__dirname, "../frontend")));

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
  // res.render("test");
});

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const base64Data = req.file.buffer.toString("base64");
    const dataUri = `data:image/jpeg;base64,${base64Data}`;

    const isValid = await isImageValid(dataUri);
    if (isValid) {
      await javaocr(base64Data)
        .then((response) => {
          res.status(200).send(response);
        })
        .catch((err) => res.status(400).send(err));
    } else {
      res.status(400).send("Invalid image data");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/trans", (req, res) => {
  translation(req);
});

// app.get("/menu", (req, res) => {
//   res.sendFile(path.join(__dirname, "frontend", "index2.html"));
// });

// app.get("/detail", (req, res) => {
//   res.sendFile(path.join(__dirname, "frontend", "detail.html"));
// });

app.get("/details", async (req, res) => {
  const menuKey = req.query.key;
  const menuData = JSON.parse(
    await fs.promises.readFile("./DB/menu_DB.json", "utf8")
  );
  const matchedMenu = menuData.find((menu) => menu["menu_name_en"] === menuKey);

  if (matchedMenu) {
    res.json({
      menu_name_kor: matchedMenu["menu_name_ko"],
    });
  } else {
    res.status(404).json({ error: "Menu not found" });
  }
});

// app.get("/details", async (req, res) => {
//   const menuKey = req.query.key;
//   const menuData = JSON.parse(
//     await fs.promises.readFile("./frontend/menu_DB.json", "utf8")
//   );
//   const matchedMenu = menuData.find(
//     (menu) => menu["menu_name(eng)"] === menuKey
//   );

//   if (matchedMenu) {
//     res.json({
//       menu_name: matchedMenu["menu_name(eng)"],
//       menu_img_url: matchedMenu["menu_img_url"],
//       menu_ingredients: matchedMenu["menu_ingredients"],
//       menu_spicy: matchedMenu["menu_spicy"],
//       menu_details: matchedMenu["menu_details"],
//     });
//   } else {
//     res.status(404).json({ error: "Menu not found" });
//   }
// });

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

// 서버에 menu.jpg를 저장했던 코드
// async function saveImage(base64Data) {
//   try {
//     const fileName = "menu.jpg";
//     const filePath = path.join(__dirname, "./frontend", fileName);
//     const data = base64Data.replace(/^data:image\/jpeg;base64,/, "");

//     //await fs.promises.writeFile(filePath, data, { encoding: "base64" });
//     console.log(base64Data);
//     console.log("Image saved:", filePath);
//   } catch (error) {
//     console.error("Error saving image:", error);
//   }
// }

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
