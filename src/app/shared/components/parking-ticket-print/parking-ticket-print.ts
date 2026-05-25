import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { ColombiaDatePipe } from '../../../core/date/colombia-date.pipe';
import type { EntryTicket, ExitTicket } from '../../../core/models/api.types';

export type ParkingTicketMode = 'entry' | 'exit';

const PRINT_STYLES = `
  @page { size: 80mm auto; margin: 4mm; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body {
    font-family: 'Segoe UI', Tahoma, sans-serif;
    font-size: 12px;
    color: #111;
  }
  .entry-ticket { width: 72mm; padding: 2mm 3mm; box-sizing: border-box; }
  .entry-ticket__header {
    text-align: center;
    border-bottom: 1px dashed #333;
    padding-bottom: 0.65rem;
    margin-bottom: 0.65rem;
  }
  .entry-ticket__header strong {
    display: block;
    font-size: 14px;
    text-transform: uppercase;
  }
  .entry-ticket__header span {
    display: block;
    margin-top: 0.25rem;
    line-height: 1.35;
  }
  .entry-ticket__title {
    text-align: center;
    font-weight: 800;
    letter-spacing: 0.04em;
    margin: 0 0 0.75rem;
  }
  .entry-ticket__rows { margin: 0; }
  .entry-ticket__rows div {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.2rem 0;
    border-bottom: 1px dotted #ccc;
  }
  .entry-ticket__rows dt { margin: 0; font-weight: 600; }
  .entry-ticket__rows dd { margin: 0; text-align: right; }
  .entry-ticket__plate {
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 0.08em;
  }
  .entry-ticket__footer {
    margin-top: 0.85rem;
    text-align: center;
    font-size: 11px;
    line-height: 1.35;
  }
`;

@Component({
  selector: 'app-parking-ticket-print',
  imports: [CommonModule, CurrencyPipe, ColombiaDatePipe],
  templateUrl: './parking-ticket-print.html',
  styleUrl: './parking-ticket-print.scss',
})
export class ParkingTicketPrint {
  readonly mode = input.required<ParkingTicketMode>();
  readonly entryTicket = input<EntryTicket | null>(null);
  readonly exitTicket = input<ExitTicket | null>(null);

  protected readonly rateLabel = computed(() => {
    const ticket = this.mode() === 'entry' ? this.entryTicket() : this.exitTicket();
    if (!ticket) {
      return '';
    }

    const minutes = ticket.fractionMinutes;
    const unit = minutes >= 60 ? `${minutes / 60} h` : `${minutes} min`;
    return `${ticket.rateName}: ${ticket.rateValue.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })} / ${unit}`;
  });

  print(): void {
    const ticket = document.getElementById('parking-ticket-print-area');
    if (!ticket) {
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.setAttribute('title', 'Impresion tirilla SISPARK');
    iframe.style.cssText =
      'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';

    const cleanup = (): void => {
      iframe.remove();
    };

    document.body.appendChild(iframe);
    const doc = iframe.contentDocument;
    const frameWindow = iframe.contentWindow;
    if (!doc || !frameWindow) {
      cleanup();
      return;
    }

    doc.open();
    doc.write(
      `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Tirilla SISPARK</title><style>${PRINT_STYLES}</style></head><body>${ticket.outerHTML}</body></html>`,
    );
    doc.close();

    frameWindow.addEventListener('afterprint', cleanup, { once: true });
    globalThis.setTimeout(cleanup, 15_000);

    globalThis.requestAnimationFrame(() => {
      frameWindow.focus();
      frameWindow.print();
    });
  }
}
