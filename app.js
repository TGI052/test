const modes = document.querySelectorAll(".mode");
const modeLabel = document.querySelector("#modeLabel");
const timeLeft = document.querySelector("#timeLeft");
const startPause = document.querySelector("#startPause");
const reset = document.querySelector("#reset");
const progress = document.querySelector(".progress");
const customForm = document.querySelector("#customForm");
const customMinutes = document.querySelector("#customMinutes");
const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const taskList = document.querySelector("#taskList");
const taskCount = document.querySelector("#taskCount");

const ringLength = 2 * Math.PI * 96;
progress.style.strokeDasharray = ringLength;

let totalSeconds = 25 * 60;
let remainingSeconds = totalSeconds;
let timerId = null;
let activeModeName = "专注时间";
let tasks = loadTasks();

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
}

function renderTimer() {
  timeLeft.textContent = formatTime(remainingSeconds);
  modeLabel.textContent = activeModeName;

  const ratio = remainingSeconds / totalSeconds;
  progress.style.strokeDashoffset = ringLength * (1 - ratio);
  document.title = `${formatTime(remainingSeconds)} - 轻量番茄钟`;
}

function setMode(button) {
  stopTimer();
  modes.forEach((mode) => mode.classList.remove("active"));
  button.classList.add("active");
  customMinutes.value = "";

  const minutes = Number(button.dataset.minutes);
  totalSeconds = minutes * 60;
  remainingSeconds = totalSeconds;
  activeModeName = `${button.textContent}时间`;
  renderTimer();
}

function setCustomDuration(minutes) {
  stopTimer();
  modes.forEach((mode) => mode.classList.remove("active"));

  totalSeconds = minutes * 60;
  remainingSeconds = totalSeconds;
  activeModeName = `自定义 ${minutes} 分钟`;
  renderTimer();
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
  startPause.textContent = "开始";
}

function tick() {
  remainingSeconds -= 1;
  renderTimer();

  if (remainingSeconds <= 0) {
    stopTimer();
    remainingSeconds = totalSeconds;
    renderTimer();
    alert("时间到。");
  }
}

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem("tinyPomodoroTasks")) || [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem("tinyPomodoroTasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-item${task.done ? " done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", `完成 ${task.text}`);
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const label = document.createElement("span");
    label.textContent = task.text;

    const remove = document.createElement("button");
    remove.className = "delete-task";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `删除 ${task.text}`);
    remove.addEventListener("click", () => {
      tasks = tasks.filter((itemTask) => itemTask.id !== task.id);
      saveTasks();
      renderTasks();
    });

    item.append(checkbox, label, remove);
    taskList.append(item);
  });

  const done = tasks.filter((task) => task.done).length;
  taskCount.textContent = `${done}/${tasks.length}`;
}

modes.forEach((button) => {
  button.addEventListener("click", () => setMode(button));
});

startPause.addEventListener("click", () => {
  if (timerId) {
    stopTimer();
    return;
  }

  startPause.textContent = "暂停";
  timerId = setInterval(tick, 1000);
});

reset.addEventListener("click", () => {
  stopTimer();
  remainingSeconds = totalSeconds;
  renderTimer();
});

customForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const minutes = Number(customMinutes.value);

  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) {
    customMinutes.setCustomValidity("请输入 1 到 180 之间的整数分钟。");
    customMinutes.reportValidity();
    return;
  }

  customMinutes.setCustomValidity("");
  setCustomDuration(minutes);
});

customMinutes.addEventListener("input", () => {
  customMinutes.setCustomValidity("");
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.unshift({
    id: crypto.randomUUID(),
    text,
    done: false,
  });
  taskInput.value = "";
  saveTasks();
  renderTasks();
});

renderTimer();
renderTasks();
