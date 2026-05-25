import { CommonModule, DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import type { EntryTicket } from '../../../core/models/api.types';

@Component({
  selector: 'app-entry-ticket-print',
  imports: [CommonModule, DatePipe],
  templateUrl: './entry-ticket-print.html',
  styleUrl: './entry-ticket-print.scss',
})
export class EntryTicketPrint {
  readonly ticket = input.required<EntryTicket>();

  print(): void {
    globalThis.print();
  }
}
