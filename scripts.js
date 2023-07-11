/**
 * A handler that fires when a user drags over any element inside a column. In
 * order to determine which column the user is dragging over the entire event
 * bubble path is checked with `event.path` (or `event.composedPath()` for
 * browsers that don't support `event.path`). The bubbling path is looped over
 * until an element with a `data-area` attribute is found. Once found both the
 * active dragging column is set in the `state` object in "data.js" and the HTML
 * is updated to reflect the new column.
 *
 * @param {Event} event 
 */
const handleDragOver = (event) => {
  event.preventDefault();
  const path = event.path || event.composedPath();
  let column = null;

  for (const element of path) {
    const { area } = element.dataset;
    if (area) {
      column = area;
      break;
    }
  }

  if (!column) return;
  updateDragging({ over: column });
  updateDraggingHtml({ over: column });
};

const handleDragStart = (event) => {
  const orderId = event.target.dataset.id;
  event.dataTransfer.setData("text/plain", orderId);
  updateDragging({ dragging: orderId });
  updateDraggingHtml({ dragging: orderId });
};

const handleDragEnd = (event) => {
  updateDragging({ dragging: null });
  updateDraggingHtml({ dragging: null });
};

const handleHelpToggle = (event) => {
  html.help.overlay.classList.toggle("open");
  if (html.help.overlay.classList.contains("open")) {
    html.help.overlay.focus();
  } else {
    html.add.button.focus();
  }
};

const handleAddToggle = (event) => {
  html.add.overlay.classList.toggle("open");
  html.add.input.value = "";
  html.add.table.value = "";
  if (html.add.overlay.classList.contains("open")) {
    html.add.input.focus();
  } else {
    html.add.button.focus();
  }
};

const handleAddSubmit = (event) => {
  event.preventDefault();
  const text = html.add.input.value.trim();
  const table = html.add.table.value.trim();
  if (text && table) {
    const newOrder = {
      id: generateId(),
      text,
      table
    };
    addOrder(newOrder);
    updateDragging({ over: null });
    updateDraggingHtml({ over: null });
    handleAddToggle();
  }
};

const handleEditToggle = (event) => {
  const orderId = event.target.dataset.id;
  const order = getOrderById(orderId);
  if (order) {
    html.edit.overlay.classList.toggle("open");
    html.edit.input.value = order.text;
    html.edit.table.value = order.table;
    html.edit.update.dataset.id = orderId;
    html.edit.update.dataset.column = order.column;
    if (html.edit.overlay.classList.contains("open")) {
      html.edit.input.focus();
    } else {
      html.add.button.focus();
    }
  }
};

const handleEditSubmit = (event) => {
  event.preventDefault();
  const orderId = event.target.dataset.id;
  const column = event.target.dataset.column;
  const text = html.edit.input.value.trim();
  const table = html.edit.table.value.trim();
  if (text && table) {
    const updatedOrder = {
      id: orderId,
      text,
      table,
      column
    };
    updateOrder(updatedOrder);
    handleEditToggle();
  }
};

const handleDelete = (event) => {
  const orderId = event.target.dataset.id;
  deleteOrder(orderId);
  handleEditToggle();
};

const handleCloseOverlay = (event) => {
  const overlay = event.target.closest(".overlay");
  overlay.classList.remove("open");
  html.add.button.focus();
};

html.add.cancel.addEventListener("click", handleAddToggle);
html.other.add.addEventListener("click", handleAddToggle);
html.add.form.addEventListener("submit", handleAddSubmit);

html.other.grid.addEventListener("click", handleEditToggle);
html.edit.cancel.addEventListener("click", handleEditToggle);
html.edit.form.addEventListener("submit", handleEditSubmit);
html.edit.delete.addEventListener("click", handleDelete);

html.help.cancel.addEventListener("click", handleHelpToggle);
html.other.help.addEventListener("click", handleHelpToggle);

const overlays = document.querySelectorAll(".overlay");
overlays.forEach((overlay) => {
  overlay.addEventListener("click", handleCloseOverlay);
});

for (const htmlColumn of Object.values(html.columns)) {
  htmlColumn.addEventListener("dragstart", handleDragStart);
  htmlColumn.addEventListener("dragend", handleDragEnd);
}

for (const htmlArea of Object.values(html.area)) {
  htmlArea.addEventListener("dragover", handleDragOver);
}
