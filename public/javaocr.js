const FormData = require("form-data");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = async function javaocr(base64Data) {
  function saveResultJSON(result, filename) {
    const filePath = path.join("public", filename); // __dirname 변수 제거
    fs.writeFileSync(filePath, JSON.stringify(result, null, 4));
    console.log(`${filePath} 파일에 결과를 저장했습니다.`);
  }

  async function requestWithBase64() {
    try {
      const res = await axios.post(
        "https://his2mv8t58.apigw.ntruss.com/custom/v1/24361/8e4fba23a04694f73fda8619cd83761b24305c1f18d3533dd32560a9f95cdf5e/general", // APIGW Invoke URL
        {
          images: [
            {
              format: "jpg", // file format
              name: "menu", // image name
              data: base64Data, // 이미지 base64 데이터
            },
          ],
          requestId: "string", // unique string
          timestamp: 0,
          version: "V2",
        },
        {
          headers: {
            "X-OCR-SECRET": "SGFWbFdkWXRIYkpDVUNjaXJuaExZRmtIdXhPV1Z0U1I=", // Secret Key
          },
        }
      );
      return res;
    } catch (error) {
      console.warn("requestWithBase64 error", error.response);
      return false;
    }
  }
  const result = await requestWithBase64();
  console.log("result:", result.data.images[0].fields);
  return result;

  /*
  function requestWithFile() {
    console.log("withFile");
    const imagePath = "./public/menu.jpg"; // 이미지 파일 경로
    const file = fs.createReadStream(imagePath); // image file object.
    const message = {
      images: [
        {
          format: "jpg", // file format
          name: "menu", // file name
        },
      ],
      requestId: "string", // unique string
      timestamp: 0,
      version: "V2",
    };
    const formData = new FormData();

    formData.append("file", file);
    formData.append("message", JSON.stringify(message));

    axios
      .post(
        "https://his2mv8t58.apigw.ntruss.com/custom/v1/24361/8e4fba23a04694f73fda8619cd83761b24305c1f18d3533dd32560a9f95cdf5e/general", // APIGW Invoke URL
        formData,
        {
          headers: {
            "X-OCR-SECRET": "SGFWbFdkWXRIYkpDVUNjaXJuaExZRmtIdXhPV1Z0U1I=", // Secret Key
            ...formData.getHeaders(),
          },
        }
      )
      .then((res) => {
        if (res.status === 200) {
          console.log("requestWithFile response:", res.data);

          /*console.log("JSON 결과:\n", JSON.stringify(res.data, null, 4));
          saveResultJSON(res.data, "result_file.json");
        }
      })
      .catch((e) => {
        console.error("requestWithFile 에러:", e.message);
        console.error("requestWithFile Stack:", e.stack);
        console.warn("requestWithFile error response", e.response);
      });
  }
  */

  //requestWithFile();
};
