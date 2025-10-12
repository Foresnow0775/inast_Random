// =======================
// タブ切り替え
// =======================
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

function switchTab(targetId) {
    tabButtons.forEach(b => b.classList.remove("active"));
    tabButtons.forEach(b => { if(b.dataset.tab === targetId) b.classList.add("active"); });

    tabContents.forEach(tc => {
        tc.style.display = tc.id === targetId ? "block" : "none";
    });
}

tabButtons.forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

// =======================
// 共通初期化関数（POPUP削除版）
// =======================
function setupTab(tabElement, enableNotSelected = true) {
    const imageList = tabElement.querySelector(".imageList, .imageList2");
    const allImagesContainer = tabElement.querySelector(".allImages, .allImages2");
    const selectedImagesContainer = tabElement.querySelector(".selectedImages, .selectedImages2");
    const notSelectedImagesContainer = enableNotSelected ? tabElement.querySelector(".notSelectedImages, .notSelectedImages2") : null;
    const imageSelect = tabElement.querySelector(".imageSelect, .imageSelect2");
    const addImageButton = tabElement.querySelector(".addImageButton, .addImageButton2");
    const addAllButton = tabElement.querySelector(".addAllButton, .addAllButton2");
    const countInput = tabElement.querySelector(".countInput, .countInput2");
    const showButton = tabElement.querySelector(".showButton, .showButton2");

    let allImages = [];

    function renderListAndAllImages() {
        // 左リスト描画
        imageList.innerHTML = "";
        allImages.forEach((src, index) => {
            const li = document.createElement("li");
            li.draggable = true;
            li.dataset.index = index;

            const img = document.createElement("img");
            img.src = src;

            const option = Array.from(imageSelect.options).find(opt => opt.value === src);
            const displayName = option ? option.textContent : src.split("/").pop();

            const name = document.createElement("span");
            name.textContent = displayName;

            li.appendChild(img);
            li.appendChild(name);

            // 削除ボタン
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "❌";
            removeBtn.addEventListener("click", () => {
                allImages.splice(index, 1);
                renderListAndAllImages();
            });
            li.appendChild(removeBtn);

            // ドラッグ&ドロップ
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

        // 右上全画像
        allImagesContainer.innerHTML = "";
        allImages.forEach(src => {
            const img = document.createElement("img");
            img.src = src;
            allImagesContainer.appendChild(img);
        });
    }

    renderListAndAllImages();

    // 追加ボタン（POPUP削除）
    addImageButton.addEventListener("click", () => {
        const selectedValue = imageSelect.value;
        if (!selectedValue) return; // alert削除
        if (!allImages.includes(selectedValue)) allImages.push(selectedValue);
        renderListAndAllImages();
    });

    // 全追加ボタン
    addAllButton.addEventListener("click", () => {
        Array.from(imageSelect.options)
             .filter(opt => opt.value)
             .forEach(opt => { if (!allImages.includes(opt.value)) allImages.push(opt.value); });
        renderListAndAllImages();
    });

    // ランダム表示ボタン
    showButton.addEventListener("click", () => {
        const count = parseInt(countInput.value);
        if (isNaN(count) || count <= 0) return; // alert削除
        if (count > allImages.length) return;

        const shuffled = [...allImages].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, count);
        const notSelected = enableNotSelected ? shuffled.slice(count) : [];

        // 生存選手表示
        selectedImagesContainer.innerHTML = "";
        selected.forEach(src => {
            const img = document.createElement("img");
            img.src = src;
            selectedImagesContainer.appendChild(img);
        });

        // tab2のみ「チームメンバーに追加」ボタン
        if (!enableNotSelected && selected.length > 0) {
            const existingBtn = selectedImagesContainer.querySelector(".addAllBtn");
            if (existingBtn) existingBtn.remove();

            const addBtn = document.createElement("button");
            addBtn.textContent = "チームメンバーに追加";
            addBtn.classList.add("addAllBtn");
            addBtn.style.display = "block";
            addBtn.style.width = "89%";
            addBtn.style.marginTop = "10px";

            addBtn.addEventListener("click", () => {
                // tab1 にまとめて追加（POPUPなし）
                const tab1 = document.getElementById("tab1");
                const imageSelect1 = tab1.querySelector(".imageSelect");
                const addImageButton1 = tab1.querySelector(".addImageButton");
                selected.forEach(src => {
                    imageSelect1.value = src;
                    addImageButton1.click();
                });
                switchTab("tab1");
            });

            selectedImagesContainer.appendChild(addBtn);
        }

        // tab1のみ引退選手表示
        if (enableNotSelected && notSelectedImagesContainer) {
            notSelectedImagesContainer.innerHTML = "";
            notSelected.forEach(src => {
                const img = document.createElement("img");
                img.src = src;
                notSelectedImagesContainer.appendChild(img);
            });
        }
    });

    return { allImages, renderListAndAllImages };
}

// =======================
// タブごとに初期化
// =======================
document.querySelectorAll(".tab-content").forEach(tab => {
    if (tab.id === "tab2") {
        setupTab(tab, false); // タブ2は引退欄なし
    } else {
        const tab1Data = setupTab(tab, true);  // タブ1は引退欄あり
        window.allImagesTab1 = tab1Data.allImages;
        window.renderTab1 = tab1Data.renderListAndAllImages;
    }
});
