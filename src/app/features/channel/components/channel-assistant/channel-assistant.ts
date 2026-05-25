import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { getHttpErrorMessage } from '../../../../core/http/problem-details';
import type {
  ChannelReplyButton,
  ChannelUiBlock,
  EntryTicket,
  ExitTicket,
} from '../../../../core/models/api.types';
import { ChannelService } from '../../../../core/services/channel';
import { ParkingTicketPrint } from '../../../../shared/components/parking-ticket-print/parking-ticket-print';
import { ChannelUiBlocks } from '../channel-ui-blocks/channel-ui-blocks';

type ChatMessage = {
  role: 'user' | 'bot';
  text: string;
  uiBlocks?: ChannelUiBlock[];
  buttons?: ChannelReplyButton[];
};

@Component({
  selector: 'app-channel-assistant',
  imports: [CommonModule, ReactiveFormsModule, ChannelUiBlocks, ParkingTicketPrint],
  templateUrl: './channel-assistant.html',
  styleUrl: './channel-assistant.scss',
})
export class ChannelAssistant {
  private readonly channel = inject(ChannelService);
  private readonly fb = inject(FormBuilder);

  protected readonly messages = signal<ChatMessage[]>([
    {
      role: 'bot',
      text: 'Asistente SISPARK listo. Escribe ayuda o usa los atajos para consultar la operacion.',
    },
  ]);

  protected readonly isSending = signal(false);
  protected readonly error = signal('');
  protected readonly ticketForPrint = signal<{
    mode: 'entry' | 'exit';
    entry?: EntryTicket;
    exit?: ExitTicket;
  } | null>(null);
  private readonly ticketPrint = viewChild(ParkingTicketPrint);

  protected readonly messageForm = this.fb.nonNullable.group({
    text: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  protected readonly quickCommands = [
    { label: 'Ayuda', text: 'ayuda' },
    { label: 'Activos', text: 'activos' },
    { label: 'Cupos', text: 'cupos' },
    { label: 'Tarifas', text: 'tarifas' },
    { label: 'Resumen', text: 'resumen' },
  ];

  protected sendQuickCommand(text: string): void {
    this.dispatch(text);
  }

  protected submitMessage(): void {
    if (this.messageForm.invalid) {
      this.messageForm.markAllAsTouched();
      return;
    }

    const { text } = this.messageForm.getRawValue();
    this.messageForm.reset();
    this.dispatch(text);
  }

  protected onReplyButton(buttonId: string, title: string): void {
    this.appendUserMessage(title);
    this.dispatch(title, buttonId);
  }

  private dispatch(text: string, buttonId?: string): void {
    if (!buttonId) {
      this.appendUserMessage(text);
    }

    this.isSending.set(true);
    this.error.set('');

    this.channel.sendMessage(text, buttonId).subscribe({
      next: (response) => {
        this.isSending.set(false);
        this.appendBotMessage(response.text, response.uiBlocks, response.buttons);
      },
      error: (err: HttpErrorResponse) => {
        this.isSending.set(false);
        this.error.set(getHttpErrorMessage(err, 'No fue posible procesar el mensaje del asistente.'));
      },
    });
  }

  private appendUserMessage(text: string): void {
    this.messages.update((items) => [...items, { role: 'user', text }]);
  }

  private appendBotMessage(
    text: string,
    uiBlocks: ChannelUiBlock[] = [],
    buttons: ChannelReplyButton[] = [],
  ): void {
    this.messages.update((items) => [
      ...items,
      { role: 'bot', text, uiBlocks, buttons },
    ]);

    this.tryPrintFromUiBlocks(uiBlocks);
  }

  private tryPrintFromUiBlocks(uiBlocks: ChannelUiBlock[]): void {
    const entryBlock = uiBlocks.find((block) => block.type === 'entry_ticket_print');
    if (entryBlock) {
      this.ticketForPrint.set({ mode: 'entry', entry: this.mapEntryTicket(entryBlock.props) });
      queueMicrotask(() => this.ticketPrint()?.print());
      return;
    }

    const exitBlock = uiBlocks.find((block) => block.type === 'exit_ticket_print');
    if (exitBlock) {
      this.ticketForPrint.set({ mode: 'exit', exit: this.mapExitTicket(exitBlock.props) });
      queueMicrotask(() => this.ticketPrint()?.print());
    }
  }

  private mapEntryTicket(props: Record<string, unknown>): EntryTicket {
    return {
      registrationId: Number(props['registrationId'] ?? 0),
      plate: String(props['plate'] ?? ''),
      entryAt: String(props['entryAt'] ?? ''),
      parkingLotName: String(props['parkingLotName'] ?? ''),
      address: String(props['address'] ?? ''),
      phone: String(props['phone'] ?? ''),
      mobilePhone: String(props['mobilePhone'] ?? ''),
      vehicleType: String(props['vehicleType'] ?? ''),
      serviceType: String(props['serviceType'] ?? ''),
      operatorName: String(props['operatorName'] ?? ''),
      rateValue: Number(props['rateValue'] ?? 0),
      fractionMinutes: Number(props['fractionMinutes'] ?? 60),
      rateName: String(props['rateName'] ?? ''),
    };
  }

  private mapExitTicket(props: Record<string, unknown>): ExitTicket {
    return {
      registrationId: Number(props['registrationId'] ?? 0),
      plate: String(props['plate'] ?? ''),
      entryAt: String(props['entryAt'] ?? ''),
      exitAt: String(props['exitAt'] ?? ''),
      minutesConsumed: Number(props['minutesConsumed'] ?? 0),
      totalToPay: Number(props['totalToPay'] ?? 0),
      parkingLotName: String(props['parkingLotName'] ?? ''),
      address: String(props['address'] ?? ''),
      phone: String(props['phone'] ?? ''),
      mobilePhone: String(props['mobilePhone'] ?? ''),
      vehicleType: String(props['vehicleType'] ?? ''),
      serviceType: String(props['serviceType'] ?? ''),
      operatorName: String(props['operatorName'] ?? ''),
      rateValue: Number(props['rateValue'] ?? 0),
      fractionMinutes: Number(props['fractionMinutes'] ?? 60),
      rateName: String(props['rateName'] ?? ''),
    };
  }
}
