export default class NotesView {
  constructor(root, { onNoteAdd, onNoteSelect, onNoteDelete, onNoteEdit } = {}) {
    this.root = root;
    this.onNoteSelect = onNoteSelect;
    this.onNoteAdd = onNoteAdd;
    this.onNoteEdit = onNoteEdit;
    this.onNoteDelete = onNoteDelete;
    this.root.innerHTML = `
      <div class="notes__sidebar">
        <button class="notes__add" type="button">Add Note</button>
        <div class="notes__list"></div>
      </div>
      <div class="notes__preview">
        <input class="notes__title" type="text" placeholder="New Note...">
        <textarea class="notes__body">Take Note...</textarea>
      </div>
    `;

    const btnAddNote = this.root.querySelector(".notes__add");
    const inputTitle = this.root.querySelector(".notes__title");
    const inputBody = this.root.querySelector(".notes__body");

    btnAddNote.addEventListener("click", () => {
      this.onNoteAdd();
    });

    [inputTitle, inputBody].forEach((inputField) => {
      inputField.addEventListener("blur", () => {
        const updatedTitle = inputTitle.value.trim();
        const updatedBody = inputBody.value.trim();

        this.onNoteEdit(updatedTitle, updatedBody);
      });
    });

    // TODO: hide the note preview by default
    this.updateNotePreviewVisibility(false);
  }

  _createListItemHTML(id, title, body, updated) {
    const MAX_BODY_LENGTH = 60;

    return `
      <div class="notes__list-item" data-note-id="${id}">
        <div class="notes__small-title">${title}</div>
        <div class="notes__small-body">
          ${body.substring(0, MAX_BODY_LENGTH)}
          ${body.length > MAX_BODY_LENGTH ? "..." : ""}
        </div>
        <div class="notes__small-updated">
          ${updated.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}
        </div>
      </div>
    `;
  }

  updateNoteList(notes) {
    const notesListContainer = this.root.querySelector(".notes__list");

    // Empty list
    notesListContainer.innerHTML = "";

    for (const note of notes) {
      const html = this._createListItemHTML(note.id, note.title, note.body, new Date(note.updated));

      // insertAdjacentHTML() 메서드는 HTML or XML 같은 특정 텍스트를 파싱하고,
      // 특정 위치에 DOM tree 안에 원하는 node들을 추가 한다.
      // 이미 사용중인 element는 다시 파싱하지 않는다.
      // 그러므로 element 안에 존재하는 element를 건드리지 않는다.
      // (innerHtml과는 좀 다름). innerHtml보다 작업이 덜 드므로 빠르다.
      notesListContainer.insertAdjacentHTML("beforeend", html);
    }

    // Add select/delete events for each list item
    notesListContainer.querySelectorAll(".notes__list-item").forEach((noteListItem) => {
      noteListItem.addEventListener("click", () => {
        this.onNoteSelect(noteListItem.dataset.noteId);
      });

      noteListItem.addEventListener("dblclick", () => {
        const doDelete = confirm("Are you sure you want to delete this note?");

        if (doDelete) {
          this.onNoteDelete(noteListItem.dataset.noteId);
        }
      });
    });
  }

  updateActiveNote(note) {
    this.root.querySelector(".notes__title").value = note.title;
    this.root.querySelector(".notes__body").value = note.body;

    this.root.querySelectorAll(".notes__list-item").forEach((noteListItem) => {
      noteListItem.classList.remove("notes__list-item--selected");
    });

    this.root.querySelector(`.notes__list-item[data-note-id="${note.id}"]`).classList.add("notes__list-item--selected");
  }

  updateNotePreviewVisibility(visible) {
    this.root.querySelector(".notes__preview").style.visibility = visible ? "visible" : "hidden";
  }
}
