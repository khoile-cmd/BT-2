"use strict";

const STORAGE_KEY = "weather-travel-planner-v1";
const EXIT_ANIMATION_MS = 220;

const cities = [
  { id: "bien-hoa", name: "Biên Hòa", temperature: 32, humidity: 68, condition: "Nắng", type: "sunny", icon: "☀️" },
  { id: "da-lat", name: "Đà Lạt", temperature: 18, humidity: 82, condition: "Mây", type: "cloudy", icon: "☁️" },
  { id: "vung-tau", name: "Vũng Tàu", temperature: 27, humidity: 76, condition: "Mưa", type: "rainy", icon: "🌧️" },
  { id: "ha-noi", name: "Hà Nội", temperature: 24, humidity: 72, condition: "Mây", type: "cloudy", icon: "☁️" },
  { id: "da-nang", name: "Đà Nẵng", temperature: 30, humidity: 70, condition: "Nắng", type: "sunny", icon: "☀️" },
  { id: "tp-ho-chi-minh", name: "TP. Hồ Chí Minh", temperature: 31, humidity: 74, condition: "Mây", type: "cloudy", icon: "☁️" }
];

const destinationBackgrounds = {
  "bien-hoa": "images/bien-hoa.jpg",
  "da-lat": "images/da-lat.jpg",
  "vung-tau": "images/vung-tau.jpg",
  "ha-noi": "images/ha-noi.jpg",
  "da-nang": "images/da-nang.jpg",
  "tp-ho-chi-minh": "images/tp-ho-chi-minh.jpg"
};

const destinationBackgroundPositions = {
  "bien-hoa": "43% center",
  "da-lat": "50% center",
  "vung-tau": "54% center",
  "ha-noi": "50% center",
  "da-nang": "50% center",
  "tp-ho-chi-minh": "52% center"
};

const elements = {
  message: document.querySelector("#app-message"),
  citySelect: document.querySelector("#city-select"),
  weatherCard: document.querySelector("#weather-card"),
  weatherCity: document.querySelector("#weather-city"),
  weatherCondition: document.querySelector("#weather-condition"),
  weatherIcon: document.querySelector("#weather-icon"),
  weatherTemperature: document.querySelector("#weather-temperature"),
  weatherHumidity: document.querySelector("#weather-humidity"),
  weatherSummary: document.querySelector("#weather-summary"),
  smartSuggestion: document.querySelector("#smart-suggestion"),
  departureDate: document.querySelector("#departure-date"),
  countdownReadout: document.querySelector("#countdown-readout"),
  itineraryForm: document.querySelector("#itinerary-form"),
  placeName: document.querySelector("#place-name"),
  visitTime: document.querySelector("#visit-time"),
  searchPlace: document.querySelector("#search-place"),
  statusFilter: document.querySelector("#status-filter"),
  sortOrder: document.querySelector("#sort-order"),
  pageSize: document.querySelector("#page-size"),
  itineraryList: document.querySelector("#itinerary-list"),
  pageSummary: document.querySelector("#page-summary"),
  pageIndicator: document.querySelector("#page-indicator"),
  previousPage: document.querySelector("#previous-page"),
  nextPage: document.querySelector("#next-page"),
  exportButton: document.querySelector("#export-button")
};

let state = {
  cityId: cities[0].id,
  departureDate: "",
  itinerary: []
};
let currentPage = 1;
let messageTimer;
let activeBackgroundLayer = "a";
let activeBackgroundCityId = cities[0].id;
let backgroundRequestId = 0;

function showMessage(message) {
  elements.message.textContent = message;
  elements.message.hidden = false;
  window.clearTimeout(messageTimer);
  messageTimer = window.setTimeout(() => {
    elements.message.hidden = true;
  }, 6000);
}

function isValidEntry(entry) {
  return entry !== null
    && typeof entry === "object"
    && typeof entry.id === "string"
    && typeof entry.name === "string"
    && entry.name.trim().length > 0
    && typeof entry.visitTime === "string"
    && !Number.isNaN(Date.parse(entry.visitTime))
    && typeof entry.visited === "boolean";
}

function loadState() {
  let saved;

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (storedValue === null) {
      return;
    }
    saved = JSON.parse(storedValue);
  } catch (error) {
    showMessage("Không thể đọc dữ liệu đã lưu. Ứng dụng sẽ dùng dữ liệu mặc định trên trang này.");
    console.error("Unable to load planner data from localStorage.", error);
    return;
  }

  if (saved === null || typeof saved !== "object" || Array.isArray(saved)) {
    showMessage("Dữ liệu đã lưu không đúng định dạng. Ứng dụng sẽ dùng dữ liệu mặc định trên trang này.");
    return;
  }

  if (typeof saved.cityId === "string" && cities.some((city) => city.id === saved.cityId)) {
    state.cityId = saved.cityId;
  }

  if (typeof saved.departureDate === "string"
      && (saved.departureDate === "" || !Number.isNaN(Date.parse(`${saved.departureDate}T00:00:00`)))) {
    state.departureDate = saved.departureDate;
  }

  if (Array.isArray(saved.itinerary)) {
    const validEntries = saved.itinerary.filter(isValidEntry);
    if (validEntries.length !== saved.itinerary.length) {
      showMessage("Một số mục lịch trình đã lưu không hợp lệ nên không được khôi phục.");
    }
    state.itinerary = validEntries;
  } else if (saved.itinerary !== undefined) {
    showMessage("Danh sách lịch trình đã lưu không hợp lệ nên không được khôi phục.");
  }
}

function saveState() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    showMessage("Không thể lưu thay đổi vào trình duyệt. Hãy kiểm tra quyền lưu trữ hoặc dung lượng trống.");
    console.error("Unable to save planner data to localStorage.", error);
  }
}

function getSmartSuggestion(city) {
  if (city.temperature < 15) {
    return "Trời khá lạnh, hãy mang theo áo len hoặc áo khoác ấm.";
  }
  if (city.temperature > 30) {
    return "Trời nóng, nhớ mang kính râm, kem chống nắng và uống đủ nước.";
  }
  if (city.type === "rainy") {
    return "Có mưa, đừng quên áo mưa hoặc ô gọn nhẹ cho hành trình.";
  }
  if (city.type === "cloudy") {
    return "Trời nhiều mây dịu mát, một chiếc áo khoác mỏng sẽ rất tiện.";
  }
  return "Thời tiết khá dễ chịu, hãy chọn trang phục thoải mái và mang nước nhé.";
}

function updateDestinationBackground(city) {
  const imagePath = destinationBackgrounds[city.id];
  const backgroundPosition = destinationBackgroundPositions[city.id];
  if (!imagePath || !backgroundPosition) {
    showMessage(`Chưa có ảnh nền cho ${city.name}; ảnh hiện tại được giữ nguyên.`);
    console.error(`Missing destination background for city "${city.id}".`);
    return;
  }

  const requestId = ++backgroundRequestId;
  if (city.id === activeBackgroundCityId) {
    return;
  }

  const image = new Image();
  image.onload = () => {
    if (requestId !== backgroundRequestId) {
      return;
    }

    const nextLayer = activeBackgroundLayer === "a" ? "b" : "a";
    document.body.style.setProperty(`--destination-background-${nextLayer}`, `url("../${imagePath}")`);
    document.body.style.setProperty(`--destination-background-position-${nextLayer}`, backgroundPosition);
    document.body.dataset.backgroundLayer = nextLayer;
    activeBackgroundLayer = nextLayer;
    activeBackgroundCityId = city.id;
  };
  image.onerror = () => {
    if (requestId !== backgroundRequestId) {
      return;
    }
    showMessage(`Không tải được ảnh nền cho ${city.name}; ảnh nền hiện tại được giữ nguyên.`);
    console.error(`Unable to load destination background "${imagePath}".`);
  };
  image.src = imagePath;
}

function renderWeather() {
  const city = cities.find((item) => item.id === state.cityId);
  if (!city) {
    showMessage("Không tìm thấy dữ liệu cho thành phố đang chọn.");
    return;
  }

  elements.citySelect.value = city.id;
  elements.weatherCard.dataset.condition = city.type;
  elements.weatherCity.textContent = city.name;
  elements.weatherCondition.textContent = city.condition;
  elements.weatherIcon.textContent = city.icon;
  elements.weatherTemperature.textContent = String(city.temperature);
  elements.weatherHumidity.textContent = `${city.humidity}%`;
  elements.weatherSummary.textContent = city.condition;
  elements.smartSuggestion.textContent = getSmartSuggestion(city);
  updateDestinationBackground(city);
}

function createEntryElement(entry) {
  const item = document.createElement("article");
  item.className = `itinerary-item${entry.visited ? " is-visited" : ""}`;
  item.dataset.id = entry.id;

  const checkbox = document.createElement("input");
  checkbox.className = "visit-toggle";
  checkbox.type = "checkbox";
  checkbox.checked = entry.visited;
  checkbox.setAttribute("aria-label", `${entry.visited ? "Bỏ đánh dấu đã đến" : "Đánh dấu đã đến"}: ${entry.name}`);
  checkbox.dataset.action = "toggle";

  const copy = document.createElement("div");
  copy.className = "itinerary-item-copy";

  const name = document.createElement("span");
  name.className = "itinerary-place";
  name.textContent = entry.name;
  copy.append(name);

  const time = document.createElement("time");
  time.className = "itinerary-time";
  time.dateTime = entry.visitTime;
  time.textContent = new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(entry.visitTime));
  copy.append(time);

  if (entry.visited) {
    const badge = document.createElement("span");
    badge.className = "visited-badge";
    badge.textContent = "ĐÃ ĐẾN";
    copy.append(badge);
  }

  const deleteButton = document.createElement("button");
  deleteButton.className = "button button-delete";
  deleteButton.type = "button";
  deleteButton.textContent = "Xóa";
  deleteButton.setAttribute("aria-label", `Xóa ${entry.name} khỏi lịch trình`);
  deleteButton.dataset.action = "delete";

  item.append(checkbox, copy, deleteButton);
  return item;
}

function getFilteredEntries() {
  const searchTerm = elements.searchPlace.value.trim().toLocaleLowerCase("vi");
  const status = elements.statusFilter.value;
  const sortOrder = elements.sortOrder.value;

  return state.itinerary
    .filter((entry) => entry.name.toLocaleLowerCase("vi").includes(searchTerm))
    .filter((entry) => status === "all"
      || (status === "visited" && entry.visited)
      || (status === "not-visited" && !entry.visited))
    .sort((first, second) => {
      if (sortOrder === "name-asc") {
        return first.name.localeCompare(second.name, "vi", { sensitivity: "base" });
      }
      if (sortOrder === "name-desc") {
        return second.name.localeCompare(first.name, "vi", { sensitivity: "base" });
      }
      const timeDifference = Date.parse(first.visitTime) - Date.parse(second.visitTime);
      return sortOrder === "time-desc" ? -timeDifference : timeDifference;
    });
}

function renderItinerary() {
  const filteredEntries = getFilteredEntries();
  const pageSizeValue = elements.pageSize.value;
  const pageSize = pageSizeValue === "all" ? Math.max(filteredEntries.length, 1) : Number(pageSizeValue);
  const totalPages = filteredEntries.length === 0 ? 0 : Math.ceil(filteredEntries.length / pageSize);
  currentPage = totalPages === 0 ? 1 : Math.min(currentPage, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleEntries = pageSizeValue === "all"
    ? filteredEntries
    : filteredEntries.slice(startIndex, startIndex + pageSize);

  elements.itineraryList.replaceChildren();
  if (visibleEntries.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = state.itinerary.length === 0
      ? "Chưa có điểm đến nào. Hãy thêm điểm dừng đầu tiên nhé!"
      : "Không tìm thấy điểm đến phù hợp với lựa chọn này.";
    elements.itineraryList.append(emptyState);
  } else {
    visibleEntries.forEach((entry) => elements.itineraryList.append(createEntryElement(entry)));
  }

  const firstVisible = filteredEntries.length === 0 ? 0 : startIndex + 1;
  const lastVisible = Math.min(startIndex + visibleEntries.length, filteredEntries.length);
  elements.pageSummary.textContent = filteredEntries.length === 0
    ? `${state.itinerary.length} địa điểm`
    : `${firstVisible}–${lastVisible} / ${filteredEntries.length} địa điểm`;
  elements.pageIndicator.textContent = totalPages === 0 ? "0 / 0" : `${currentPage} / ${totalPages}`;
  elements.previousPage.disabled = currentPage <= 1 || totalPages === 0;
  elements.nextPage.disabled = currentPage >= totalPages || totalPages === 0;
}

function resetToFirstPage() {
  currentPage = 1;
  renderItinerary();
}

function updateCountdown() {
  const departureDate = state.departureDate;
  if (!departureDate) {
    elements.countdownReadout.textContent = "Chọn ngày khởi hành để bắt đầu đếm ngược.";
    return;
  }

  const targetTime = new Date(`${departureDate}T00:00:00`).getTime();
  const remaining = targetTime - Date.now();
  if (remaining <= 0) {
    elements.countdownReadout.textContent = "Đã đến ngày khởi hành!";
    return;
  }

  const seconds = Math.floor(remaining / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const leftoverSeconds = seconds % 60;
  elements.countdownReadout.textContent = `${days} ngày : ${String(hours).padStart(2, "0")} giờ : ${String(minutes).padStart(2, "0")} phút : ${String(leftoverSeconds).padStart(2, "0")} giây`;
}

function exportItinerary() {
  const lines = [
    "WEATHER & TRAVEL PLANNER — LỊCH TRÌNH",
    `Ngày xuất: ${new Intl.DateTimeFormat("vi-VN", { dateStyle: "full" }).format(new Date())}`,
    `Thành phố đang xem thời tiết: ${cities.find((city) => city.id === state.cityId)?.name ?? "Chưa chọn"}`,
    "",
    ...state.itinerary.map((entry, index) => {
      const visitTime = new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "full",
        timeStyle: "short"
      }).format(new Date(entry.visitTime));
      return `${index + 1}. ${entry.name}\n   Thời gian: ${visitTime}\n   Trạng thái: ${entry.visited ? "Đã đến" : "Chưa đến"}`;
    })
  ];
  if (state.itinerary.length === 0) {
    lines.push("Chưa có địa điểm nào trong lịch trình.");
  }

  const file = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const downloadUrl = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `lich-trinh-du-lich-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}

function createEntryId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

elements.citySelect.addEventListener("change", () => {
  state.cityId = elements.citySelect.value;
  renderWeather();
  saveState();
});

elements.departureDate.addEventListener("change", () => {
  state.departureDate = elements.departureDate.value;
  updateCountdown();
  saveState();
});

elements.itineraryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = elements.placeName.value.trim();
  const visitTime = elements.visitTime.value;
  if (!name || Number.isNaN(Date.parse(visitTime))) {
    showMessage("Vui lòng nhập tên địa điểm và thời gian ghé thăm hợp lệ.");
    return;
  }

  state.itinerary.push({
    id: createEntryId(),
    name,
    visitTime,
    visited: false
  });
  saveState();
  elements.itineraryForm.reset();
  resetToFirstPage();
  elements.placeName.focus();
});

elements.itineraryList.addEventListener("change", (event) => {
  if (!(event.target instanceof HTMLInputElement) || event.target.dataset.action !== "toggle") {
    return;
  }
  const item = event.target.closest(".itinerary-item");
  const entry = state.itinerary.find((place) => place.id === item?.dataset.id);
  if (!entry) {
    return;
  }
  entry.visited = event.target.checked;
  saveState();
  resetToFirstPage();
});

elements.itineraryList.addEventListener("click", (event) => {
  if (!(event.target instanceof HTMLButtonElement) || event.target.dataset.action !== "delete") {
    return;
  }
  const item = event.target.closest(".itinerary-item");
  const id = item?.dataset.id;
  if (!item || !id || item.classList.contains("is-removing")) {
    return;
  }
  item.classList.add("is-removing");
  item.querySelectorAll("button, input").forEach((control) => {
    control.disabled = true;
  });
  window.setTimeout(() => {
    state.itinerary = state.itinerary.filter((entry) => entry.id !== id);
    saveState();
    renderItinerary();
  }, EXIT_ANIMATION_MS);
});

elements.searchPlace.addEventListener("input", resetToFirstPage);
elements.statusFilter.addEventListener("change", resetToFirstPage);
elements.sortOrder.addEventListener("change", resetToFirstPage);
elements.pageSize.addEventListener("change", resetToFirstPage);

elements.previousPage.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage -= 1;
    renderItinerary();
  }
});

elements.nextPage.addEventListener("click", () => {
  currentPage += 1;
  renderItinerary();
});

elements.exportButton.addEventListener("click", exportItinerary);

loadState();
elements.departureDate.value = state.departureDate;
renderWeather();
renderItinerary();
updateCountdown();
window.setInterval(updateCountdown, 1000);
