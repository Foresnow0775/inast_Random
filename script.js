const imageList = document.getElementById("imageList");
const allImagesContainer = document.getElementById("allImages");
const selectedImagesContainer = document.getElementById("selectedImages");
const notSelectedImagesContainer = document.getElementById("notSelectedImages");
const select = document.getElementById("imageSelect");
const addImageButton = document.getElementById("addImageButton");
const addAllButton = document.getElementById("addAllButton");
const countInput = document.getElementById("countInput");
const showButton = document.getElementById("showButton");

fetch("https://raw.githubusercontent.com/Foresnow0775/inast_Random/refs/heads/main/images.json")
  .then(response => response.json())
  .then(images => {
    images.forEach(path => {
      const name = path.split("/").pop(); // ファイル名だけ取り出す

      // プルダウンに追加
      const option = document.createElement("option");
      option.value = path;
      option.textContent = name;
      option.setAttribute("data-name", name);
      select.appendChild(option);

      // 全画像表示用にも追加
      const img = document.createElement("img");
      img.src = path;
      img.alt = name;
      allImagesContainer.appendChild(img);
    });
  })
  .catch(err => console.error("画像一覧の取得に失敗:", err));

// =======================
// 描画関数
// =======================
function renderListAndAllImages() {
  // ---- 左リスト ----
  imageList.innerHTML = "";
  allImages.forEach((src, index) => {
    const li = document.createElement("li");
    li.draggable = true;
    li.dataset.index = index;

    const img = document.createElement("img");
    img.src = src;
    const name = document.createElement("span");
    name.textContent = src.split("/").pop();
    li.appendChild(img);
    li.appendChild(name);

    // 削除ボタン
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";
    removeBtn.style.marginLeft = "auto";
    removeBtn.addEventListener("click", () => {
      allImages.splice(index, 1);
      renderListAndAllImages();
    });
    li.appendChild(removeBtn);

    // ===== ドラッグ＆ドロップ（赤線挿入） =====
    li.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", index);
      e.dataTransfer.effectAllowed = "move";
    });

    li.addEventListener("dragover", (e) => {
      e.preventDefault();
      const rect = li.getBoundingClientRect();
      const offset = e.clientY - rect.top;
      if (offset < rect.height / 2) {
        li.style.borderTop = "2px solid red";
        li.style.borderBottom = "";
      } else {
        li.style.borderTop = "";
        li.style.borderBottom = "2px solid red";
      }
    });

    li.addEventListener("dragleave", () => {
      li.style.borderTop = "";
      li.style.borderBottom = "";
    });

    li.addEventListener("drop", (e) => {
      e.preventDefault();
      li.style.borderTop = "";
      li.style.borderBottom = "";

      const draggedIndex = parseInt(e.dataTransfer.getData("text/plain"));
      let targetIndex = parseInt(li.dataset.index);
      const rect = li.getBoundingClientRect();
      const offset = e.clientY - rect.top;
      if (offset >= rect.height / 2) targetIndex += 1;

      if (draggedIndex === targetIndex || draggedIndex + 1 === targetIndex) return;

      const draggedItem = allImages[draggedIndex];
      allImages.splice(draggedIndex, 1);
      if (targetIndex > allImages.length) targetIndex = allImages.length;
      allImages.splice(targetIndex, 0, draggedItem);

      renderListAndAllImages();
    });

    imageList.appendChild(li);
  });

  // ---- 右上全画像 ----
  allImagesContainer.innerHTML = "";
  allImages.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    allImagesContainer.appendChild(img);
  });
}

// 初期描画
window.addEventListener("DOMContentLoaded", renderListAndAllImages);

// =======================
// 追加ボタン
// =======================
addImageButton.addEventListener("click", () => {
  const selectedValue = imageSelect.value;
  if (!selectedValue) {
    alert("画像を選択してください");
    return;
  }
  if (allImages.includes(selectedValue)) {
    alert("既に追加済みです");
    return;
  }
  allImages.push(selectedValue);
  renderListAndAllImages();
});

addAllButton.addEventListener("click", () => {
  const options = Array.from(imageSelect.options)
                       .filter(opt => opt.value); // 空値除外
  options.forEach(opt => {
    if (!allImages.includes(opt.value)) {
      allImages.push(opt.value);
    }
  });
  renderListAndAllImages();
});

// =======================
// ランダム表示ボタン
// =======================
showButton.addEventListener("click", () => {
  const count = parseInt(countInput.value);
  if (isNaN(count) || count <= 0) {
    alert("1以上の数値を入力してください");
    return;
  }

  if (count > allImages.length) {
    alert(`画像は全部で${allImages.length}枚しかありません`);
    return;
  }

  const shuffled = [...allImages].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);
  const notSelected = shuffled.slice(count);

  selectedImagesContainer.innerHTML = "";
  notSelectedImagesContainer.innerHTML = "";

  selected.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    selectedImagesContainer.appendChild(img);
  });

  notSelected.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    notSelectedImagesContainer.appendChild(img);
  });
});
