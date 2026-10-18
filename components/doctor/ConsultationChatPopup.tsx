"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetAppointmentConversationQuery,
  useGetConversationMessagesQuery,
  useSendConversationMessageMutation,
} from "@/redux/api/doctorApi";
import { extractList, normalizeConversation } from "@/types/doctor";
import type { ChatMessage } from "@/types/doctor";
import { formatDateTime, getApiErrorMessage } from "@/lib/doctor/utils";
import { useAppSelector } from "@/redux/hooks";
import { useDecodedToken } from "@/src/hooks/useDecodedToken";

interface ConsultationChatPopupProps {
  appointmentId: string;
}

/**
 * Post-consultation chat popup for a COMPLETED appointment.
 *
 * Fallback implementation: the shared chat popup from Frontend Developer 1
 * (Arafat Hossen Joni) was not present on this branch, so this widget uses the
 * real chat contract directly
 * (`GET /appointments/{id}/conversation`, `GET|POST /conversations/{id}/messages`)
 * and can be swapped for the shared component once it lands.
 */
export function ConsultationChatPopup({ appointmentId }: ConsultationChatPopupProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const token = useAppSelector((state) => state.auth.token);
  const decoded = useDecodedToken(token);
  const currentUserId = typeof decoded?.id === "string" ? decoded.id : undefined;

  const {
    data: conversationData,
    isLoading: conversationLoading,
    isError: conversationError,
    error: conversationErr,
  } = useGetAppointmentConversationQuery(appointmentId, { skip: !open });

  const conversation = useMemo(
    () => normalizeConversation(conversationData) ?? undefined,
    [conversationData]
  );

  const {
    data: messagesData,
    isLoading: messagesLoading,
    isError: messagesError,
    error: messagesErr,
  } = useGetConversationMessagesQuery(
    { conversationId: conversation?.conversationId as string, limit: 50 },
    { skip: !conversation?.conversationId, pollingInterval: open ? 8000 : 0 }
  );

  const messages = useMemo(
    () => extractList<ChatMessage>(messagesData?.data ?? messagesData),
    [messagesData]
  );

  const [sendMessage, sendState] = useSendConversationMessageMutation();

  // `Date.now()` must not run during render (react-hooks/purity); refresh it on
  // mount and once per minute so the expiry state stays accurate.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    // Defer the first tick (async) so we never setState synchronously in an effect.
    const initial = setTimeout(tick, 0);
    const timer = setInterval(tick, 60_000);
    return () => {
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, []);

  const windowExpired =
    conversation?.expiresAt && now !== null
      ? new Date(conversation.expiresAt).getTime() < now
      : false;

  async function handleSend() {
    const content = draft.trim();
    if (!content || !conversation?.conversationId) return;
    try {
      await sendMessage({ conversationId: conversation.conversationId, content }).unwrap();
      setDraft("");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Message could not be sent."));
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 print:hidden">
      {open ? (
        <div className="flex h-[28rem] w-80 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:w-96">
          <div className="flex items-center justify-between border-b border-slate-100 bg-[#0F888D] px-4 py-3 text-white">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Consultation chat</p>
              <p className="truncate text-[11px] text-white/80">
                {windowExpired
                  ? "Chat window expired"
                  : conversation?.expiresAt
                    ? `Open until ${formatDateTime(conversation.expiresAt)}`
                    : "7-day post-consultation window"}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 hover:bg-white/15"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3">
            {conversationLoading && (
              <div className="space-y-2">
                <Skeleton className="h-10 w-2/3" />
                <Skeleton className="ml-auto h-10 w-2/3" />
              </div>
            )}

            {conversationError && (
              <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
                {getApiErrorMessage(conversationErr, "Chat is unavailable for this consultation.")}
              </p>
            )}

            {!conversationLoading && !conversationError && !conversation && (
              <p className="rounded-lg bg-white p-3 text-center text-xs text-slate-500">
                No conversation channel yet. Chat opens once the consultation is
                completed.
              </p>
            )}

            {conversation && messagesLoading && (
              <div className="space-y-2">
                <Skeleton className="h-10 w-2/3" />
                <Skeleton className="ml-auto h-10 w-2/3" />
              </div>
            )}

            {conversation && messagesError && (
              <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
                {getApiErrorMessage(messagesErr, "Could not load messages.")}
              </p>
            )}

            {conversation && !messagesLoading && !messagesError && messages.length === 0 && (
              <p className="rounded-lg bg-white p-3 text-center text-xs text-slate-500">
                No messages yet. Say hello to your patient.
              </p>
            )}

            {messages.map((message) => {
              const isMine = currentUserId !== undefined && message.senderId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    isMine
                      ? "ml-auto bg-[#0F888D] text-white"
                      : "bg-white text-slate-700"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  {message.sentAt && (
                    <p
                      className={`mt-1 text-[10px] ${
                        isMine ? "text-white/70" : "text-slate-400"
                      }`}
                    >
                      {formatDateTime(message.sentAt)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-100 p-3">
            {windowExpired ? (
              <p className="text-center text-xs text-slate-400">
                This chat window has closed. Messages remain readable for records.
              </p>
            ) : (
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSend();
                }}
              >
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message…"
                  disabled={!conversation?.conversationId || sendState.isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!conversation?.conversationId || !draft.trim() || sendState.isLoading}
                  className="bg-[#0F888D] hover:bg-[#0C7479]"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </Button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <Button
          type="button"
          onClick={() => setOpen(true)}
          className="h-12 rounded-full bg-[#0F888D] px-5 text-white shadow-lg hover:bg-[#0C7479]"
        >
          <MessageCircle size={18} /> Chat with patient
        </Button>
      )}
    </div>
  );
}
