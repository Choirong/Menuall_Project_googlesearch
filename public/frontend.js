fetch("./result_file.json")
  .then((response) => response.json())
  .then((data) => {
    if (data && data.images && data.images[0] && data.images[0].fields) {
      data.images[0].fields.forEach(drawResultItems);
    } else {
      console.error("에러: fields 속성이 없습니다.");
    }
  })
  .catch((error) => {
    console.error("에러:", error);
  });

async function getMenuInfo(text) {
  const menuData = await fetch("./example_menu.json").then((response) =>
    response.json()
  );
  const matchedMenu = menuData.find((menu) => menu["menu_name_ko"] === text);
  return matchedMenu;
}

async function drawResultItems(item) {
  const vertices = item.boundingPoly.vertices;
  const text = item.inferText;

  const imageContainer = document.querySelector("#imageContainer");

  const minX = Math.min(
    vertices[0].x,
    vertices[1].x,
    vertices[2].x,
    vertices[3].x
  );
  const minY = Math.min(
    vertices[0].y,
    vertices[1].y,
    vertices[2].y,
    vertices[3].y
  );
  const maxX = Math.max(
    vertices[0].x,
    vertices[1].x,
    vertices[2].x,
    vertices[3].x
  ); // 추가
  const maxY = Math.max(
    vertices[0].y,
    vertices[1].y,
    vertices[2].y,
    vertices[3].y
  ); // 추가
  const avgX = (minX + maxX) / 2; // 추가
  const avgY = (minY + maxY) / 2; // 추가

  const width = Math.abs(vertices[0].x - vertices[1].x);
  const height = Math.abs(vertices[0].y - vertices[2].y);

  // 텍스트 생성
  const overlayText = document.createElement("div");
  overlayText.className = "overlayText";
  overlayText.textContent = text;
  overlayText.style.left = `${minX}px`;
  overlayText.style.top = `${minY - 20}px`;

  // 버튼 생성
  const overlayButton = document.createElement("button");
  overlayButton.className = "overlayButton";
  const matchedMenu = await getMenuInfo(text);

  // "메뉴"를 인식해서 박스에 "MENU"를 표시
  if (text.includes("매뉴")) {
    const minX = Math.min(
      vertices[0].x,
      vertices[1].x,
      vertices[2].x,
      vertices[3].x
    );
    const minY = Math.min(
      vertices[0].y,
      vertices[1].y,
      vertices[2].y,
      vertices[3].y
    );

    const width = Math.abs(vertices[0].x - vertices[1].x);
    const height = Math.abs(vertices[0].y - vertices[2].y);

    const imageContainer = document.querySelector("#imageContainer");

    // 바운딩 박스 생성
    const menuboundingBox = document.createElement("div");
    menuboundingBox.className = "menuboundingBox";
    menuboundingBox.style.left = `${minX}px`;
    menuboundingBox.style.top = `${minY}px`;
    menuboundingBox.style.width = `${width}px`;
    menuboundingBox.style.height = `${height}px`;
    imageContainer.appendChild(menuboundingBox);

    // 'MENU' 텍스트 생성 및 추가
    const menuText = document.createElement("span");
    menuText.className = "menuText";
    menuText.textContent = "MENU";
    menuText.style.position = "absolute";
    menuText.style.left = `${avgX}px`;
    menuText.style.top = `${avgY}px`;
    imageContainer.appendChild(menuText);
  }

  // example_menu.json에 있는 메뉴만 버튼 생성
  if (matchedMenu) {
    // 영어 메뉴 이름 표시
    overlayButton.textContent = matchedMenu["menu_name_en)"];
    overlayButton.style.left = `${minX + 20}px`;
    overlayButton.style.top = `${minY}px`;
    overlayButton.style.width = `${width * 0.8}px`;
    overlayButton.style.height = `${height * 0.8}px`;

    // 버튼 클릭 이벤트 처리
    overlayButton.addEventListener("click", () => {
      const encodedName = encodeURIComponent(matchedMenu["menu_name_ko"]);
      //이미지탭으로 연결
      window.open(
        `https://www.google.com/search?tbm=isch&q=${encodedName}`,
        "_blank"
      );

      //그냥 검색(전체 검색탭)
      // window.open(`https://www.google.com/search?q=${encodedName}`, "_blank");
    });

    imageContainer.appendChild(overlayText);
    imageContainer.appendChild(overlayButton);
  } else {
    // 메뉴 진행 중임을 알림
    //alert(`Oops!! "${text}" 메뉴가 아직 준비되지 않았어요! 죄송합니다.`);
  }
}
