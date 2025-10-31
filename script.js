function playSound(type = "click") {
  const sounds = {
    add: "sounds/01_add.wav",
    delete: "sounds/02_delete.wav",
    click: "sounds/03_click.wav",
    confirm: "sounds/04_confirm.wav"
  };
  const audio = new Audio(sounds[type] || sounds.click);
  audio.volume = 0.8; // 音量調整（0〜1）

  // ✅ 再生を非同期化（ブラウザ制限対策）
  setTimeout(() => {
    audio.currentTime = 0;
    audio.play().catch(err => console.log("Audio play blocked:", err));
  }, 0);
}

// =======================
// タブ切り替え
// =======================
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

function switchTab(targetId) {
  tabButtons.forEach(b => b.classList.remove("active"));
  tabButtons.forEach(b => {
    if (b.dataset.tab === targetId) b.classList.add("active");
  });

  tabContents.forEach(tc => {
    tc.style.display = tc.id === targetId ? "block" : "none";
  });
}

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

// =======================
// 共通初期化関数
// =======================
function setupTab(tabElement, enableNotSelected = true) {
  const imageList = tabElement.querySelector(".imageList, .imageList2");
  const allImagesContainer = tabElement.querySelector(".allImages, .allImages2");
  const selectedImagesContainer = tabElement.querySelector(".selectedImages, .selectedImages2");
  const notSelectedImagesContainer = enableNotSelected
    ? tabElement.querySelector(".notSelectedImages, .notSelectedImages2")
    : null;
  const imageSelect = tabElement.querySelector(".imageSelect, .imageSelect2");
  const addImageButton = tabElement.querySelector(".addImageButton, .addImageButton2");
  const addAllButton = tabElement.querySelector(".addAllButton, .addAllButton2");
  const countInput = tabElement.querySelector(".countInput, .countInput2");
  const showButton = tabElement.querySelector(".showButton, .showButton2");

  let allImages = [];

  // 🧩 全optionデータを保持しておく（検索で壊れないように）
  const allOptionsData = Array.from(imageSelect.options)
    .filter(opt => opt.value)
    .map(opt => ({ value: opt.value, text: opt.textContent }));

  function renderListAndAllImages() {
    imageList.innerHTML = "";
    allImages.forEach((src, index) => {
      const li = document.createElement("li");
      li.draggable = true;
      li.dataset.index = index;

      const img = document.createElement("img");
      img.src = src;

      const optionData = allOptionsData.find(opt => opt.value === src);
      const displayName = optionData ? optionData.text : src.split("/").pop();

      const name = document.createElement("span");
      name.textContent = displayName;

      li.appendChild(img);
      li.appendChild(name);

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "❌";
      removeBtn.addEventListener("click", () => {
        playSound("delete");
        allImages.splice(index, 1);
        renderListAndAllImages();
      });
      li.appendChild(removeBtn);

      // ドラッグ＆ドロップ並び替え
      li.addEventListener("dragstart", e => {
        e.dataTransfer.setData("text/plain", index);
        e.dataTransfer.effectAllowed = "move";
      });
      li.addEventListener("dragover", e => {
        e.preventDefault();
        const rect = li.getBoundingClientRect();
        const offset = e.clientY - rect.top;
        li.style.borderTop = offset < rect.height / 2 ? "2px solid red" : "";
        li.style.borderBottom = offset >= rect.height / 2 ? "2px solid red" : "";
      });
      li.addEventListener("dragleave", () => {
        li.style.borderTop = "";
        li.style.borderBottom = "";
      });
      li.addEventListener("drop", e => {
        e.preventDefault();
        li.style.borderTop = "";
        li.style.borderBottom = "";
        const draggedIndex = parseInt(e.dataTransfer.getData("text/plain"));
        let targetIndex = parseInt(li.dataset.index);
        const rect = li.getBoundingClientRect();
        if (e.clientY - rect.top >= rect.height / 2) targetIndex += 1;
        if (draggedIndex === targetIndex || draggedIndex + 1 === targetIndex) return;
        const draggedItem = allImages[draggedIndex];
        allImages.splice(draggedIndex, 1);
        if (targetIndex > allImages.length) targetIndex = allImages.length;
        allImages.splice(targetIndex, 0, draggedItem);
        renderListAndAllImages();
      });

      imageList.appendChild(li);
    });

    allImagesContainer.innerHTML = "";
    allImages.forEach(src => {
      const img = document.createElement("img");
      img.src = src;
      allImagesContainer.appendChild(img);
    });
  }

  // =======================
  // 検索機能付き select
  // =======================
  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  imageSelect.parentNode.insertBefore(wrapper, imageSelect);
  wrapper.appendChild(imageSelect);

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "選手名を入力して検索...";
  input.style.width = "100%";
  input.style.padding = "6px";
  input.style.marginBottom = "5px";
  input.style.border = "1px solid #ccc";
  input.style.borderRadius = "6px";
  input.style.boxSizing = "border-box";
  wrapper.insertBefore(input, imageSelect);

  imageSelect.style.width = "100%";
  imageSelect.style.marginTop = "5px";

  function updateSelect(filter = "") {
    imageSelect.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "選手を選択してください";
    imageSelect.appendChild(defaultOption);

    allOptionsData.forEach(({ value, text }) => {
      if (text.toLowerCase().includes(filter.toLowerCase())) {
        const opt = document.createElement("option");
        opt.value = value;
        opt.textContent = text;
        imageSelect.appendChild(opt);
      }
    });
  }

  input.addEventListener("input", () => {
    updateSelect(input.value);
    if (imageSelect.options.length > 1) imageSelect.selectedIndex = 1;
  });
  input.addEventListener("focus", () => updateSelect());
  updateSelect();

  if (countInput) {
    countInput.addEventListener("input", () => {
      playSound("click");
    });
  }

  // =======================
  // ボタン動作
  // =======================
  function addImageByValue(value) {
    if (!value) return;
    if (!allImages.includes(value)) allImages.push(value);
    renderListAndAllImages();
  }

  addImageButton.addEventListener("click", () => {
    playSound("add");
    addImageByValue(imageSelect.value);
  });

  addAllButton.addEventListener("click", () => {
    playSound("add");
    const visibleOptions = Array.from(imageSelect.options)
      .map(opt => opt.value)
      .filter(v => v);
    visibleOptions.forEach(v => addImageByValue(v));
  });

    let deleteAllButton = null;
    if (!enableNotSelected) {
        deleteAllButton = document.createElement("button");
        deleteAllButton.textContent = "全て削除";
        deleteAllButton.style.marginRight = "10px";
        deleteAllButton.style.background = "#dc3545";
        deleteAllButton.style.color = "white";
        deleteAllButton.style.border = "none";
        deleteAllButton.style.borderRadius = "6px";
        deleteAllButton.style.padding = "6px 10px";
        deleteAllButton.style.cursor = "pointer";

        // addAllButtonの左に追加
        addAllButton.parentNode.insertBefore(deleteAllButton, addAllButton.nextSibling);

        deleteAllButton.addEventListener("click", () => {
        allImages = [];
        renderListAndAllImages();
        });
    }

  showButton.addEventListener("click", () => {
    playSound("confirm");
    const count = parseInt(countInput.value);
    if (isNaN(count) || count <= 0) return;
    if (count > allImages.length) return;

    const shuffled = [...allImages].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    const notSelected = enableNotSelected ? shuffled.slice(count) : [];

    selectedImagesContainer.innerHTML = "";
    selected.forEach(src => {
      const img = document.createElement("img");
      img.src = src;
      selectedImagesContainer.appendChild(img);
    });

    // tab2のみ「チームメンバーに追加」
    if (!enableNotSelected && selected.length > 0) {
      const addBtn = document.createElement("button");
      addBtn.textContent = "チームメンバーに追加";
      addBtn.classList.add("addAllBtn");
      addBtn.style.display = "block";
      addBtn.style.width = "89%";
      addBtn.style.marginTop = "10px";

      addBtn.addEventListener("click", () => {
        playSound("confirm"); // ←これが確実に鳴る
        selected.forEach(src => tabsData["tab1"].addImageByValue(src));
        switchTab("tab1");
      });

      selectedImagesContainer.appendChild(addBtn);
    }

    if (enableNotSelected && notSelectedImagesContainer) {
      notSelectedImagesContainer.innerHTML = "";
      notSelected.forEach(src => {
        const img = document.createElement("img");
        img.src = src;
        notSelectedImagesContainer.appendChild(img);
      });
    }

    // tab1のみ「反映」ボタン
    if (enableNotSelected && selected.length > 0) {
      const reflectBtn = document.createElement("button");
      reflectBtn.textContent = "反映";
      reflectBtn.style.fontWeight = "bold";
      reflectBtn.classList.add("reflectBtn");
      reflectBtn.style.display = "block";
      reflectBtn.style.width = "89%";
      reflectBtn.style.marginTop = "10px";
      reflectBtn.style.background = "#0078d7";
      reflectBtn.style.color = "white";
      reflectBtn.style.border = "none";
      reflectBtn.style.borderRadius = "6px";
      reflectBtn.style.padding = "6px 0";
      reflectBtn.style.cursor = "pointer";

      reflectBtn.addEventListener("click", () => {
        playSound("confirm"); // ←同じく最初に
        allImages = [...selected];
        renderListAndAllImages();
        selectedImagesContainer.innerHTML = "";
        notSelectedImagesContainer.innerHTML = "";
      });

      selectedImagesContainer.appendChild(reflectBtn);
    }
  });

  return { allImages, renderListAndAllImages, addImageByValue };
}

// =======================
// 各タブ初期化
// =======================
const tabsData = {};
document.querySelectorAll(".tab-content").forEach(tab => {
  tabsData[tab.id] = setupTab(tab, tab.id === "tab1");
});
