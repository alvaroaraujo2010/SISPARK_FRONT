import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { getHttpErrorMessage } from '../../../../core/http/problem-details';
import type { WhatsAppOperatorLink } from '../../../../core/models/api.types';
import { environment } from '../../../../../environments/environment';
import { ChannelService } from '../../../../core/services/channel';

@Component({
  selector: 'app-channel-whatsapp-links',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './channel-whatsapp-links.html',
  styleUrl: './channel-whatsapp-links.scss',
})
export class ChannelWhatsappLinks {
  private readonly channel = inject(ChannelService);
  private readonly fb = inject(FormBuilder);

  protected readonly linksResource = rxResource<WhatsAppOperatorLink[], undefined>({
    stream: () => this.channel.listWhatsAppLinks(),
  });

  protected readonly isSaving = signal(false);
  protected readonly feedback = signal('');
  protected readonly error = signal('');

  protected readonly devApiKey = environment.channelDevApiKey ?? '';
  protected readonly simulateText = signal('ayuda');
  protected readonly simulateResult = signal('');

  protected readonly linkForm = this.fb.nonNullable.group({
    waId: ['', [Validators.required, Validators.maxLength(20)]],
    userId: [0, [Validators.required, Validators.min(1)]],
  });

  protected submitLink(): void {
    if (this.linkForm.invalid) {
      this.linkForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.feedback.set('');
    this.error.set('');

    const payload = this.linkForm.getRawValue();
    this.channel.createWhatsAppLink(payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.feedback.set('Vinculo de WhatsApp creado correctamente.');
        this.linkForm.reset({ waId: '', userId: 0 });
        this.linksResource.reload();
      },
      error: (err: HttpErrorResponse) => {
        this.isSaving.set(false);
        this.error.set(getHttpErrorMessage(err, 'No fue posible crear el vinculo.'));
      },
    });
  }

  protected runSimulate(waId: string): void {
    if (!this.devApiKey || !waId.trim()) {
      this.error.set('Configura channelDevApiKey y un wa_id vinculado para simular.');
      return;
    }

    this.channel.simulateWhatsApp(waId, this.simulateText(), this.devApiKey).subscribe({
      next: (response) => {
        this.simulateResult.set(response.text);
        this.feedback.set('Simulacion WhatsApp completada.');
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(getHttpErrorMessage(err, 'Fallo la simulacion de WhatsApp.'));
      },
    });
  }

  protected removeLink(id: number): void {
    this.channel.deleteWhatsAppLink(id).subscribe({
      next: () => {
        this.feedback.set('Vinculo eliminado.');
        this.linksResource.reload();
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(getHttpErrorMessage(err, 'No fue posible eliminar el vinculo.'));
      },
    });
  }
}
