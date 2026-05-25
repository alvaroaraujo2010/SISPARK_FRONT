import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  ChannelWebMessageResponse,
  CreateWhatsAppLinkPayload,
  WhatsAppOperatorLink,
} from '../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private readonly http = inject(HttpClient);
  private readonly webUrl = `${environment.apiBaseUrl}/channels/web`;
  private readonly adminUrl = `${environment.apiBaseUrl}/admin/channel`;

  sendMessage(text: string, buttonId?: string): Observable<ChannelWebMessageResponse> {
    return this.http.post<ChannelWebMessageResponse>(`${this.webUrl}/message`, {
      text,
      buttonId: buttonId ?? null,
    });
  }

  listWhatsAppLinks(): Observable<WhatsAppOperatorLink[]> {
    return this.http.get<WhatsAppOperatorLink[]>(`${this.adminUrl}/whatsapp-links`);
  }

  createWhatsAppLink(payload: CreateWhatsAppLinkPayload): Observable<WhatsAppOperatorLink> {
    return this.http.post<WhatsAppOperatorLink>(`${this.adminUrl}/whatsapp-links`, payload);
  }

  deleteWhatsAppLink(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/whatsapp-links/${id}`);
  }

  /** Solo desarrollo: simula mensaje WhatsApp contra el webhook (requiere X-Channel-Api-Key en environment). */
  simulateWhatsApp(
    waId: string,
    text: string,
    apiKey: string,
    sendReply = false,
  ): Observable<ChannelWebMessageResponse> {
    return this.http.post<ChannelWebMessageResponse>(
      `${environment.apiBaseUrl}/webhooks/whatsapp/simulate`,
      { waId, text, sendReply },
      { headers: { 'X-Channel-Api-Key': apiKey } },
    );
  }
}
