document.addEventListener("DOMContentLoaded", () => {
   const imageUpload = document.getElementById("image-upload");
   const dropZone = document.getElementById("drop-zone");
   const image = document.getElementById("image");
   const imageContainer = document.getElementById("image-container");
   const coordinatesLeft = document.getElementById("coordinatesLeft");
   const coordinatesTop = document.getElementById("coordinatesTop");
   const imagePositionInput = document.getElementById("imagePosition");
   const clickHistory = document.getElementById("clickHistory");
   const dimensionsInput = document.getElementById("dimensions");
   const clearBtn = document.getElementById("clear-btn");
   const copyBtn = document.getElementById("copy-btn");
   const downloadBtn = document.getElementById("download-btn");
   const historyBody = document.getElementById("history-body");
   const pointContainer = document.getElementById("point-container");

   let imageWidth = 0,
      imageHeight = 0;
   let clicks = [];

   // Drag & drop handling
   dropZone.addEventListener("click", () => imageUpload.click());
   dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("dragover");
   });
   dropZone.addEventListener("dragleave", () =>
      dropZone.classList.remove("dragover")
   );
   dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (file) handleImage(file);
   });
   imageUpload.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) handleImage(file);
   });

   function handleImage(file) {
      const reader = new FileReader();
      reader.onload = function (e) {
         image.onload = function () {
            imageWidth = image.naturalWidth;
            imageHeight = image.naturalHeight;
            dimensionsInput.innerHTML = `Width: <b>${imageWidth}px</b> | Height: <b>${imageHeight}px</b>`;
         };
         image.src = e.target.result;
         image.style.display = "block";
      };
      reader.readAsDataURL(file);

      pointContainer.classList.remove('hidden');
      dropZone.classList.add('hidden');
   }

   // Clear image
   clearBtn.addEventListener("click", () => {
      image.src = "";
      image.style.display = "none";
      coordinatesLeft.value = "";
      coordinatesTop.value = "";
      dimensionsInput.innerHTML = "";
      imageUpload.value = "";
      historyBody.innerHTML = "";
      clicks = [];
      pointContainer.classList.add('hidden');
      imagePositionInput.classList.add('hidden');
      clickHistory.classList.add('hidden');
      dropZone.classList.remove('hidden');
      document.querySelectorAll('.marker').forEach(marker => marker.remove());
   });

   // Click for coordinates
   image.addEventListener("click", (event) => {
      const rect = image.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;

      const percentX = Math.round((x * 100) / imageWidth);
      const percentY = Math.round((y * 100) / imageHeight);

      coordinatesLeft.value = percentX;
      coordinatesTop.value = percentY;

      imagePositionInput.classList.remove('hidden');
      imagePositionInput.innerHTML = `Left (%): <b>${percentX}px</b> | Top (%): <b>${percentY}px</b>`;
      clickHistory.classList.remove('hidden');

      // Marker
      const markerID = Math.round(Math.random() * 1000000);
      const marker = document.createElement("div");
      marker.classList.add("marker");
      marker.id = `marker-${markerID}`;
      marker.style.left = `${x}px`;
      marker.style.top = `${y}px`;
      imageContainer.appendChild(marker);

      // Save history
      clicks.push({
         percentX,
         percentY,
         x: Math.round(x),
         y: Math.round(y),
         markerID
      });
      renderHistory();
   });

   function renderHistory() {
      historyBody.innerHTML = clicks
         .map(
            (c, i) => `
              <tr class="row-${c.markerID}">
                <td>${c.percentX}%</td>
                <td>${c.percentY}%</td>
                <td>${c.x}px</td>
                <td>${c.y}px</td>
                <td><button class="remove-btn btn btn-outline-danger btn-sm" data-index="${i}" data-marker="${c.markerID}">&times; Remove</button></td>
              </tr>`
         )
         .join("");

      // attach remove listeners
      document.querySelectorAll(".remove-btn").forEach((btn) => {
         btn.addEventListener("click", (e) => {
            const index = e.target.dataset.index;
            clicks.splice(index, 1);

            const markerId = e.target.dataset.marker;
            const marker = document.querySelector(`#marker-${markerId}`);
            if (marker) marker.remove();

            renderHistory();

         });
      });
   }

   // Copy to clipboard
   copyBtn.addEventListener("click", () => {
      const text = `Left: ${coordinatesLeft.value}%, Top: ${coordinatesTop.value}%`;
      navigator.clipboard.writeText(text).then(() => {
         alert("Coordinates copied!");
      });
   });

   // Download CSV
   downloadBtn.addEventListener("click", () => {
      if (clicks.length === 0) return alert("No click data available.");
      let csv = "Left(%),Top(%),X(px),Y(px)\n";
      clicks.forEach(
         (c) => (csv += `${c.percentX},${c.percentY},${c.x},${c.y}\n`)
      );
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "click_data.csv";
      a.click();
      URL.revokeObjectURL(url);
   });
});