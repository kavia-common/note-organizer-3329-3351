import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [CommonModule, FormsModule]
})
export class AppComponent {
  title = 'Note Organizer';

  notes: Note[] = [];
  filteredNotes: Note[] = [];
  selectedNote: Note | null = null;
  searchText: string = '';
  isCreating: boolean = false;

  // Utility: Return localStorage only if available (browser context)
  getSafeLocalStorage(): Storage | undefined {
    return (typeof globalThis !== 'undefined' && 'localStorage' in globalThis)
      ? (globalThis.localStorage as Storage)
      : undefined;
  }

  // PUBLIC_INTERFACE
  ngOnInit() {
    this.loadInitialNotes();
  }

  // PUBLIC_INTERFACE
  loadInitialNotes() {
    let notes: Note[] = [];
    const safeLS = this.getSafeLocalStorage();
    if (safeLS) {
      notes = JSON.parse(safeLS.getItem('notes') || '[]');
    }
    this.notes = notes;
    this.filteredNotes = notes;
    this.selectedNote = notes.length ? notes[0] : null;
  }

  // PUBLIC_INTERFACE
  selectNote(note: Note) {
    this.selectedNote = { ...note };
    this.isCreating = false;
  }

  // PUBLIC_INTERFACE
  createNote() {
    this.selectedNote = {
      id: Date.now(),
      title: '',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.isCreating = true;
  }

  // PUBLIC_INTERFACE
  saveNote(note: Note) {
    if (this.isCreating) {
      this.notes.unshift({
        ...note,
        updatedAt: new Date().toISOString()
      });
    } else {
      this.notes = this.notes.map(n => n.id === note.id ? {
        ...n,
        ...note,
        updatedAt: new Date().toISOString()
      } : n);
    }
    this.isCreating = false;
    this.selectedNote = { ...note, updatedAt: new Date().toISOString() };
    const safeLS = this.getSafeLocalStorage();
    if (safeLS) {
      safeLS.setItem('notes', JSON.stringify(this.notes));
    }
    this.applyFilter();
  }

  // PUBLIC_INTERFACE
  deleteNote(note: Note) {
    const idx = this.notes.findIndex(n => n.id === note.id);
    if (idx > -1) {
      this.notes.splice(idx, 1);
      const safeLS = this.getSafeLocalStorage();
      if (safeLS) {
        safeLS.setItem('notes', JSON.stringify(this.notes));
      }
      this.applyFilter();
      if (this.selectedNote && this.selectedNote.id === note.id) {
        this.selectedNote = this.filteredNotes[0] || null;
        this.isCreating = false;
      }
    }
  }

  // PUBLIC_INTERFACE
  applyFilter() {
    const filter = this.searchText.trim().toLowerCase();
    if (!filter) {
      this.filteredNotes = [...this.notes];
    } else {
      this.filteredNotes = this.notes.filter(note =>
        note.title.toLowerCase().includes(filter) ||
        note.content.toLowerCase().includes(filter)
      );
    }
  }

  // PUBLIC_INTERFACE
  onSearchChange() {
    this.applyFilter();
    if (this.filteredNotes.length && (!this.selectedNote || !this.filteredNotes.some(n => n.id === this.selectedNote?.id))) {
      this.selectedNote = this.filteredNotes[0];
      this.isCreating = false;
    }
    if (this.filteredNotes.length === 0) {
      this.selectedNote = null;
      this.isCreating = false;
    }
  }
}

export interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
